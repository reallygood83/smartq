'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { database } from '@/lib/firebase'
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { FeedbackContent, FeedbackAnalysisResult } from '@/lib/feedbackAnalysis'
import { 
  GrowthPattern, 
  LearningMilestone, 
  GrowthInsight, 
  PersonalizedGrowthPlan,
  analyzeGrowthPatterns,
  identifyLearningMilestones,
  generateGrowthInsights,
  createPersonalizedGrowthPlan
} from '@/lib/feedbackGrowthAnalytics'

interface FeedbackHistoryEntry {
  id: string
  sessionId: string
  sessionTitle: string
  feedbackContent: FeedbackContent
  analysis?: FeedbackAnalysisResult
  timestamp: number
}

interface GrowthMetrics {
  totalFeedbacks: number
  averageQuality: number
  qualityTrend: 'improving' | 'stable' | 'declining'
  strongestDimensions: string[]
  improvementAreas: string[]
  monthlyProgress: {
    month: string
    averageScore: number
    feedbackCount: number
  }[]
}

interface FeedbackHistoryDashboardProps {
  userId: string
  userType: 'mentor' | 'mentee' | 'all'
  userApiKey?: string
}

export default function FeedbackHistoryDashboard({ userId, userType, userApiKey }: FeedbackHistoryDashboardProps) {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistoryEntry[]>([])
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1month' | '3months' | '6months' | 'all'>('3months')
  const [viewMode, setViewMode] = useState<'received' | 'given' | 'all'>('all')
  
  // 고급 성장 분석 상태
  const [growthPatterns, setGrowthPatterns] = useState<GrowthPattern[]>([])
  const [learningMilestones, setLearningMilestones] = useState<LearningMilestone[]>([])
  const [growthInsights, setGrowthInsights] = useState<GrowthInsight[]>([])
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedGrowthPlan | null>(null)
  const [advancedAnalysisLoading, setAdvancedAnalysisLoading] = useState(false)
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)

  useEffect(() => {
    loadFeedbackHistory()
  }, [userId, userType, selectedTimeRange, viewMode])

  const loadFeedbackHistory = async () => {
    setLoading(true)
    
    try {
      // 모든 세션에서 사용자와 관련된 피드백 수집
      const sessionsRef = ref(database, 'sessions')
      onValue(sessionsRef, (sessionsSnapshot) => {
        const sessionsData = sessionsSnapshot.val()
        if (!sessionsData) {
          setLoading(false)
          return
        }

        const allFeedbacks: FeedbackHistoryEntry[] = []
        const sessions = Object.values(sessionsData) as any[]

        // 각 세션에서 피드백 수집
        sessions.forEach(session => {
          if (session.isAdultEducation) {
            const feedbackRef = ref(database, `feedbackResponses/${session.sessionId}`)
            onValue(feedbackRef, (feedbackSnapshot) => {
              const feedbackData = feedbackSnapshot.val()
              if (feedbackData) {
                const feedbacks = Object.values(feedbackData) as any[]
                
                feedbacks.forEach(feedback => {
                  const shouldInclude = 
                    viewMode === 'all' ||
                    (viewMode === 'given' && feedback.reviewerId === userId) ||
                    (viewMode === 'received' && feedback.requesterId === userId)

                  if (shouldInclude && 
                      (feedback.reviewerId === userId || feedback.requesterId === userId)) {
                    
                    // 시간 범위 필터링
                    const feedbackDate = new Date(feedback.submittedAt || feedback.createdAt || Date.now())
                    const cutoffDate = getTimeRangeCutoff(selectedTimeRange)
                    
                    if (feedbackDate >= cutoffDate) {
                      const historyEntry: FeedbackHistoryEntry = {
                        id: feedback.responseId || feedback.id,
                        sessionId: session.sessionId,
                        sessionTitle: session.title,
                        feedbackContent: {
                          id: feedback.responseId || feedback.id,
                          content: feedback.feedback || feedback.content,
                          fromUser: feedback.reviewerId || feedback.fromUser,
                          toUser: feedback.requesterId || feedback.toUser,
                          sessionId: session.sessionId,
                          type: 'peer_to_peer',
                          context: '멘토링 피드백',
                          createdAt: feedback.submittedAt || feedback.createdAt || Date.now()
                        },
                        timestamp: feedback.submittedAt || feedback.createdAt || Date.now()
                      }

                      // 분석 결과 로드
                      const analysisRef = ref(database, `feedbackAnalyses/${session.sessionId}/individual/${historyEntry.id}`)
                      onValue(analysisRef, (analysisSnapshot) => {
                        const analysisData = analysisSnapshot.val()
                        if (analysisData) {
                          historyEntry.analysis = analysisData as FeedbackAnalysisResult
                        }
                      })

                      allFeedbacks.push(historyEntry)
                    }
                  }
                })
              }
            })
          }
        })

        // 피드백 정렬 (최신순)
        allFeedbacks.sort((a, b) => b.timestamp - a.timestamp)
        setFeedbackHistory(allFeedbacks)
        
        // 성장 메트릭 계산
        calculateGrowthMetrics(allFeedbacks)
        setLoading(false)
      })
    } catch (error) {
      console.error('피드백 이력 로드 오류:', error)
      setLoading(false)
    }
  }

  const getTimeRangeCutoff = (range: string): Date => {
    const now = new Date()
    switch (range) {
      case '1month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      default:
        return new Date(2020, 0, 1) // 충분히 과거 날짜
    }
  }

  const calculateGrowthMetrics = (feedbacks: FeedbackHistoryEntry[]) => {
    if (feedbacks.length === 0) {
      setGrowthMetrics(null)
      return
    }

    const analyzedFeedbacks = feedbacks.filter(f => f.analysis)
    
    if (analyzedFeedbacks.length === 0) {
      setGrowthMetrics({
        totalFeedbacks: feedbacks.length,
        averageQuality: 0,
        qualityTrend: 'stable',
        strongestDimensions: [],
        improvementAreas: [],
        monthlyProgress: []
      })
      return
    }

    const totalQuality = analyzedFeedbacks.reduce((sum, f) => sum + (f.analysis?.qualityScore.overall || 0), 0)
    const averageQuality = totalQuality / analyzedFeedbacks.length

    // 품질 트렌드 계산 (최근 30% vs 이전 70%)
    const recentCount = Math.max(1, Math.floor(analyzedFeedbacks.length * 0.3))
    const recentFeedbacks = analyzedFeedbacks.slice(0, recentCount)
    const olderFeedbacks = analyzedFeedbacks.slice(recentCount)

    const recentAvg = recentFeedbacks.reduce((sum, f) => sum + (f.analysis?.qualityScore.overall || 0), 0) / recentFeedbacks.length
    const olderAvg = olderFeedbacks.length > 0 ? 
      olderFeedbacks.reduce((sum, f) => sum + (f.analysis?.qualityScore.overall || 0), 0) / olderFeedbacks.length : recentAvg

    let qualityTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentAvg > olderAvg + 5) qualityTrend = 'improving'
    else if (recentAvg < olderAvg - 5) qualityTrend = 'declining'

    // 차원별 강점 분석
    const dimensionScores: Record<string, number[]> = {
      specificity: [],
      constructiveness: [],
      clarity: [],
      actionability: [],
      empathy: [],
      relevance: []
    }

    analyzedFeedbacks.forEach(f => {
      if (f.analysis) {
        Object.entries(f.analysis.qualityScore.dimensions).forEach(([key, value]) => {
          if (dimensionScores[key]) {
            dimensionScores[key].push(value)
          }
        })
      }
    })

    const dimensionAverages = Object.entries(dimensionScores).map(([dimension, scores]) => ({
      dimension,
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length
    })).filter(d => !isNaN(d.average))

    dimensionAverages.sort((a, b) => b.average - a.average)

    const strongestDimensions = dimensionAverages.slice(0, 2).map(d => getDimensionLabel(d.dimension))
    const improvementAreas = dimensionAverages.slice(-2).map(d => getDimensionLabel(d.dimension))

    // 월별 진행상황
    const monthlyData: Record<string, { total: number; count: number }> = {}
    
    analyzedFeedbacks.forEach(f => {
      const date = new Date(f.timestamp)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 }
      }
      
      monthlyData[monthKey].total += f.analysis?.qualityScore.overall || 0
      monthlyData[monthKey].count += 1
    })

    const monthlyProgress = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        averageScore: Math.round(data.total / data.count),
        feedbackCount: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    setGrowthMetrics({
      totalFeedbacks: feedbacks.length,
      averageQuality: Math.round(averageQuality),
      qualityTrend,
      strongestDimensions,
      improvementAreas,
      monthlyProgress
    })
  }

  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      specificity: '구체성',
      constructiveness: '건설성',
      clarity: '명확성',
      actionability: '실행가능성',
      empathy: '공감성',
      relevance: '관련성'
    }
    return labels[dimension] || dimension
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const runAdvancedGrowthAnalysis = async () => {
    if (!userApiKey) {
      alert('고급 분석을 위해 API 키가 필요합니다.')
      return
    }

    const analyzedFeedbacks = feedbackHistory.filter(f => f.analysis)
    if (analyzedFeedbacks.length < 3) {
      alert('고급 분석을 위해서는 최소 3개의 분석된 피드백이 필요합니다.')
      return
    }

    setAdvancedAnalysisLoading(true)
    
    try {
      // 성장 패턴 분석
      const patterns = await analyzeGrowthPatterns(
        analyzedFeedbacks.map(f => f.analysis!).sort((a, b) => a.analysisDate - b.analysisDate)
      )
      setGrowthPatterns(patterns)

      // 학습 이정표 식별
      const milestones = await identifyLearningMilestones(
        analyzedFeedbacks.map(f => f.analysis!).sort((a, b) => a.analysisDate - b.analysisDate),
        userApiKey
      )
      setLearningMilestones(milestones)

      // 성장 인사이트 생성
      const insights = await generateGrowthInsights(patterns, milestones, userApiKey)
      setGrowthInsights(insights)

      // 개인화된 성장 계획 생성
      const currentLevel = {
        overall: growthMetrics?.averageQuality || 0,
        strengths: growthMetrics?.strongestDimensions || [],
        improvements: growthMetrics?.improvementAreas || []
      }
      
      const plan = await createPersonalizedGrowthPlan(
        userId,
        patterns,
        insights,
        currentLevel,
        userApiKey
      )
      setPersonalizedPlan(plan)

      setShowAdvancedAnalysis(true)
      alert('고급 성장 분석이 완료되었습니다!')
    } catch (error) {
      console.error('고급 성장 분석 오류:', error)
      alert('고급 성장 분석 중 오류가 발생했습니다.')
    } finally {
      setAdvancedAnalysisLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">피드백 이력을 불러오는 중...</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 필터 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 피드백 성장 추적</h2>
            <p className="text-gray-600">피드백 이력과 성장 패턴을 분석합니다</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'received' | 'given' | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">모든 피드백</option>
              <option value="given">내가 준 피드백</option>
              <option value="received">받은 피드백</option>
            </select>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as '1month' | '3months' | '6months' | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="1month">최근 1개월</option>
              <option value="3months">최근 3개월</option>
              <option value="6months">최근 6개월</option>
              <option value="all">전체</option>
            </select>

            {userApiKey && feedbackHistory.filter(f => f.analysis).length >= 3 && (
              <Button
                onClick={runAdvancedGrowthAnalysis}
                disabled={advancedAnalysisLoading}
                variant="outline"
              >
                {advancedAnalysisLoading ? '분석 중...' : '🚀 고급 분석'}
              </Button>
            )}
          </div>
        </div>

        {/* 성장 메트릭 요약 */}
        {growthMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{growthMetrics.totalFeedbacks}</div>
              <div className="text-sm text-blue-800">총 피드백 수</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{growthMetrics.averageQuality}</div>
              <div className="text-sm text-purple-800">평균 품질 점수</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className={`text-2xl font-bold flex items-center ${getTrendColor(growthMetrics.qualityTrend)}`}>
                <span className="mr-2">{getTrendIcon(growthMetrics.qualityTrend)}</span>
                {growthMetrics.qualityTrend === 'improving' ? '개선' : 
                 growthMetrics.qualityTrend === 'declining' ? '하락' : '안정'}
              </div>
              <div className="text-sm text-gray-600">품질 트렌드</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {growthMetrics.monthlyProgress.length}
              </div>
              <div className="text-sm text-orange-800">활동 월수</div>
            </div>
          </div>
        )}
      </Card>

      {/* 고급 성장 분석 결과 */}
      {showAdvancedAnalysis && (
        <>
          {/* 성장 패턴 분석 */}
          {growthPatterns.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🔬 성장 패턴 분석</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {growthPatterns.map((pattern, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{pattern.dimension}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pattern.pattern === 'improving' ? 'bg-green-100 text-green-800' :
                        pattern.pattern === 'declining' ? 'bg-red-100 text-red-800' :
                        pattern.pattern === 'fluctuating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pattern.pattern === 'improving' ? '개선 중' :
                         pattern.pattern === 'declining' ? '하락' :
                         pattern.pattern === 'fluctuating' ? '변동' : '안정'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">트렌드 강도:</span>
                        <span className="font-medium">{pattern.trendStrength.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 변화:</span>
                        <span className={`font-medium ${pattern.averageChange > 0 ? 'text-green-600' : pattern.averageChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {pattern.averageChange > 0 ? '+' : ''}{pattern.averageChange.toFixed(1)}
                        </span>
                      </div>
                      
                      {pattern.significantEvents.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-gray-700">주요 이벤트:</span>
                          <div className="mt-1 space-y-1">
                            {pattern.significantEvents.slice(0, 2).map((event, eventIndex) => (
                              <div key={eventIndex} className="text-xs text-gray-600">
                                <span className={
                                  event.type === 'breakthrough' ? 'text-green-600' :
                                  event.type === 'setback' ? 'text-red-600' : 'text-yellow-600'
                                }>
                                  {event.type === 'breakthrough' ? '📈' :
                                   event.type === 'setback' ? '📉' : '➡️'}
                                </span>
                                <span className="ml-1">{event.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 학습 이정표 */}
          {learningMilestones.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🏆 학습 이정표</h3>
              
              <div className="space-y-4">
                {learningMilestones.map((milestone, index) => (
                  <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">{milestone.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        milestone.category === 'quality_improvement' ? 'bg-green-100 text-green-800' :
                        milestone.category === 'consistency' ? 'bg-blue-100 text-blue-800' :
                        milestone.category === 'specific_skill' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {milestone.category === 'quality_improvement' ? '품질 향상' :
                         milestone.category === 'consistency' ? '일관성' :
                         milestone.category === 'specific_skill' ? '특정 기술' : '전체 성장'}
                      </span>
                    </div>
                    
                    <p className="text-blue-800 text-sm mb-3">{milestone.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">근거:</span>
                        <ul className="mt-1 space-y-1">
                          {milestone.evidence.map((evidence, evidenceIndex) => (
                            <li key={evidenceIndex} className="text-blue-600">• {evidence}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="font-medium text-blue-700">다음 목표:</span>
                        <ul className="mt-1 space-y-1">
                          {milestone.nextGoals.map((goal, goalIndex) => (
                            <li key={goalIndex} className="text-blue-600">→ {goal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 성장 인사이트 */}
          {growthInsights.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 성장 인사이트</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {growthInsights.map((insight, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    insight.type === 'strength' ? 'border-green-200 bg-green-50' :
                    insight.type === 'opportunity' ? 'border-blue-200 bg-blue-50' :
                    insight.type === 'concern' ? 'border-red-200 bg-red-50' :
                    'border-purple-200 bg-purple-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        insight.type === 'strength' ? 'text-green-900' :
                        insight.type === 'opportunity' ? 'text-blue-900' :
                        insight.type === 'concern' ? 'text-red-900' :
                        'text-purple-900'
                      }`}>
                        {insight.type === 'strength' ? '💪' :
                         insight.type === 'opportunity' ? '🎯' :
                         insight.type === 'concern' ? '⚠️' : '🎉'} {insight.title}
                      </h4>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      insight.type === 'strength' ? 'text-green-800' :
                      insight.type === 'opportunity' ? 'text-blue-800' :
                      insight.type === 'concern' ? 'text-red-800' :
                      'text-purple-800'
                    }`}>
                      {insight.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div>
                        <span className={`text-xs font-medium ${
                          insight.type === 'strength' ? 'text-green-700' :
                          insight.type === 'opportunity' ? 'text-blue-700' :
                          insight.type === 'concern' ? 'text-red-700' :
                          'text-purple-700'
                        }`}>
                          실행 방안:
                        </span>
                        <ul className={`text-xs mt-1 space-y-1 ${
                          insight.type === 'strength' ? 'text-green-600' :
                          insight.type === 'opportunity' ? 'text-blue-600' :
                          insight.type === 'concern' ? 'text-red-600' :
                          'text-purple-600'
                        }`}>
                          {insight.actionableAdvice.slice(0, 2).map((advice, adviceIndex) => (
                            <li key={adviceIndex}>• {advice}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">예상 기간: {insight.timeframe}</span>
                        <span className="text-gray-600">신뢰도: {insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 개인화된 성장 계획 */}
          {personalizedPlan && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 개인 성장 계획</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 단기 목표 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 단기 목표 (1-3개월)</h4>
                  <div className="space-y-3">
                    {personalizedPlan.shortTermGoals.map((goal, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{goal.goal}</h5>
                          <span className="text-sm font-medium text-blue-600">목표: {goal.targetScore}점</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">기간: {goal.timeframe}</p>
                        <div>
                          <span className="text-xs font-medium text-gray-700">전략:</span>
                          <ul className="text-xs text-gray-600 mt-1">
                            {goal.strategies.map((strategy, strategyIndex) => (
                              <li key={strategyIndex}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 장기 비전 & 실천사항 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🌟 장기 비전</h4>
                  <div className="border border-gray-200 rounded-lg p-3 mb-4">
                    <p className="text-gray-900 mb-2">{personalizedPlan.longTermVision.description}</p>
                    <p className="text-sm text-gray-600 mb-2">타임라인: {personalizedPlan.longTermVision.timeline}</p>
                    <div>
                      <span className="text-sm font-medium text-gray-700">주요 이정표:</span>
                      <ul className="text-sm text-gray-600 mt-1">
                        {personalizedPlan.longTermVision.milestones.map((milestone, milestoneIndex) => (
                          <li key={milestoneIndex}>• {milestone}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-3">📅 일일 실천사항</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {personalizedPlan.dailyPractices.map((practice, practiceIndex) => (
                        <li key={practiceIndex}>✓ {practice}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-3">📊 주간 점검사항</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <ul className="text-sm text-blue-800 space-y-1">
                      {personalizedPlan.weeklyCheckpoints.map((checkpoint, checkpointIndex) => (
                        <li key={checkpointIndex}>□ {checkpoint}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* 성장 분석 */}
      {growthMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 강점 및 개선 영역 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 강점 및 개선 영역</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">강한 영역</h4>
                <div className="space-y-1">
                  {growthMetrics.strongestDimensions.map((dimension, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-sm text-green-600">{dimension}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-700 mb-2">개선 필요 영역</h4>
                <div className="space-y-1">
                  {growthMetrics.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span className="text-sm text-orange-600">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 월별 진행상황 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 월별 진행상황</h3>
            
            <div className="space-y-3">
              {growthMetrics.monthlyProgress.slice(-6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">
                      {month.month}
                    </span>
                    <div className="ml-3 flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, month.averageScore)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{month.averageScore}점</div>
                    <div className="text-xs text-gray-500">{month.feedbackCount}개</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 피드백 이력 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 피드백 이력</h3>
        
        {feedbackHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            선택한 기간에 피드백 이력이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {entry.feedbackContent.fromUser} → {entry.feedbackContent.toUser}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.sessionTitle}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  
                  {entry.analysis && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {entry.analysis.qualityScore.overall}
                      </div>
                      <div className="text-xs text-gray-500">품질 점수</div>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-900 text-sm mb-3">
                  {entry.feedbackContent.content.length > 200 
                    ? `${entry.feedbackContent.content.substring(0, 200)}...` 
                    : entry.feedbackContent.content}
                </p>
                
                {entry.analysis && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div>구체성: {entry.analysis.qualityScore.dimensions.specificity}</div>
                      <div>건설성: {entry.analysis.qualityScore.dimensions.constructiveness}</div>
                      <div>명확성: {entry.analysis.qualityScore.dimensions.clarity}</div>
                      <div>실행성: {entry.analysis.qualityScore.dimensions.actionability}</div>
                      <div>공감성: {entry.analysis.qualityScore.dimensions.empathy}</div>
                      <div>관련성: {entry.analysis.qualityScore.dimensions.relevance}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {feedbackHistory.length > 10 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  더 보기 ({feedbackHistory.length - 10}개 더)
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}