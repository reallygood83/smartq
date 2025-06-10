'use client'

import { useState, useEffect } from 'react'
import { useEducationLevel, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { SessionType } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'

interface QualityMonitoringProps {
  questions: string[]
  sessionType: SessionType
  adultLearnerType?: AdultLearnerType
  userApiKey: string
  sessionData?: {
    title: string
    participantCount?: string
    duration?: string
    learningGoals?: string
    industryFocus?: string
    difficultyLevel?: string
  }
  realTimeData?: {
    activeParticipants: number
    questionSubmissionRate: number
    avgResponseTime: number
    sessionDuration: number
  }
}

interface QualityMetrics {
  participationMetrics: {
    submissionFrequency: string
    interactionLevel: string
    concentrationLevel: string
    overallScore: number
  }
  learningEffectiveness: {
    conceptUnderstanding: string
    practicalConnection: string
    goalProgress: string
    overallScore: number
  }
  satisfactionIndicators: {
    contentAppropriatenesss: string
    deliveryMethod: string
    expectationAlignment: string
    overallScore: number
  }
  improvementSignals: {
    comprehensionIssues: string[]
    engagementDecline: string[]
    pacingProblems: string[]
    immediateActions: string[]
  }
  recommendations: {
    realTimeAdjustments: string[]
    sessionOptimization: string[]
    followUpActions: string[]
    qualityEnhancements: string[]
  }
}

export default function QualityMonitoringDashboard({
  questions,
  sessionType,
  adultLearnerType,
  userApiKey,
  sessionData,
  realTimeData
}: QualityMonitoringProps) {
  const { currentLevel } = useEducationLevel()
  const theme = useFullTheme()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // 실시간 모니터링 간격 (30초)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isMonitoring && userApiKey && questions && questions.length > 0) {
      interval = setInterval(() => {
        handleQualityAnalysis(false) // 조용한 업데이트 (로딩 표시 없음)
      }, 30000) // 30초마다
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMonitoring, userApiKey, questions.length])

  const handleQualityAnalysis = async (showLoading = true) => {
    if (!userApiKey || questions.length === 0) {
      setError('API 키가 설정되지 않았거나 분석할 질문이 없습니다.')
      return
    }

    if (showLoading) setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/quality-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions,
          sessionType,
          adultLearnerType,
          userApiKey,
          educationLevel: currentLevel,
          sessionData,
          realTimeData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      setQualityMetrics(data.data)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('Quality monitoring error:', error)
      if (showLoading) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring) {
      handleQualityAnalysis()
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '우수'
    if (score >= 60) return '양호'
    return '개선 필요'
  }

  const getStatusDot = (isActive: boolean) => (
    <span className={`inline-block w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
  )

  return (
    <div className="space-y-6">
      {/* 모니터링 제어 패널 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
              📊 실시간 교육 품질 모니터링
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
              실시간으로 세션의 품질 지표를 분석하고 개선 방안을 제시합니다
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusDot(isMonitoring)}
            <span className="text-sm font-medium">
              {isMonitoring ? '모니터링 중' : '모니터링 중지'}
            </span>
          </div>
        </div>

        {sessionData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3" style={{ color: theme.colors.text.primary }}>
              📋 세션 개요
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">세션:</span>
                <p className="text-gray-600">{sessionData.title}</p>
              </div>
              <div>
                <span className="font-medium">참여자:</span>
                <p className="text-gray-600">{sessionData.participantCount || '미지정'}</p>
              </div>
              <div>
                <span className="font-medium">진행 시간:</span>
                <p className="text-gray-600">{sessionData.duration || '미지정'}</p>
              </div>
              <div>
                <span className="font-medium">질문 수:</span>
                <p className="text-gray-600">{questions.length}개</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button 
            onClick={toggleMonitoring}
            variant={isMonitoring ? "outline" : "default"}
            disabled={!userApiKey || questions.length === 0}
            className="px-6"
          >
            {isMonitoring ? '모니터링 중지' : '실시간 모니터링 시작'}
          </Button>

          <Button 
            onClick={() => handleQualityAnalysis()}
            disabled={isLoading || !userApiKey || questions.length === 0}
            variant="outline"
          >
            {isLoading ? '분석 중...' : '즉시 분석'}
          </Button>

          {lastUpdateTime && (
            <span className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Card>

      {/* 실시간 데이터 표시 */}
      {realTimeData && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            ⚡ 실시간 세션 데이터
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{realTimeData.activeParticipants}</div>
              <div className="text-sm text-gray-600">활성 참여자</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{realTimeData.questionSubmissionRate}%</div>
              <div className="text-sm text-gray-600">질문 제출률</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{realTimeData.avgResponseTime}초</div>
              <div className="text-sm text-gray-600">평균 응답 시간</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{realTimeData.sessionDuration}분</div>
              <div className="text-sm text-gray-600">세션 진행 시간</div>
            </div>
          </div>
        </Card>
      )}

      {/* 품질 메트릭 분석 결과 */}
      {qualityMetrics && (
        <>
          {/* 종합 품질 지표 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              📈 종합 품질 지표
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold ${getScoreColor(qualityMetrics.participationMetrics.overallScore)}`}>
                  {qualityMetrics.participationMetrics.overallScore}
                </div>
                <h4 className="font-medium mt-2">참여도</h4>
                <p className="text-sm text-gray-600">{getScoreLabel(qualityMetrics.participationMetrics.overallScore)}</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold ${getScoreColor(qualityMetrics.learningEffectiveness.overallScore)}`}>
                  {qualityMetrics.learningEffectiveness.overallScore}
                </div>
                <h4 className="font-medium mt-2">학습 효과성</h4>
                <p className="text-sm text-gray-600">{getScoreLabel(qualityMetrics.learningEffectiveness.overallScore)}</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold ${getScoreColor(qualityMetrics.satisfactionIndicators.overallScore)}`}>
                  {qualityMetrics.satisfactionIndicators.overallScore}
                </div>
                <h4 className="font-medium mt-2">만족도</h4>
                <p className="text-sm text-gray-600">{getScoreLabel(qualityMetrics.satisfactionIndicators.overallScore)}</p>
              </div>
            </div>
          </Card>

          {/* 세부 분석 결과 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 참여도 지표 */}
            <Card>
              <h4 className="font-medium mb-4 text-blue-700">🙋‍♂️ 참여도 지표</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">질문 제출 빈도:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.participationMetrics.submissionFrequency}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">상호작용 수준:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.participationMetrics.interactionLevel}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">집중도:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.participationMetrics.concentrationLevel}</p>
                </div>
              </div>
            </Card>

            {/* 학습 효과성 */}
            <Card>
              <h4 className="font-medium mb-4 text-green-700">🎯 학습 효과성</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">개념 이해도:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.learningEffectiveness.conceptUnderstanding}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">실무 연결성:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.learningEffectiveness.practicalConnection}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">목표 진행률:</span>
                  <p className="text-sm text-gray-600">{qualityMetrics.learningEffectiveness.goalProgress}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* 만족도 지표 */}
          <Card>
            <h4 className="font-medium mb-4 text-purple-700">😊 만족도 지표</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium">콘텐츠 적절성:</span>
                <p className="text-sm text-gray-600">{qualityMetrics.satisfactionIndicators.contentAppropriatenesss}</p>
              </div>
              <div>
                <span className="text-sm font-medium">진행 방식:</span>
                <p className="text-sm text-gray-600">{qualityMetrics.satisfactionIndicators.deliveryMethod}</p>
              </div>
              <div>
                <span className="text-sm font-medium">기대치 충족:</span>
                <p className="text-sm text-gray-600">{qualityMetrics.satisfactionIndicators.expectationAlignment}</p>
              </div>
            </div>
          </Card>

          {/* 개선 신호 감지 */}
          {(qualityMetrics?.improvementSignals?.comprehensionIssues?.length > 0 || 
            qualityMetrics?.improvementSignals?.engagementDecline?.length > 0 || 
            qualityMetrics?.improvementSignals?.pacingProblems?.length > 0) && (
            <Card>
              <h4 className="font-medium mb-4 text-red-700">⚠️ 개선 신호 감지</h4>
              
              <div className="space-y-4">
                {qualityMetrics.improvementSignals.comprehensionIssues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-2">이해 부족 신호:</h5>
                    <ul className="space-y-1">
                      {qualityMetrics.improvementSignals.comprehensionIssues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-0.5">⚠</span>
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {qualityMetrics.improvementSignals.engagementDecline.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-orange-600 mb-2">참여도 저하 징후:</h5>
                    <ul className="space-y-1">
                      {qualityMetrics.improvementSignals.engagementDecline.map((decline, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2 mt-0.5">📉</span>
                          <span className="text-sm">{decline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {qualityMetrics.improvementSignals.pacingProblems.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-yellow-600 mb-2">진행 속도 문제:</h5>
                    <ul className="space-y-1">
                      {qualityMetrics.improvementSignals.pacingProblems.map((problem, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2 mt-0.5">⏱️</span>
                          <span className="text-sm">{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 즉시 개선 방안 */}
          <Card>
            <h4 className="font-medium mb-4 text-green-700">🚀 즉시 개선 방안</h4>
            
            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-medium text-blue-600 mb-3">⚡ 실시간 조정:</h5>
                <div className="space-y-2">
                  {qualityMetrics.recommendations.realTimeAdjustments.map((adjustment, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-600 mr-2 mt-0.5 font-bold">{index + 1}</span>
                      <span className="text-sm">{adjustment}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-purple-600 mb-3">🔧 세션 최적화:</h5>
                  <ul className="space-y-2">
                    {qualityMetrics.recommendations.sessionOptimization.map((optimization, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2 mt-0.5">🔧</span>
                        <span className="text-sm">{optimization}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-green-600 mb-3">📋 후속 활동:</h5>
                  <ul className="space-y-2">
                    {qualityMetrics.recommendations.followUpActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">📋</span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}