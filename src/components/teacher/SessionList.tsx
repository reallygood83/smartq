'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Session } from '@/lib/utils'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue, remove } from 'firebase/database'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export default function SessionList() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const sessionsRef = ref(database, 'sessions')
    const userSessionsQuery = query(sessionsRef, orderByChild('teacherId'), equalTo(user.uid))

    const unsubscribe = onValue(userSessionsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const sessionsList = Object.values(data) as Session[]
        // 최신순으로 정렬
        sessionsList.sort((a, b) => b.createdAt - a.createdAt)
        setSessions(sessionsList)
      } else {
        setSessions([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`정말로 "${sessionTitle}" 세션을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 질문과 분석 결과가 함께 삭제됩니다.`)) {
      return
    }

    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setDeletingSessionId(sessionId)

    try {
      // 순차적으로 삭제하여 보안 규칙 충돌 방지
      const deleteOperations = [
        { name: '피드백 분석 결과', path: `feedbackAnalyses/${sessionId}` },
        { name: '멘토링 매칭', path: `mentorshipMatches/${sessionId}` },
        { name: '멘토십 프로필', path: `mentorshipProfiles/${sessionId}` },
        { name: '피드백 응답', path: `feedbackResponses/${sessionId}` },
        { name: '피드백 요청', path: `feedbackRequests/${sessionId}` },
        { name: '공유 콘텐츠', path: `sharedContents/${sessionId}` },
        { name: '질문', path: `questions/${sessionId}` },
        { name: '세션', path: `sessions/${sessionId}` }
      ]

      console.log('세션 삭제 시작:', sessionId)

      let deletionErrors = []
      
      // 순차적으로 삭제 실행
      for (const operation of deleteOperations) {
        try {
          const deleteRef = ref(database, operation.path)
          await remove(deleteRef)
          console.log(`${operation.name} 삭제 완료:`, operation.path)
          
          // 작은 딜레이로 Firebase 동기화 시간 확보
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`${operation.name} 삭제 실패:`, error)
          deletionErrors.push(`${operation.name}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        }
      }

      if (deletionErrors.length > 0) {
        console.warn('일부 삭제 작업 실패:', deletionErrors)
        alert(`세션 삭제 중 일부 오류가 발생했습니다:\n${deletionErrors.join('\n')}`)
      } else {
        console.log('모든 데이터 삭제 완료:', sessionId)
        alert('세션이 성공적으로 삭제되었습니다.')
      }
      
      // 세션 목록에서 즉시 제거 (낙관적 업데이트)
      setSessions(prevSessions => prevSessions.filter(s => s.sessionId !== sessionId))
      
      // Firebase 실시간 리스너로 인해 자동으로 업데이트되지만, 확실히 하기 위해 추가 체크
      setTimeout(() => {
        setSessions(prevSessions => prevSessions.filter(s => s.sessionId !== sessionId))
      }, 1000)
      
    } catch (error) {
      console.error('세션 삭제 오류:', error)
      
      // 더 자세한 오류 메시지 제공
      let errorMessage = '세션 삭제에 실패했습니다.'
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage += '\n권한이 부족합니다. 본인이 생성한 세션만 삭제할 수 있습니다.'
        } else if (error.message.includes('network')) {
          errorMessage += '\n네트워크 연결을 확인해주세요.'
        } else {
          errorMessage += `\n오류: ${error.message}`
        }
      }
      
      alert(errorMessage)
    } finally {
      setDeletingSessionId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">세션 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 생성된 세션이 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          첫 번째 세션을 만들어 학생들과 함께 스마트한 학습을 시작해보세요.
        </p>
        <Link href="/teacher/session/create">
          <Button>
            첫 세션 만들기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {getSessionTypeIcon(session.sessionType)}
                </span>
                <h3 className="text-lg font-medium text-gray-900">
                  {session.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getSessionTypeLabel(session.sessionType)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>접속 코드: <span className="font-mono font-bold text-blue-600">{session.accessCode}</span></span>
                <span>생성일: {new Date(session.createdAt).toLocaleDateString()}</span>
              </div>

              {/* 교과목 태그 */}
              {session.subjects && session.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {session.subjects.map((subject) => (
                    <span
                      key={subject}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(subject)}`}
                    >
                      {getSubjectLabel(subject)}
                    </span>
                  ))}
                </div>
              )}

              {/* 학습 목표 */}
              {session.learningGoals && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">학습 목표:</span> {session.learningGoals}
                </p>
              )}

              {/* 키워드 */}
              {session.keywords && session.keywords.length > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">키워드:</span> {session.keywords.join(', ')}
                </p>
              )}

              {/* 성인 교육 세션 추가 정보 */}
              {session.isAdultEducation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {session.targetAudience && (
                      <div>
                        <span className="font-medium text-gray-700">대상:</span>
                        <span className="ml-1 text-gray-600">{session.targetAudience}</span>
                      </div>
                    )}
                    {session.difficultyLevel && (
                      <div>
                        <span className="font-medium text-gray-700">난이도:</span>
                        <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          session.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                          session.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          session.difficultyLevel === 'advanced' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.difficultyLevel === 'beginner' ? '초급' :
                           session.difficultyLevel === 'intermediate' ? '중급' :
                           session.difficultyLevel === 'advanced' ? '고급' : '전문가'}
                        </span>
                      </div>
                    )}
                    {session.duration && (
                      <div>
                        <span className="font-medium text-gray-700">시간:</span>
                        <span className="ml-1 text-gray-600">{session.duration}</span>
                      </div>
                    )}
                    {session.deliveryFormat && (
                      <div>
                        <span className="font-medium text-gray-700">진행:</span>
                        <span className="ml-1 text-gray-600">
                          {session.deliveryFormat === 'in-person' ? '대면' :
                           session.deliveryFormat === 'online' ? '온라인' : '하이브리드'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Link href={`/teacher/session/${session.sessionId}`}>
                <Button size="sm">
                  세션 관리
                </Button>
              </Link>
              <Link href={`/teacher/session/edit/${session.sessionId}`}>
                <Button variant="outline" size="sm">
                  세션 수정
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const studentUrl = `${window.location.origin}/student/session/${session.accessCode}`
                  navigator.clipboard.writeText(studentUrl)
                  alert('학생 접속 링크가 클립보드에 복사되었습니다!')
                }}
              >
                링크 복사
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteSession(session.sessionId, session.title)}
                disabled={deletingSessionId === session.sessionId}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                {deletingSessionId === session.sessionId ? '삭제 중...' : '세션 삭제'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}