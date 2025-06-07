'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'
import Link from 'next/link'

interface RealTimeMetrics {
  activeParticipants: number
  questionSubmissionRate: number
  avgResponseTime: number
  sessionDuration: number
  engagementLevel: 'high' | 'medium' | 'low'
  questionQuality: number
  participationTrend: 'increasing' | 'stable' | 'decreasing'
}

export default function RealTimeMonitoringPage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionLoading, setSessionLoading] = useState(true)
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)

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

  useEffect(() => {
    if (session && questions.length > 0) {
      calculateRealTimeMetrics()
    }
  }, [session, questions])

  const calculateRealTimeMetrics = () => {
    if (!session) return

    const now = Date.now()
    const sessionDuration = Math.floor((now - session.createdAt) / (1000 * 60))
    const expectedParticipants = parseInt(session.participantCount?.split('-')[0] || '10')
    const activeParticipants = questions.length
    const questionSubmissionRate = Math.min(100, (activeParticipants / expectedParticipants) * 100)
    
    // 최근 15분간의 질문 수로 참여 트렌드 계산
    const recentTimeframe = 15 * 60 * 1000 // 15분
    const recentQuestions = questions.filter(q => now - q.createdAt < recentTimeframe)
    const olderQuestions = questions.filter(q => now - q.createdAt >= recentTimeframe && now - q.createdAt < recentTimeframe * 2)
    
    let participationTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (recentQuestions.length > olderQuestions.length * 1.2) {
      participationTrend = 'increasing'
    } else if (recentQuestions.length < olderQuestions.length * 0.8) {
      participationTrend = 'decreasing'
    }

    // 참여도 레벨 계산
    let engagementLevel: 'high' | 'medium' | 'low' = 'low'
    if (questionSubmissionRate > 70) engagementLevel = 'high'
    else if (questionSubmissionRate > 40) engagementLevel = 'medium'

    // 질문 품질 점수 (간단한 휴리스틱)
    const avgQuestionLength = questions.reduce((sum, q) => sum + q.text.length, 0) / questions.length
    const questionQuality = Math.min(100, Math.max(20, avgQuestionLength * 2))

    setMetrics({
      activeParticipants,
      questionSubmissionRate: Math.round(questionSubmissionRate),
      avgResponseTime: 45, // 기본값
      sessionDuration,
      engagementLevel,
      questionQuality: Math.round(questionQuality),
      participationTrend
    })
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
            <span>실시간 모니터링</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 실시간 교육 품질 모니터링</h1>
              <p className="text-gray-600">세션 진행 상황 및 참여도 실시간 추적</p>
            </div>
            <Link href={`/teacher/session/${sessionId}`}>
              <Button variant="outline">
                세션으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* 실시간 메트릭 */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 활성 참여자 */}
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium text-gray-900">
                    {metrics.activeParticipants}명
                  </div>
                  <div className="text-sm text-gray-500">활성 참여자</div>
                </div>
              </div>
            </Card>

            {/* 참여율 */}
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    metrics.engagementLevel === 'high' ? 'bg-green-100 text-green-600' :
                    metrics.engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium text-gray-900">
                    {metrics.questionSubmissionRate}%
                  </div>
                  <div className="text-sm text-gray-500">질문 제출률</div>
                </div>
              </div>
            </Card>

            {/* 세션 시간 */}
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏱️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium text-gray-900">
                    {metrics.sessionDuration}분
                  </div>
                  <div className="text-sm text-gray-500">진행 시간</div>
                </div>
              </div>
            </Card>

            {/* 질문 품질 */}
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💡</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium text-gray-900">
                    {metrics.questionQuality}점
                  </div>
                  <div className="text-sm text-gray-500">질문 품질</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6 mb-8">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                메트릭 계산 중
              </h3>
              <p className="text-gray-600">
                질문이 제출되면 실시간 모니터링이 시작됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* 참여도 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 참여도 분석</h3>
            
            {metrics ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">전체 참여도</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metrics.engagementLevel === 'high' ? 'bg-green-100 text-green-800' :
                      metrics.engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metrics.engagementLevel === 'high' ? '높음' :
                       metrics.engagementLevel === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.engagementLevel === 'high' ? 'bg-green-500' :
                        metrics.engagementLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metrics.questionSubmissionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">참여 트렌드</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metrics.participationTrend === 'increasing' ? 'bg-green-100 text-green-800' :
                      metrics.participationTrend === 'stable' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metrics.participationTrend === 'increasing' ? '📈 증가' :
                       metrics.participationTrend === 'stable' ? '➡️ 안정' : '📉 감소'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">권장사항</span>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {metrics.engagementLevel === 'low' && (
                      <>
                        <li>• 더 흥미로운 주제로 유도해보세요</li>
                        <li>• 직접적인 질문을 통해 참여를 독려하세요</li>
                      </>
                    )}
                    {metrics.participationTrend === 'decreasing' && (
                      <li>• 새로운 활동이나 관점을 도입해보세요</li>
                    )}
                    {metrics.engagementLevel === 'high' && (
                      <li>• 현재 참여도가 매우 좋습니다!</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                데이터를 수집하고 있습니다...
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 최근 질문 활동</h3>
            
            {questions.length > 0 ? (
              <div className="space-y-3">
                {questions.slice(0, 5).map((question, index) => (
                  <div key={question.questionId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {question.isAnonymous ? '익명' : (question.studentName || '학생')} • 
                        {new Date(question.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {questions.length > 5 && (
                  <div className="text-center">
                    <Link href={`/teacher/session/${sessionId}`}>
                      <Button variant="outline" size="sm">
                        모든 질문 보기 ({questions.length - 5}개 더)
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 제출된 질문이 없습니다.
              </div>
            )}
          </Card>
        </div>

        {/* 세션 요약 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 세션 요약</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">세션 정보</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">세션 유형:</dt>
                  <dd className="text-gray-900">{session.sessionType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">예상 참여자:</dt>
                  <dd className="text-gray-900">{session.participantCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">예상 시간:</dt>
                  <dd className="text-gray-900">{session.duration}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">진행 현황</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">진행 시간:</dt>
                  <dd className="text-gray-900">{metrics?.sessionDuration || 0}분</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">질문 수:</dt>
                  <dd className="text-gray-900">{questions.length}개</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">참여율:</dt>
                  <dd className="text-gray-900">{metrics?.questionSubmissionRate || 0}%</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI 분석 옵션</h4>
              <div className="space-y-2">
                <Link href={`/teacher/session/${sessionId}/comprehensive-analysis`}>
                  <Button variant="outline" size="sm" className="w-full">
                    종합 분석 실행
                  </Button>
                </Link>
                <Link href={`/teacher/session/${sessionId}/quality-monitoring`}>
                  <Button variant="outline" size="sm" className="w-full">
                    상세 품질 분석
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}