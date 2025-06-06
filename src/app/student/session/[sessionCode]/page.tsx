'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card } from '@/components/common/Card'
import { Session, SharedContent, MultiSubjectAnalysisResult } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'
import QuestionInput from '@/components/student/QuestionInput'
import QuestionList from '@/components/student/QuestionList'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor, getYouTubeEmbedUrl } from '@/lib/utils'

export default function StudentSessionPage() {
  const { sessionCode } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [sharedContents, setSharedContents] = useState<SharedContent[]>([])
  const [analysisResult, setAnalysisResult] = useState<MultiSubjectAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!sessionCode || typeof sessionCode !== 'string') {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (!database) {
      console.error('Firebase database가 초기화되지 않음')
      setNotFound(true)
      setLoading(false)
      return
    }

    // 접속 코드로 세션 찾기
    console.log('세션 코드로 검색:', sessionCode)
    const sessionsRef = ref(database, 'sessions')
    const sessionQuery = query(sessionsRef, orderByChild('accessCode'), equalTo(sessionCode))
    
    const unsubscribe = onValue(sessionQuery, (snapshot) => {
      const data = snapshot.val()
      console.log('Firebase 쿼리 결과:', data)
      if (data) {
        try {
          // 첫 번째 (그리고 유일한) 결과 가져오기
          const sessionData = Object.values(data)[0] as Session
          console.log('세션 데이터:', sessionData)
          setSession(sessionData)
          setNotFound(false)
          setLoading(false)
          
          // AI 분석 결과가 있다면 로드
          if (sessionData.aiAnalysisResult) {
            setAnalysisResult(sessionData.aiAnalysisResult)
          }
          
          // 공유 콘텐츠 로드 (별도 useEffect에서 처리)
        } catch (error) {
          console.error('세션 데이터 파싱 오류:', error)
          setNotFound(true)
          setLoading(false)
        }
      } else {
        console.log('세션을 찾을 수 없음')
        setNotFound(true)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [sessionCode])

  // 공유 콘텐츠 로드
  useEffect(() => {
    if (!session?.sessionId || !database) return

    console.log('공유 콘텐츠 로드 시작:', session.sessionId)
    const sharedContentsRef = ref(database, `sharedContents/${session.sessionId}`)
    const unsubscribeContents = onValue(sharedContentsRef, (contentSnapshot) => {
      const contentData = contentSnapshot.val()
      console.log('공유 콘텐츠 데이터:', contentData)
      if (contentData) {
        try {
          const contentsList = Object.values(contentData) as SharedContent[]
          contentsList.sort((a, b) => b.createdAt - a.createdAt)
          setSharedContents(contentsList)
        } catch (error) {
          console.error('공유 콘텐츠 파싱 오류:', error)
          setSharedContents([])
        }
      } else {
        setSharedContents([])
      }
    })

    return () => unsubscribeContents()
  }, [session?.sessionId])

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
                      {content.type === 'text' ? '📄' : 
                       content.type === 'link' ? '🔗' : 
                       content.type === 'youtube' ? '🎬' : '📋'}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium mb-2 ${
                        content.type === 'instruction' ? 'text-orange-900' : 'text-gray-900'
                      }`}>
                        {content.title}
                      </h3>
                      
                      <div className={`rounded-md ${
                        content.type === 'instruction' 
                          ? 'bg-orange-100 p-3' 
                          : content.type === 'youtube'
                          ? 'bg-black'
                          : 'bg-gray-50 p-3'
                      }`}>
                        {content.type === 'youtube' ? (
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-md"
                              src={getYouTubeEmbedUrl(content.content) || ''}
                              title={content.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : content.type === 'link' ? (
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
                          <div className={`whitespace-pre-wrap ${
                            content.type === 'instruction' 
                              ? 'text-orange-800' 
                              : 'text-gray-900'
                          }`}>
                            {/* 개념 설명인 경우 특별한 포맷팅 */}
                            {content.title.startsWith('개념 설명:') ? (
                              <div className="space-y-3">
                                {content.content.split('\n\n').map((section, index) => {
                                  if (section.startsWith('📚 **') && section.endsWith('**')) {
                                    // 제목 부분
                                    const title = section.replace('📚 **', '').replace('**', '')
                                    return (
                                      <div key={index} className="text-lg font-bold text-orange-900 flex items-center">
                                        <span className="text-2xl mr-2">📚</span>
                                        {title}
                                      </div>
                                    )
                                  } else if (section.startsWith('🔍 **예시:**')) {
                                    // 예시 부분
                                    const example = section.replace('🔍 **예시:** ', '')
                                    return (
                                      <div key={index} className="bg-orange-200 p-3 rounded-md">
                                        <div className="flex items-start">
                                          <span className="text-lg mr-2">🔍</span>
                                          <div>
                                            <span className="font-semibold text-orange-900">예시: </span>
                                            <span className="text-orange-800">{example}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  } else {
                                    // 일반 설명 부분
                                    return (
                                      <p key={index} className="text-orange-800 leading-relaxed">
                                        {section}
                                      </p>
                                    )
                                  }
                                })}
                              </div>
                            ) : (
                              // 일반 콘텐츠
                              <p>{content.content}</p>
                            )}
                          </div>
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
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💬 우리들의 질문 대화
          </h2>
          <QuestionList sessionId={session.sessionId} />
        </Card>

        {/* AI 분석 결과 - 학생용 */}
        {analysisResult && (
          <>
            {/* 질문 그룹화 결과 */}
            {analysisResult.clusteredQuestions && analysisResult.clusteredQuestions.length > 0 && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  🧩 우리 질문들의 주제별 정리
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  선생님이 여러분의 질문들을 비슷한 주제끼리 묶어서 정리해주셨어요!
                </p>
                <div className="space-y-4">
                  {analysisResult.clusteredQuestions.map((cluster) => (
                    <div key={cluster.clusterId} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-start mb-3">
                        <div className="bg-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                          {cluster.clusterId}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-purple-900 mb-2">
                            📋 {cluster.clusterTitle}
                          </h3>
                          <p className="text-purple-700 text-sm mb-3">
                            {cluster.clusterSummary}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <div className="bg-white p-3 rounded-md mb-3">
                          <h4 className="text-sm font-medium text-purple-800 mb-2">
                            이 주제에 포함된 질문들:
                          </h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            {cluster.questions.map((question, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-400 mr-2">💭</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-purple-100 p-3 rounded-md">
                          <p className="text-xs text-purple-600">
                            💡 <strong>학습 팁:</strong> {cluster.combinationGuide}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 추천 활동 */}
            {analysisResult.recommendedActivities && analysisResult.recommendedActivities.length > 0 && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  🎯 추천 학습 활동
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  여러분의 질문을 바탕으로 선생님이 준비한 재미있는 학습 활동들이에요!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.recommendedActivities.map((activity) => (
                    <div key={activity.activityId} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-900">
                          🎮 {activity.activityTitle}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.difficulty === 'easy' ? '😊 쉬움' :
                           activity.difficulty === 'medium' ? '🤔 보통' : '😤 어려움'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-green-800">📝 활동 내용:</span>
                          <p className="text-sm text-green-700 mt-1">{activity.description}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-green-800">⏰ 예상 시간:</span>
                          <p className="text-sm text-green-700 mt-1">{activity.timeRequired}</p>
                        </div>
                        
                        {activity.materials && activity.materials.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-green-800">🛠️ 필요한 것들:</span>
                            <ul className="text-sm text-green-700 mt-1">
                              {activity.materials.map((material, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-green-400 mr-2">✓</span>
                                  <span>{material}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="bg-green-100 p-3 rounded-md">
                          <p className="text-xs text-green-600">
                            🌟 <strong>왜 이 활동을 할까요?</strong> {activity.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 개념 정의 - 학생용 */}
            {analysisResult.conceptDefinitions && analysisResult.conceptDefinitions.length > 0 && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  📚 오늘 배운 중요한 개념들
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  질문 속에 나온 중요한 개념들을 쉽게 정리해두었어요. 복습할 때 활용해보세요!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.conceptDefinitions.map((concept, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start mb-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                          📖
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900">
                          {concept.term}
                        </h3>
                      </div>
                      
                      <div className="space-y-3 ml-11">
                        <div>
                          <span className="text-sm font-medium text-blue-800">💡 쉬운 설명:</span>
                          <p className="text-sm text-blue-700 mt-1 leading-relaxed">{concept.definition}</p>
                        </div>
                        
                        {concept.description && (
                          <div>
                            <span className="text-sm font-medium text-blue-800">🔍 예시:</span>
                            <p className="text-sm text-blue-700 mt-1 leading-relaxed">{concept.description}</p>
                          </div>
                        )}
                        
                        <div className="bg-blue-100 p-3 rounded-md">
                          <p className="text-xs text-blue-600">
                            ✨ <strong>복습 팁:</strong> 이 개념을 친구나 가족에게 설명해보세요!
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  )
}