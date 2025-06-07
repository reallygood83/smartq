'use client'

import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface RealTimeMetrics {
  activeParticipants: number
  questionSubmissionRate: number
  avgResponseTime: number
  sessionDuration: number
  engagementLevel: 'high' | 'medium' | 'low'
  questionQuality: number
  participationTrend: 'increasing' | 'stable' | 'decreasing'
  recentActivity: Array<{
    type: 'question' | 'join' | 'leave'
    timestamp: number
    content: string
  }>
  alerts: string[]
}

export default function RealTimeMonitoringPage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionLoading, setSessionLoading] = useState(true)
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

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

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (session && questions.length > 0) {
        calculateRealTimeMetrics()
      }
    }, 30000) // 30초마다 업데이트

    return () => clearInterval(interval)
  }, [autoRefresh, session, questions])

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
    
    // 고유 참여자 계산
    const uniqueParticipants = new Set(questions.map(q => q.studentName || 'anonymous')).size
    const questionSubmissionRate = Math.min(100, (uniqueParticipants / expectedParticipants) * 100)
    
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
    const avgQuestionLength = questions.length > 0 
      ? questions.reduce((sum, q) => sum + q.text.length, 0) / questions.length 
      : 0
    const questionQuality = Math.min(100, Math.max(20, avgQuestionLength * 2))

    // 평균 응답 시간 계산
    const avgResponseTime = calculateAvgResponseTime(recentQuestions)

    // 최근 활동 생성
    const recentActivity = questions
      .slice(0, 10)
      .map(q => ({
        type: 'question' as const,
        timestamp: q.createdAt,
        content: `새 질문: ${q.text.substring(0, 50)}${q.text.length > 50 ? '...' : ''}`
      }))

    // 알림 생성
    const alerts = generateAlerts(questionSubmissionRate, uniqueParticipants, recentQuestions, sessionDuration)

    setMetrics({
      activeParticipants: uniqueParticipants,
      questionSubmissionRate: Math.round(questionSubmissionRate),
      avgResponseTime,
      sessionDuration,
      engagementLevel,
      questionQuality: Math.round(questionQuality),
      participationTrend,
      recentActivity,
      alerts
    })
  }

  // 평균 응답 시간 계산 함수
  const calculateAvgResponseTime = (recentQuestions: Question[]) => {
    if (recentQuestions.length < 2) return 0
    
    const timestamps = recentQuestions.map(q => q.createdAt).sort((a, b) => a - b)
    const intervals = []
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    return Math.round(avgInterval / 1000) // 초 단위
  }

  // 알림 생성 함수
  const generateAlerts = (submissionRate: number, participants: number, recentQuestions: Question[], duration: number) => {
    const alerts = []
    
    if (submissionRate < 20 && participants > 5) {
      alerts.push('질문 제출률이 낮습니다. 참여 독려가 필요해 보입니다.')
    }
    
    if (recentQuestions.length === 0 && participants > 0 && duration > 10) {
      alerts.push('최근 15분 동안 새로운 질문이 없습니다.')
    }
    
    if (participants === 0 && duration > 5) {
      alerts.push('현재 활성 참여자가 없습니다.')
    }

    if (duration > 60 && submissionRate < 30) {
      alerts.push('장시간 진행되었으나 참여도가 낮습니다. 새로운 활동을 고려해보세요.')
    }
    
    return alerts
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
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? '🔄 자동새로고침 ON' : '⏸️ 자동새로고침 OFF'}
              </button>
              <Link href={`/teacher/session/${sessionId}`}>
                <Button variant="outline">
                  세션으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 알림 섹션 */}
        {metrics?.alerts && metrics.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-l-4 border-yellow-500 bg-yellow-50">
              <div className="p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 실시간 알림</h3>
                <ul className="space-y-1">
                  {metrics.alerts.map((alert, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-yellow-700 text-sm flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      {alert}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 실시간 메트릭 */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 활성 참여자 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <motion.div 
                      key={metrics.activeParticipants}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-medium text-gray-900"
                    >
                      {metrics.activeParticipants}명
                    </motion.div>
                    <div className="text-sm text-gray-500">활성 참여자</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 참여율 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
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
                    <motion.div 
                      key={metrics.questionSubmissionRate}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-medium text-gray-900"
                    >
                      {metrics.questionSubmissionRate}%
                    </motion.div>
                    <div className="text-sm text-gray-500">질문 제출률</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 세션 시간 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <motion.div 
                      key={metrics.sessionDuration}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-medium text-gray-900"
                    >
                      {metrics.sessionDuration}분
                    </motion.div>
                    <div className="text-sm text-gray-500">진행 시간</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 평균 응답 시간 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <motion.div 
                      key={metrics.avgResponseTime}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-medium text-gray-900"
                    >
                      {metrics.avgResponseTime}초
                    </motion.div>
                    <div className="text-sm text-gray-500">평균 응답 시간</div>
                  </div>
                </div>
              </Card>
            </motion.div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 실시간 활동 로그</h3>
            
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {metrics.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">
                        {activity.type === 'question' ? '❓' : 
                         activity.type === 'join' ? '👋' : '👋'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💤</div>
                <p>아직 활동이 없습니다.</p>
                <p className="text-sm mt-1">참여자들의 활동을 기다리고 있어요!</p>
              </div>
            )}
            
            {questions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <Link href={`/teacher/session/${sessionId}`}>
                    <Button variant="outline" size="sm">
                      전체 질문 보기 ({questions.length}개)
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 실시간 조치 권장사항 */}
        {metrics && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 실시간 조치 권장사항</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.questionSubmissionRate < 30 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <h4 className="font-medium text-yellow-800 mb-2">🎯 참여 독려</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      질문 제출률이 낮습니다. 간단한 아이스브레이킹 질문으로 참여를 유도해보세요.
                    </p>
                    <div className="text-xs text-yellow-600">
                      • "궁금한 점이 있으시면 언제든 질문해주세요!"<br/>
                      • 실시간 투표나 간단한 퀴즈 진행
                    </div>
                  </motion.div>
                )}
                
                {metrics.activeParticipants > 10 && questions.length < 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <h4 className="font-medium text-blue-800 mb-2">📝 질문 가이드</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      참여자는 많으나 질문이 적습니다. 구체적인 질문 예시를 제공해보세요.
                    </p>
                    <div className="text-xs text-blue-600">
                      • "예를 들어, ~에 대해 어떻게 생각하시나요?"<br/>
                      • 질문 템플릿 제공
                    </div>
                  </motion.div>
                )}
                
                {metrics.sessionDuration > 30 && metrics.recentActivity.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <h4 className="font-medium text-red-800 mb-2">⚡ 활동 부족</h4>
                    <p className="text-sm text-red-700 mb-2">
                      최근 활동이 없습니다. 새로운 자극이 필요해 보입니다.
                    </p>
                    <div className="text-xs text-red-600">
                      • 실시간 투표나 소그룹 활동 진행<br/>
                      • 주제 전환이나 휴식 시간 고려
                    </div>
                  </motion.div>
                )}
                
                {metrics.questionSubmissionRate > 70 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <h4 className="font-medium text-green-800 mb-2">🎉 우수한 참여도</h4>
                    <p className="text-sm text-green-700 mb-2">
                      참여도가 매우 높습니다! 현재 진행 방식을 계속 유지하세요.
                    </p>
                    <div className="text-xs text-green-600">
                      • 현재 교수법이 효과적입니다<br/>
                      • 심화 내용 진행 고려
                    </div>
                  </motion.div>
                )}

                {metrics.participationTrend === 'decreasing' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <h4 className="font-medium text-orange-800 mb-2">📉 참여도 감소</h4>
                    <p className="text-sm text-orange-700 mb-2">
                      참여도가 감소 추세입니다. 새로운 접근이 필요합니다.
                    </p>
                    <div className="text-xs text-orange-600">
                      • 활동 방식 변경 고려<br/>
                      • 참여자 관심사 재확인
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        )}

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