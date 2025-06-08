'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Session, Subject } from '@/lib/utils'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, remove } from 'firebase/database'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

interface SessionListProps {
  sessions: Session[]
  loading: boolean
  onSessionDeleted: (sessionId: string) => void
}

export default function SessionList({ sessions, loading, onSessionDeleted }: SessionListProps) {
  const { user } = useAuth()
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 세션 필터링
  const filteredSessions = sessions.filter((session) => {
    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = session.title.toLowerCase().includes(query)
      const matchesGoals = session.learningGoals?.toLowerCase().includes(query)
      const matchesKeywords = session.keywords?.some(keyword => 
        keyword.toLowerCase().includes(query)
      )
      if (!matchesTitle && !matchesGoals && !matchesKeywords) {
        return false
      }
    }

    // 교과목 필터링
    if (selectedSubjects.length > 0) {
      const hasMatchingSubject = selectedSubjects.some(subject =>
        session.subjects?.includes(subject)
      )
      if (!hasMatchingSubject) {
        return false
      }
    }

    return true
  })

  const handleSubjectFilter = (subject: Subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

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
      const { get } = await import('firebase/database')
      
      // 먼저 세션이 실제로 존재하는지 확인
      const sessionRef = ref(database, `sessions/${sessionId}`)
      const sessionSnapshot = await get(sessionRef)
      
      if (!sessionSnapshot.exists()) {
        console.log('세션이 이미 삭제되었거나 존재하지 않습니다.')
        // 목록에서 제거하고 종료
        setSessions(prevSessions => prevSessions.filter(s => s.sessionId !== sessionId))
        alert('세션이 이미 삭제되었습니다.')
        return
      }

      // 세션 데이터 확인 (권한 체크)
      const sessionData = sessionSnapshot.val()
      if (sessionData.teacherId !== user.uid) {
        alert('권한이 없습니다. 본인이 생성한 세션만 삭제할 수 있습니다.')
        return
      }

      console.log('세션 삭제 시작:', sessionId)

      // 존재하는 데이터만 삭제 (존재 여부 먼저 확인)
      const deleteOperations = [
        { name: '질문', path: `questions/${sessionId}` },
        { name: '공유 콘텐츠', path: `sharedContents/${sessionId}` },
        { name: '피드백 요청', path: `feedbackRequests/${sessionId}` },
        { name: '피드백 응답', path: `feedbackResponses/${sessionId}` },
        { name: '멘토링 매칭', path: `mentorshipMatches/${sessionId}` },
        { name: '멘토 프로필', path: `mentorProfiles/${sessionId}` },
        { name: '멘티 프로필', path: `menteeProfiles/${sessionId}` },
        { name: '피드백 분석 결과', path: `feedbackAnalyses/${sessionId}` },
        { name: '세션', path: `sessions/${sessionId}` } // 세션은 마지막에 삭제
      ]

      let deletionErrors = []
      let successfulDeletions = 0
      
      // 순차적으로 삭제 실행 (존재하는 것만)
      for (const operation of deleteOperations) {
        try {
          const deleteRef = ref(database, operation.path)
          
          // 데이터 존재 여부 확인
          const snapshot = await get(deleteRef)
          const exists = snapshot.exists()
          
          if (exists) {
            console.log(`${operation.name} 삭제 시작:`, operation.path)
            await remove(deleteRef)
            
            // 삭제 후 확인
            const verifySnapshot = await get(deleteRef)
            if (verifySnapshot.exists()) {
              throw new Error(`${operation.name} 삭제가 완료되지 않았습니다.`)
            }
            
            console.log(`${operation.name} 삭제 완료`)
            successfulDeletions++
          } else {
            console.log(`${operation.name} 데이터 없음 - 건너뜀`)
          }
          
          // Firebase 동기화를 위한 약간의 딜레이
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`${operation.name} 삭제 실패:`, error)
          deletionErrors.push(`${operation.name}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
          
          // 세션 삭제 실패는 치명적이므로 중단
          if (operation.name === '세션') {
            throw error
          }
        }
      }

      if (deletionErrors.length > 0) {
        console.warn('일부 삭제 작업 실패:', deletionErrors)
        alert(`세션 삭제 중 일부 오류가 발생했습니다:\n${deletionErrors.join('\n')}\n\n${successfulDeletions}개 항목이 성공적으로 삭제되었습니다.`)
      } else {
        console.log(`세션 삭제 완료: ${successfulDeletions}개 항목 삭제됨`)
        alert('세션이 성공적으로 삭제되었습니다.')
      }
      
      // 부모 컴포넌트에 세션 삭제 알림
      onSessionDeleted(sessionId)
      
    } catch (error) {
      console.error('세션 삭제 오류:', error)
      
      let errorMessage = '세션 삭제에 실패했습니다.'
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
          errorMessage = '권한이 부족합니다. 본인이 생성한 세션만 삭제할 수 있습니다.'
        } else if (error.message.includes('network') || error.message.includes('offline')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else {
          errorMessage += `\n\n오류 상세: ${error.message}`
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
        <div className="text-gray-500 dark:text-gray-200">세션 목록을 불러오는 중...</div>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          아직 생성된 세션이 없습니다
        </h3>
        <p className="text-gray-600 dark:text-white mb-6">
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
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="space-y-4">
        {/* 검색바 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="세션 제목, 학습 목표, 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-200"
          />
        </div>

        {/* 교과목 필터 */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-white">교과목 필터:</span>
            {Object.values(Subject).map((subject) => {
              const isSelected = selectedSubjects.includes(subject)
              return (
                <button
                  key={subject}
                  onClick={() => handleSubjectFilter(subject)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isSelected 
                      ? getSubjectColor(subject)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getSubjectLabel(subject)}
                  {isSelected && (
                    <span className="ml-1">×</span>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* 활성 필터 표시 */}
          {(selectedSubjects.length > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">활성 필터:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 text-xs">
                  검색: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedSubjects.map((subject) => (
                <span
                  key={subject}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSubjectColor(subject)}`}
                >
                  {getSubjectLabel(subject)}
                  <button
                    onClick={() => handleSubjectFilter(subject)}
                    className="ml-1 text-current hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              
              <button
                onClick={() => {
                  setSelectedSubjects([])
                  setSearchQuery('')
                }}
                className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-medium"
              >
                모든 필터 지우기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 결과 요약 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-white">
          총 {sessions.length}개 세션 중 {filteredSessions.length}개 표시
        </div>
        {filteredSessions.length > 0 && (
          <Link href="/teacher/session/create">
            <Button size="sm">
              + 새 세션 만들기
            </Button>
          </Link>
        )}
      </div>

      {/* 세션 목록 */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.004-5.824-2.412M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {(selectedSubjects.length > 0 || searchQuery) ? '검색 결과가 없습니다' : '생성된 세션이 없습니다'}
          </h3>
          <p className="text-gray-600 dark:text-white mb-6">
            {(selectedSubjects.length > 0 || searchQuery) ? (
              <>
                다른 검색어나 필터를 시도해보세요.
                <br />
                또는 새로운 세션을 만들어보세요.
              </>
            ) : (
              '첫 번째 세션을 만들어 학생들과 함께 스마트한 학습을 시작해보세요.'
            )}
          </p>
          <Link href="/teacher/session/create">
            <Button>
              {(selectedSubjects.length > 0 || searchQuery) ? '새 세션 만들기' : '첫 세션 만들기'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
        <div
          key={session.sessionId}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md dark:hover:shadow-gray-700/50 transition-shadow bg-white dark:bg-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {getSessionTypeIcon(session.sessionType)}
                </span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {session.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getSessionTypeLabel(session.sessionType)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-white mb-3">
                <span>접속 코드: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{session.accessCode}</span></span>
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
                <p className="text-sm text-gray-600 dark:text-white mb-3">
                  <span className="font-medium">학습 목표:</span> {session.learningGoals}
                </p>
              )}

              {/* 키워드 */}
              {session.keywords && session.keywords.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-white mb-3">
                  <span className="font-medium">키워드:</span> {session.keywords.join(', ')}
                </p>
              )}

              {/* 성인 교육 세션 추가 정보 */}
              {session.isAdultEducation && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {session.targetAudience && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">대상:</span>
                        <span className="ml-1 text-gray-600 dark:text-white">{session.targetAudience}</span>
                      </div>
                    )}
                    {session.difficultyLevel && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">난이도:</span>
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
                        <span className="font-medium text-gray-700 dark:text-white">시간:</span>
                        <span className="ml-1 text-gray-600 dark:text-white">{session.duration}</span>
                      </div>
                    )}
                    {session.deliveryFormat && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-white">진행:</span>
                        <span className="ml-1 text-gray-600 dark:text-white">
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
      )}
    </div>
  )
}