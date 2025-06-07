'use client'

import { useState } from 'react'
import { useEducationLevel, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { SessionType } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'

interface AdultSessionAnalysisProps {
  questions: string[]
  sessionType: SessionType
  adultLearnerType: AdultLearnerType
  userApiKey: string
  industryFocus?: string
  difficultyLevel?: string
  participantCount?: string
  duration?: string
}

interface AnalysisResult {
  analysisType: string
  sessionAnalysis?: any
  practicalAnalysis?: any
  activityRecommendations?: any
  explanations?: any
  timestamp: string
}

export default function AdultSessionAnalysis({
  questions,
  sessionType,
  adultLearnerType,
  userApiKey,
  industryFocus,
  difficultyLevel,
  participantCount,
  duration
}: AdultSessionAnalysisProps) {
  const { currentLevel } = useEducationLevel()
  const theme = useFullTheme()
  
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('comprehensive')
  const [error, setError] = useState<string | null>(null)

  const analysisTypes = [
    { 
      value: 'comprehensive', 
      label: '종합 분석', 
      description: '실무 분석, 활동 추천, 세션 평가를 모두 포함',
      icon: '📊'
    },
    { 
      value: 'practical', 
      label: '실무 중심 분석', 
      description: '비즈니스 임팩트와 즉시 적용 방안 중심',
      icon: '💼'
    },
    { 
      value: 'activities', 
      label: '학습 활동 추천', 
      description: '경험 기반 학습 활동과 실습 방법 제안',
      icon: '🎯'
    },
    { 
      value: 'session', 
      label: '세션 품질 분석', 
      description: '교수자/학습자 관점의 양방향 세션 평가',
      icon: '📈'
    }
  ]

  const handleAnalysis = async () => {
    if (!userApiKey) {
      setError('API 키가 설정되지 않았습니다.')
      return
    }

    if (questions.length === 0) {
      setError('분석할 질문이 없습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-adult-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions,
          sessionType,
          adultLearnerType,
          userApiKey,
          analysisType: selectedAnalysisType,
          industryFocus,
          difficultyLevel,
          participantCount,
          duration
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      setAnalysisResult(data.data)
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderComprehensiveAnalysis = (result: AnalysisResult) => (
    <div className="space-y-6">
      {/* 세션 분석 */}
      {result.sessionAnalysis && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            📈 세션 효과성 분석
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">교수자 관점</h4>
              {result.sessionAnalysis.instructorAnalysis?.sessionEffectiveness && (
                <div className="space-y-2 text-sm">
                  <p><strong>목표 달성도:</strong> {result.sessionAnalysis.instructorAnalysis.sessionEffectiveness.goalAchievement}</p>
                  <p><strong>참여자 몰입도:</strong> {result.sessionAnalysis.instructorAnalysis.sessionEffectiveness.participantEngagement}</p>
                  <p><strong>실무 적용성:</strong> {result.sessionAnalysis.instructorAnalysis.sessionEffectiveness.practicalApplication}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">학습자 관점</h4>
              {result.sessionAnalysis.learnerAnalysis?.personalGrowth && (
                <div className="space-y-2 text-sm">
                  <p><strong>지식 습득:</strong> {result.sessionAnalysis.learnerAnalysis.personalGrowth.knowledgeGained}</p>
                  <p><strong>기술 향상:</strong> {result.sessionAnalysis.learnerAnalysis.personalGrowth.skillImprovement}</p>
                  <p><strong>경력 연관성:</strong> {result.sessionAnalysis.learnerAnalysis.personalGrowth.careerRelevance}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 실무 분석 */}
      {result.practicalAnalysis && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            💼 실무 적용 분석
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">📋 즉시 실행 가능한 액션</h4>
              <ul className="space-y-1 text-sm">
                {result.practicalAnalysis.immediateActions?.map((action: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">🎯 식별된 기술 격차</h4>
              <ul className="space-y-1 text-sm">
                {result.practicalAnalysis.skillGaps?.map((gap: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {result.practicalAnalysis.businessImpact && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">📊 비즈니스 임팩트 예측</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><strong>생산성 향상:</strong> {result.practicalAnalysis.businessImpact.productivityGain}</p>
                <p><strong>품질 개선:</strong> {result.practicalAnalysis.businessImpact.qualityImprovement}</p>
                <p><strong>협업 효과:</strong> {result.practicalAnalysis.businessImpact.collaborationBenefit}</p>
                <p><strong>ROI 예측:</strong> {result.practicalAnalysis.businessImpact.roi}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 활동 추천 */}
      {result.activityRecommendations?.activities && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            🎯 추천 학습 활동
          </h3>
          <div className="space-y-4">
            {result.activityRecommendations.activities.map((activity: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">
                    {activity.type === 'case_study' ? '📚' : 
                     activity.type === 'simulation' ? '🎮' :
                     activity.type === 'workshop' ? '🔧' :
                     activity.type === 'discussion' ? '💬' : '📋'}
                  </span>
                  <h4 className="font-medium">{activity.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <p><strong>소요시간:</strong> {activity.timeRequired}</p>
                  <p><strong>그룹크기:</strong> {activity.groupSize}</p>
                  <p><strong>예상성과:</strong> {activity.expectedOutcome}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  const renderSimpleAnalysis = (result: AnalysisResult) => {
    switch (result.analysisType) {
      case 'practical':
        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              💼 실무 중심 분석 결과
            </h3>
            {result.practicalInsights && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">🔍 핵심 발견사항</h4>
                  <ul className="space-y-1 text-sm">
                    {result.practicalInsights.keyFindings?.map((finding: string, index: number) => (
                      <li key={index}>• {finding}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p><strong>실무 적용 평가:</strong> {result.practicalInsights.realWorldApplication}</p>
                  <p><strong>학습 우선순위:</strong> {result.practicalInsights.learningPriority}</p>
                </div>
              </div>
            )}
          </Card>
        )
      
      case 'activities':
        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              🎯 학습 활동 추천
            </h3>
            {result.activities && result.activities.length > 0 && (
              <div className="space-y-4">
                {result.activities.map((activity: any, index: number) => (
                  <div key={index} className="p-3 border rounded">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
        
      case 'session':
        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              📈 세션 품질 분석
            </h3>
            {result.qualityMetrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">참여도 지표</h4>
                    <div className="text-sm space-y-1">
                      <p>질문 품질: {result.qualityMetrics.participationMetrics?.questionQuality}</p>
                      <p>참여도: {result.qualityMetrics.participationMetrics?.engagementLevel}</p>
                      <p>이해도: {result.qualityMetrics.participationMetrics?.comprehensionRate}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">만족도 지표</h4>
                    <div className="text-sm space-y-1">
                      <p>콘텐츠: {result.qualityMetrics.satisfactionIndicators?.contentRelevance}</p>
                      <p>진행방식: {result.qualityMetrics.satisfactionIndicators?.deliveryMethod}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">개선 권장사항</h4>
                    <ul className="text-sm space-y-1">
                      {result.qualityMetrics.recommendations?.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )
        
      default:
        return <div>결과를 표시할 수 없습니다.</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* 분석 유형 선택 */}
      <Card>
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          🤖 성인 교육 AI 분석
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {analysisTypes.map(type => (
            <label 
              key={type.value} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAnalysisType === type.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="analysisType"
                value={type.value}
                checked={selectedAnalysisType === type.value}
                onChange={(e) => setSelectedAnalysisType(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-sm mb-1">{type.label}</div>
                <div className="text-xs text-gray-600">{type.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleAnalysis} 
            disabled={isLoading || !userApiKey || questions.length === 0}
            className="px-8"
          >
            {isLoading ? '분석 중...' : 'AI 분석 시작'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Card>

      {/* 분석 결과 */}
      {analysisResult && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            📊 분석 결과
          </h3>
          {analysisResult.analysisType === 'comprehensive' 
            ? renderComprehensiveAnalysis(analysisResult)
            : renderSimpleAnalysis(analysisResult)
          }
        </div>
      )}
    </div>
  )
}