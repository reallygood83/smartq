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
import MentorshipAccess from '@/components/student/MentorshipAccess'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor, getYouTubeEmbedUrl } from '@/lib/utils'
import { useEducationLevel, useSmartTerminology, useFullTheme } from '@/contexts/EducationLevelContext'
import { EducationLevel } from '@/types/education'

export default function StudentSessionPage() {
  const { sessionCode } = useParams()
  const { currentLevel } = useEducationLevel()
  const { term, adapt } = useSmartTerminology()
  const theme = useFullTheme()
  
  const [session, setSession] = useState<Session | null>(null)
  const [sharedContents, setSharedContents] = useState<SharedContent[]>([])
  const [analysisResult, setAnalysisResult] = useState<MultiSubjectAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isMaterialsExpanded, setIsMaterialsExpanded] = useState(false)
  
  // Detect if this is an adult education session based on session type or isAdultEducation flag
  const isAdultEducationSession = session?.isAdultEducation || 
    [currentLevel].includes(EducationLevel.UNIVERSITY) || 
    [currentLevel].includes(EducationLevel.ADULT)

  useEffect(() => {
    if (!sessionCode || typeof sessionCode !== 'string') {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (!database) {
      setNotFound(true)
      setLoading(false)
      return
    }
    
    try {
      const sessionsRef = ref(database, 'sessions')
      
      // 복잡한 쿼리 대신 모든 세션을 가져와서 클라이언트에서 필터링
      const unsubscribe = onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val()
        
        if (data) {
          // 클라이언트에서 accessCode로 필터링
          let foundSession: Session | null = null
          let foundSessionId: string | null = null
          
          for (const [sessionId, sessionData] of Object.entries(data)) {
            const session = sessionData as any
            
            if (session.accessCode === sessionCode) {
              foundSessionId = sessionId
              foundSession = {
                sessionId,
                ...session
              } as Session
              break
            }
          }
          
          if (foundSession) {
            setSession(foundSession)
            setNotFound(false)
            setLoading(false)
            
            // AI 분석 결과가 있다면 로드
            if (foundSession.aiAnalysisResult) {
              setAnalysisResult(foundSession.aiAnalysisResult)
            }
          } else {
            setNotFound(true)
            setLoading(false)
          }
        } else {
          setNotFound(true)
          setLoading(false)
        }
      }, (error) => {
        console.error('Firebase 쿼리 오류:', error)
        setNotFound(true)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (queryError) {
      console.error('쿼리 생성 오류:', queryError)
      setNotFound(true)
      setLoading(false)
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg text-gray-600 dark:text-white mt-4">세션을 찾는 중...</div>
            <div className="text-sm text-gray-500 dark:text-gray-200 mt-2">
              세션 코드: <span className="font-mono font-bold text-gray-800 dark:text-white">{sessionCode}</span>
            </div>
            <div className="mt-6 text-xs text-gray-400 dark:text-gray-300 space-y-1">
              <p>💡 잠시만 기다려주세요</p>
              <p>📱 모바일에서는 조금 더 오래 걸릴 수 있습니다</p>
              <p>🌐 네트워크 연결을 확인해주세요</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              세션을 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
              입력하신 접속 코드 <span className="font-mono font-bold text-red-600 dark:text-red-300">{sessionCode}</span>에 해당하는 세션이 없습니다.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📱 모바일/태블릿 사용자:</strong>
                <br />• 페이지 새로고침 (당겨서 새로고침)
                <br />• Wi-Fi 연결 확인
                <br />• 다른 브라우저 시도 (Chrome, Safari)
                <br />• 선생님께 정확한 접속 코드 문의
              </p>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              🔄 페이지 새로고침
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 세션 정보 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">
              {getSessionTypeIcon(session.sessionType)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
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
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">학습 목표</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">{session.learningGoals}</p>
            </div>
          )}
        </Card>

        {/* 공유 자료 - 교육 레벨에 따른 적응형 제목 */}
        {sharedContents.length > 0 && (
          <Card className="p-6 mb-6" style={{ backgroundColor: theme.colors.background.primary }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                📢 {isAdultEducationSession 
                  ? adapt('강의자료', '교수자료', '전문자료') 
                  : adapt('선생님 공유 자료', '선생님 수업자료', '교사 학습자료')} ({sharedContents.length}개)
              </h2>
              <button
                onClick={() => setIsMaterialsExpanded(!isMaterialsExpanded)}
                className="flex items-center space-x-2 px-3 py-1 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: theme.colors.text.secondary }}
              >
                <span className="text-sm font-medium">
                  {isMaterialsExpanded ? '접기' : '펼치기'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isMaterialsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* 접힌 상태일 때 요약 정보 표시 */}
            {!isMaterialsExpanded && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-200 font-medium">
                      자료 {sharedContents.length}개
                    </span>
                    <div className="flex space-x-2">
                      {sharedContents.slice(0, 4).map((content, index) => (
                        <span key={index} className="text-lg" title={content.title}>
                          {content.type === 'text' ? '📄' : 
                           content.type === 'link' ? '🔗' : 
                           content.type === 'youtube' ? '🎬' : '📋'}
                        </span>
                      ))}
                      {sharedContents.length > 4 && (
                        <span className="text-sm text-gray-500 dark:text-gray-300">+{sharedContents.length - 4}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMaterialsExpanded(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                  >
                    자료 보기
                  </button>
                </div>
              </div>
            )}

            {/* 펼친 상태일 때 전체 자료 표시 */}
            {isMaterialsExpanded && (
              <div className="space-y-4">
              {sharedContents.map((content) => (
                <div
                  key={content.contentId}
                  className={`border rounded-lg p-4 ${
                    content.type === 'instruction' 
                      ? 'border-orange-200 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20' 
                      : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
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
                        content.type === 'instruction' ? 'text-orange-900 dark:text-orange-200' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {content.title}
                      </h3>
                      
                      <div className={`rounded-md ${
                        content.type === 'instruction' 
                          ? 'bg-orange-100 p-3' 
                          : content.type === 'youtube'
                          ? 'bg-black'
                          : 'bg-gray-50 dark:bg-gray-900 p-3'
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
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 break-all font-medium"
                          >
                            {content.content}
                            <span className="ml-2 text-sm">↗</span>
                          </a>
                        ) : (
                          <div className={`whitespace-pre-wrap ${
                            content.type === 'instruction' 
                              ? 'text-orange-800 dark:text-orange-200' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {/* 개념 설명인 경우 특별한 포맷팅 */}
                            {content.title.startsWith('개념 설명:') ? (
                              <div className="space-y-3">
                                {content.content.split('\n\n').map((section, index) => {
                                  if (section.startsWith('📚 **') && section.endsWith('**')) {
                                    // 제목 부분
                                    const title = section.replace('📚 **', '').replace('**', '')
                                    return (
                                      <div key={index} className="text-lg font-bold text-orange-900 dark:text-orange-200 flex items-center">
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
                                            <span className="font-semibold text-orange-900 dark:text-orange-200">예시: </span>
                                            <span className="text-orange-800 dark:text-orange-200">{example}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  } else {
                                    // 일반 설명 부분
                                    return (
                                      <p key={index} className="text-orange-800 dark:text-orange-100 leading-relaxed">
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
                      
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                        {new Date(content.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </Card>
        )}

        {/* 질문 입력 - 교육 레벨 적응형 */}
        <Card className="p-6 mb-6" style={{ backgroundColor: theme.colors.background.primary }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            {isAdultEducationSession 
              ? adapt('질문 및 토론', '질의응답', '전문적 질문') 
              : adapt('질문하기', '궁금한 것 물어보기', '질문 작성')}
          </h2>
          <QuestionInput sessionId={session.sessionId} sessionType={session.sessionType} />
        </Card>

        {/* 질문 목록 - 교육 레벨 적응형 */}
        <Card className="p-6 mb-6" style={{ backgroundColor: theme.colors.background.primary }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            💬 {isAdultEducationSession 
              ? adapt('참여자 질의응답', '토론 및 질의', '전문적 대화') 
              : adapt('우리들의 질문 대화', '친구들과 질문 나누기', '학습자 질문 공간')}
          </h2>
          <QuestionList sessionId={session.sessionId} session={session} />
        </Card>

        {/* 멘토-멘티 매칭 시스템 - 대학생/성인 세션용 */}
        {isAdultEducationSession && session && (
          <Card className="p-6 mb-6" style={{ backgroundColor: theme.colors.background.primary }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              🤝 {adapt('멘토-멘티 매칭', '전문가 네트워킹', '동료 학습 시스템')}
            </h2>
            <MentorshipAccess sessionId={session.sessionId} />
          </Card>
        )}

        {/* AI 분석 결과 - 교육 레벨 적응형 */}
        {analysisResult && (
          <>
            {/* 질문 그룹화 결과 */}
            {analysisResult.clusteredQuestions && analysisResult.clusteredQuestions.length > 0 && (
              <Card className="p-6 mb-6" style={{ backgroundColor: theme.colors.background.primary }}>
                <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
                  🧩 {isAdultEducationSession 
                    ? adapt('질문 주제별 분석', '토론 주제 분류', '전문 영역별 정리') 
                    : adapt('우리 질문들의 주제별 정리', '질문 묶어보기', '학습 주제 구분')}
                </h2>
                <p className="mb-6 text-sm" style={{ color: theme.colors.text.secondary }}>
                  {isAdultEducationSession 
                    ? adapt('제출된 질문들을 관련 주제별로 분류하여 체계적으로 정리했습니다.', '토론 주제를 영역별로 구분하여 분석했습니다.', '전문 영역별로 질문을 분류했습니다.')
                    : adapt('선생님이 여러분의 질문들을 비슷한 주제끼리 묶어서 정리해주셨어요!', '질문들을 비슷한 내용끼리 모아서 정리했어요!', '학습 주제별로 질문을 나누어 보았어요!')}
                </p>
                <div className="space-y-4">
                  {analysisResult.clusteredQuestions.map((cluster) => (
                    <div key={cluster.clusterId} className="border border-purple-200 dark:border-purple-600 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/30">
                      <div className="flex items-start mb-3">
                        <div className="bg-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                          {cluster.clusterId}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">
                            📋 {cluster.clusterTitle}
                          </h3>
                          <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                            {cluster.clusterSummary}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md mb-3">
                          <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                            이 주제에 포함된 질문들:
                          </h4>
                          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                            {cluster.questions.map((question, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-400 mr-2">💭</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-purple-100 dark:bg-purple-800/30 p-3 rounded-md">
                          <p className="text-xs text-purple-600 dark:text-purple-300">
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  🎯 추천 학습 활동
                </h2>
                <p className="text-gray-600 dark:text-gray-200 mb-6 text-sm">
                  여러분의 질문을 바탕으로 선생님이 준비한 재미있는 학습 활동들이에요!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.recommendedActivities.map((activity) => (
                    <div key={activity.activityId} className="border border-green-200 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/30">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  📚 오늘 배운 중요한 개념들
                </h2>
                <p className="text-gray-600 dark:text-gray-200 mb-6 text-sm">
                  질문 속에 나온 중요한 개념들을 쉽게 정리해두었어요. 복습할 때 활용해보세요!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.conceptDefinitions.map((concept, index) => (
                    <div key={index} className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30">
                      <div className="flex items-start mb-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                          📖
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                          {concept.term}
                        </h3>
                      </div>
                      
                      <div className="space-y-3 ml-11">
                        <div>
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">💡 쉬운 설명:</span>
                          <p className="text-sm text-blue-700 mt-1 leading-relaxed">{concept.definition}</p>
                        </div>
                        
                        {concept.description && (
                          <div>
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">🔍 예시:</span>
                            <p className="text-sm text-blue-700 mt-1 leading-relaxed">{concept.description}</p>
                          </div>
                        )}
                        
                        <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-md">
                          <p className="text-xs text-blue-600 dark:text-blue-300">
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