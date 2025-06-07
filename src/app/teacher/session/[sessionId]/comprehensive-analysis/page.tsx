'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import AdultSessionAnalysis from '@/components/teacher/AdultSessionAnalysis'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue, set } from 'firebase/database'
import { Session, Question, MultiSubjectAnalysisResult, prepareAnalysisResultForFirebase } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'
import { analyzeQuestionsMultiSubject } from '@/lib/gemini'
import { AdultLearnerType } from '@/types/education'
import Link from 'next/link'

export default function ComprehensiveAnalysisPage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [analysisResult, setAnalysisResult] = useState<MultiSubjectAnalysisResult | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!sessionId || typeof sessionId !== 'string') return

    // 세션 정보 로드
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSession(data as Session)
        if (data.aiAnalysisResult) {
          setAnalysisResult(data.aiAnalysisResult)
        }
      }
      setSessionLoading(false)
    })

    // 질문 데이터 로드
    const questionsRef = ref(database, `questions/${sessionId}`)
    const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questionsList = Object.values(data) as Question[]
        questionsList.sort((a, b) => b.createdAt - a.createdAt)
        setQuestions(questionsList)
      } else {
        setQuestions([])
      }
    })

    return () => {
      unsubscribeSession()
      unsubscribeQuestions()
    }
  }, [sessionId])

  const handleAnalyzeQuestions = async () => {
    if (!session || questions.length === 0 || !user) return

    const apiKey = getStoredApiKey(user.uid)
    if (!apiKey) {
      if (confirm('AI 분석을 위해 Gemini API 키가 필요합니다. 설정 페이지로 이동하시겠습니까?')) {
        window.open('/teacher/settings', '_blank')
      }
      return
    }

    setAnalyzing(true)
    try {
      const questionTexts = questions.map(q => q.text)
      const result = await analyzeQuestionsMultiSubject(
        questionTexts,
        session.sessionType,
        session.subjects,
        apiKey,
        session.keywords,
        session.isAdultEducation ? 'adult' : 'elementary',
        session.adultLearnerType,
        session.industryFocus,
        session.difficultyLevel
      )

      // 분석 결과를 Firebase용으로 정리
      const cleanResult = prepareAnalysisResultForFirebase(result, sessionId)

      // 분석 결과를 Firebase에 저장
      const analysisRef = ref(database, `sessions/${sessionId}/aiAnalysisResult`)
      await set(analysisRef, cleanResult)
      
      setAnalysisResult(result)
      alert('AI 분석이 완료되었습니다!')
    } catch (error) {
      console.error('AI 분석 오류:', error)
      alert('AI 분석 중 오류가 발생했습니다. API 키를 확인해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    redirect('/auth/login')
  }

  if (!sessionId || typeof sessionId !== 'string') {
    redirect('/teacher/dashboard')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              세션을 찾을 수 없습니다
            </h2>
            <Link href="/teacher/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/teacher/dashboard" className="hover:text-gray-700">대시보드</Link>
            <span className="mx-2">›</span>
            <Link href={`/teacher/session/${sessionId}`} className="hover:text-gray-700">
              {session.title}
            </Link>
            <span className="mx-2">›</span>
            <span>종합 분석</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 종합 분석</h1>
              <p className="text-gray-600">실무 분석, 학습 추천, 세션 평가 모두 포함</p>
            </div>
            <Link href={`/teacher/session/${sessionId}`}>
              <Button variant="outline">
                세션으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* API 키 확인 */}
        {!user || !getStoredApiKey(user.uid) ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                API 키 설정이 필요합니다
              </h3>
              <p className="text-gray-600 mb-6">
                AI 분석 기능을 사용하려면 Gemini API 키가 필요합니다.
              </p>
              <Link href="/teacher/settings">
                <Button>API 키 설정하기</Button>
              </Link>
            </div>
          </Card>
        ) : questions.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                분석할 질문이 없습니다
              </h3>
              <p className="text-gray-600">
                학생들이 질문을 제출하면 분석을 시작할 수 있습니다.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 분석 실행 버튼 */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">📋 질문 분석 현황</h2>
                  <p className="text-gray-600">
                    총 {questions.length}개의 질문이 제출되었습니다.
                    {analysisResult ? ' 분석이 완료되었습니다.' : ' 분석을 실행해주세요.'}
                  </p>
                </div>
                <Button
                  onClick={handleAnalyzeQuestions}
                  disabled={analyzing}
                  isLoading={analyzing}
                >
                  {analyzing ? '분석 중...' : analysisResult ? '재분석' : '분석 실행'}
                </Button>
              </div>
            </Card>

            {/* 성인 교육 전용 종합 분석 */}
            {session?.isAdultEducation && (
              <AdultSessionAnalysis
                questions={questions.map(q => q.text)}
                sessionType={session.sessionType}
                adultLearnerType={session.adultLearnerType || AdultLearnerType.PROFESSIONAL}
                userApiKey={user ? (getStoredApiKey(user.uid) || '') : ''}
                industryFocus={session.industryFocus}
                difficultyLevel={session.difficultyLevel}
                participantCount={session.participantCount}
                duration={session.duration}
              />
            )}

            {/* 기본 질문 분석 결과 */}
            {analysisResult && (
              <div className="space-y-6">
                {/* 질문 그룹화 결과 */}
                {analysisResult.clusteredQuestions && analysisResult.clusteredQuestions.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      🧩 질문 그룹 분석
                    </h2>
                    <div className="space-y-6">
                      {analysisResult.clusteredQuestions.map((cluster) => (
                        <div key={cluster.clusterId} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {cluster.clusterTitle}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {cluster.clusterSummary}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              포함된 질문들:
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {cluster.questions.map((question, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-gray-400 mr-2">•</span>
                                  <span>{question}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>활용 가이드:</strong> {cluster.combinationGuide}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 활동 추천 */}
                {analysisResult.recommendedActivities && analysisResult.recommendedActivities.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      🎯 추천 교육 활동
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {analysisResult.recommendedActivities.map((activity) => (
                        <div key={activity.activityId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {activity.activityTitle}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.difficulty === 'easy' ? '쉬움' :
                               activity.difficulty === 'medium' ? '보통' : '어려움'}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">활동 유형:</span>
                              <p className="text-sm text-gray-600">{activity.activityType}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">설명:</span>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">소요 시간:</span>
                              <p className="text-sm text-gray-600">{activity.timeRequired}</p>
                            </div>
                            
                            {activity.materials && activity.materials.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">필요 자료:</span>
                                <ul className="text-sm text-gray-600 mt-1">
                                  {activity.materials.map((material, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-gray-400 mr-2">•</span>
                                      <span>{material}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="bg-blue-50 p-3 rounded-md">
                              <span className="text-sm font-medium text-blue-900">추천 이유:</span>
                              <p className="text-sm text-blue-800 mt-1">{activity.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}