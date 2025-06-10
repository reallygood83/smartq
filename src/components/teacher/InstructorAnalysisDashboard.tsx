'use client'

import { useState, useEffect } from 'react'
import { useEducationLevel, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { SessionType } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'

interface InstructorAnalysisProps {
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
}

interface InstructorAnalysisResult {
  sessionEffectiveness: {
    goalAchievement: string
    participantEngagement: string
    practicalApplication: string
    overallScore: number
  }
  improvementAreas: string[]
  nextSteps: string[]
  recommendations: {
    contentAdjustment: string
    deliveryImprovement: string
    engagementStrategy: string
  }
  teachingInsights: {
    strengthAreas: string[]
    developmentAreas: string[]
    pedagogicalTips: string[]
  }
}

export default function InstructorAnalysisDashboard({
  questions,
  sessionType,
  adultLearnerType,
  userApiKey,
  sessionData
}: InstructorAnalysisProps) {
  const { currentLevel } = useEducationLevel()
  const theme = useFullTheme()
  
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<InstructorAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInstructorAnalysis = async () => {
    if (!userApiKey || questions.length === 0) {
      setError('API 키가 설정되지 않았거나 분석할 질문이 없습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/instructor-analysis', {
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
          sessionData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      setAnalysisResult(data.data)
    } catch (error) {
      console.error('Instructor analysis error:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-6">
      {/* 분석 시작 카드 */}
      <Card>
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          👩‍🏫 교수자 관점 교육 효과성 분석
        </h2>
        
        <div className="mb-4">
          <p style={{ color: theme.colors.text.secondary }}>
            질문 데이터를 바탕으로 수업의 효과성을 분석하고 개선 방안을 제시합니다.
          </p>
        </div>

        {sessionData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3" style={{ color: theme.colors.text.primary }}>
              📋 세션 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">세션 제목:</span>
                <p className="text-gray-600">{sessionData.title}</p>
              </div>
              {sessionData.participantCount && (
                <div>
                  <span className="font-medium">참여 인원:</span>
                  <p className="text-gray-600">{sessionData.participantCount}</p>
                </div>
              )}
              {sessionData.duration && (
                <div>
                  <span className="font-medium">진행 시간:</span>
                  <p className="text-gray-600">{sessionData.duration}</p>
                </div>
              )}
              {sessionData.learningGoals && (
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="font-medium">학습 목표:</span>
                  <p className="text-gray-600 mt-1">{sessionData.learningGoals}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleInstructorAnalysis} 
            disabled={isLoading || !userApiKey || questions.length === 0}
            className="px-6"
          >
            {isLoading ? '분석 중...' : '교육 효과성 분석 시작'}
          </Button>
          
          <span className="text-sm text-gray-500">
            {questions.length}개 질문 분석 대상
          </span>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Card>

      {/* 분석 결과 */}
      {analysisResult && (
        <>
          {/* 전체 효과성 점수 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              📊 전체 교육 효과성 점수
            </h3>
            
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold ${getScoreColor(analysisResult.sessionEffectiveness.overallScore)}`}>
                {analysisResult.sessionEffectiveness.overallScore}점
              </div>
              <div className="mt-2 text-lg font-medium">
                {getScoreLabel(analysisResult.sessionEffectiveness.overallScore)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">목표 달성도</h4>
                <p className="text-sm text-gray-600">{analysisResult.sessionEffectiveness.goalAchievement}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">참여자 몰입도</h4>
                <p className="text-sm text-gray-600">{analysisResult.sessionEffectiveness.participantEngagement}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">실무 적용성</h4>
                <p className="text-sm text-gray-600">{analysisResult.sessionEffectiveness.practicalApplication}</p>
              </div>
            </div>
          </Card>

          {/* 교수법 인사이트 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              💡 교수법 인사이트
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-green-700">🌟 강점 영역</h4>
                <ul className="space-y-2">
                  {analysisResult.teachingInsights.strengthAreas?.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-orange-700">🎯 개발 영역</h4>
                <ul className="space-y-2">
                  {analysisResult.teachingInsights.developmentAreas?.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-0.5">⚡</span>
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">📚 교수법 팁</h4>
              <ul className="space-y-2">
                {analysisResult.teachingInsights.pedagogicalTips?.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-0.5">💡</span>
                    <span className="text-sm text-blue-800">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* 개선 방안 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              🔧 구체적 개선 방안
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-purple-700">📝 콘텐츠 조정</h4>
                  <p className="text-sm text-gray-600">{analysisResult.recommendations.contentAdjustment}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-green-700">🎯 전달 방식 개선</h4>
                  <p className="text-sm text-gray-600">{analysisResult.recommendations.deliveryImprovement}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-700">🤝 참여 전략</h4>
                  <p className="text-sm text-gray-600">{analysisResult.recommendations.engagementStrategy}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">⚠️ 우선 개선 영역</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.improvementAreas?.map((area, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-yellow-600 mr-2 mt-0.5">⚠</span>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">📋 다음 단계 액션 플랜</h4>
                <div className="space-y-2">
                  {analysisResult.nextSteps?.map((step, index) => (
                    <div key={index} className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-600 mr-2 mt-0.5 font-bold">{index + 1}</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}