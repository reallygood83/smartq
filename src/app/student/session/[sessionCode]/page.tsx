'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Session, SharedContent } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'
import QuestionInput from '@/components/student/QuestionInput'
import QuestionList from '@/components/student/QuestionList'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor } from '@/lib/utils'

export default function StudentSessionPage() {
  const { sessionCode } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [sharedContents, setSharedContents] = useState<SharedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!sessionCode || typeof sessionCode !== 'string') {
      setNotFound(true)
      setLoading(false)
      return
    }

    // 접속 코드로 세션 찾기
    const sessionsRef = ref(database, 'sessions')
    const sessionQuery = query(sessionsRef, orderByChild('accessCode'), equalTo(sessionCode))
    
    const unsubscribe = onValue(sessionQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // 첫 번째 (그리고 유일한) 결과 가져오기
        const sessionData = Object.values(data)[0] as Session
        setSession(sessionData)
        setNotFound(false)
        
        // 공유 콘텐츠 로드
        const sharedContentsRef = ref(database, `sharedContents/${sessionData.sessionId}`)
        const unsubscribeContents = onValue(sharedContentsRef, (contentSnapshot) => {
          const contentData = contentSnapshot.val()
          if (contentData) {
            const contentsList = Object.values(contentData) as SharedContent[]
            contentsList.sort((a, b) => b.createdAt - a.createdAt)
            setSharedContents(contentsList)
          } else {
            setSharedContents([])
          }
        })
        
        return unsubscribeContents
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">세션을 찾는 중...</div>
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              세션을 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              입력하신 접속 코드 <span className="font-mono font-bold text-red-600">{sessionCode}</span>에 해당하는 세션이 없습니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>확인해주세요:</strong>
                <br />• 접속 코드를 정확히 입력했는지 확인
                <br />• 대소문자 구분 (예: A와 a는 다름)
                <br />• 선생님께 정확한 접속 코드 문의
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 세션 정보 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">
              {getSessionTypeIcon(session.sessionType)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.title}
              </h1>
              <p className="text-gray-600">
                {getSessionTypeLabel(session.sessionType)}
              </p>
            </div>
          </div>

          {/* 교과목 표시 */}
          {session.subjects && session.subjects.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {session.subjects.map((subject) => (
                  <span
                    key={subject}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(subject)}`}
                  >
                    {getSubjectLabel(subject)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 학습 목표 */}
          {session.learningGoals && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-1">학습 목표</h3>
              <p className="text-sm text-blue-800">{session.learningGoals}</p>
            </div>
          )}
        </Card>

        {/* 선생님 공유 자료 */}
        {sharedContents.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📢 선생님 공유 자료 ({sharedContents.length}개)
            </h2>
            <div className="space-y-4">
              {sharedContents.map((content) => (
                <div
                  key={content.contentId}
                  className={`border rounded-lg p-4 ${
                    content.type === 'instruction' 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">
                      {content.type === 'text' ? '📄' : content.type === 'link' ? '🔗' : '📋'}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium mb-2 ${
                        content.type === 'instruction' ? 'text-orange-900' : 'text-gray-900'
                      }`}>
                        {content.title}
                      </h3>
                      
                      <div className={`p-3 rounded-md ${
                        content.type === 'instruction' 
                          ? 'bg-orange-100' 
                          : 'bg-gray-50'
                      }`}>
                        {content.type === 'link' ? (
                          <a
                            href={content.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 break-all font-medium"
                          >
                            {content.content}
                            <span className="ml-2 text-sm">↗</span>
                          </a>
                        ) : (
                          <p className={`whitespace-pre-wrap ${
                            content.type === 'instruction' 
                              ? 'text-orange-800' 
                              : 'text-gray-900'
                          }`}>
                            {content.content}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(content.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 질문 입력 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            질문하기
          </h2>
          <QuestionInput sessionId={session.sessionId} sessionType={session.sessionType} />
        </Card>

        {/* 질문 목록 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            다른 학생들의 질문
          </h2>
          <QuestionList sessionId={session.sessionId} />
        </Card>
      </div>
    </div>
  )
}