'use client'

import { useState, useEffect } from 'react'
import { useEducationLevel, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { SessionType } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'

interface LearnerAnalysisProps {
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

interface LearnerAnalysisResult {
  learningOutcomes: {
    knowledgeGain: string
    skillDevelopment: string
    personalGrowth: string
    overallScore: number
  }
  learningProgress: {
    currentLevel: string
    strengthAreas: string[]
    challengeAreas: string[]
    progressIndicators: string[]
  }
  recommendations: {
    nextSteps: string[]
    additionalResources: string[]
    practiceActivities: string[]
    selfReflectionQuestions: string[]
  }
  motivationFactors: {
    intrinsicMotivation: string
    extrinsicFactors: string[]
    engagementLevel: string
    sustainabilityTips: string[]
  }
}

export default function LearnerAnalysisDashboard({
  questions,
  sessionType,
  adultLearnerType,
  userApiKey,
  sessionData
}: LearnerAnalysisProps) {
  const { currentLevel } = useEducationLevel()
  const theme = useFullTheme()
  
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<LearnerAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLearnerAnalysis = async () => {
    if (!userApiKey || questions.length === 0) {
      setError('API 키가 설정되지 않았거나 분석할 질문이 없습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/learner-analysis', {
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
      console.error('Learner analysis error:', error)
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

  const getLevelIcon = (level: string) => {
    if (level.includes('초급') || level.includes('beginner')) return '🌱'
    if (level.includes('중급') || level.includes('intermediate')) return '🌿'
    if (level.includes('고급') || level.includes('advanced')) return '🌲'
    return '🎯'
  }

  return (
    <div className="space-y-6">
      {/* 분석 시작 카드 */}
      <Card>
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
          🎓 학습자 관점 성과 분석
        </h2>
        
        <div className="mb-4">
          <p style={{ color: theme.colors.text.secondary }}>
            질문 데이터를 기반으로 학습자의 성과와 향후 학습 방향을 분석합니다.
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
            onClick={handleLearnerAnalysis} 
            disabled={isLoading || !userApiKey || questions.length === 0}
            className="px-6"
          >
            {isLoading ? '분석 중...' : '학습 성과 분석 시작'}
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
          {/* 학습 성과 종합 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              📈 학습 성과 종합
            </h3>
            
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold ${getScoreColor(analysisResult.learningOutcomes.overallScore)}`}>
                {analysisResult.learningOutcomes.overallScore}점
              </div>
              <div className="mt-2 text-lg font-medium">
                {getScoreLabel(analysisResult.learningOutcomes.overallScore)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center justify-center">
                  🧠 지식 습득
                </h4>
                <p className="text-sm text-gray-600">{analysisResult.learningOutcomes.knowledgeGain}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center justify-center">
                  🛠️ 기술 개발
                </h4>
                <p className="text-sm text-gray-600">{analysisResult.learningOutcomes.skillDevelopment}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center justify-center">
                  🌟 개인 성장
                </h4>
                <p className="text-sm text-gray-600">{analysisResult.learningOutcomes.personalGrowth}</p>
              </div>
            </div>
          </Card>

          {/* 학습 진행 상황 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              📊 학습 진행 상황
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{getLevelIcon(analysisResult.learningProgress.currentLevel)}</span>
                <div>
                  <h4 className="font-medium">현재 학습 수준</h4>
                  <p className="text-gray-600">{analysisResult.learningProgress.currentLevel}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-green-700">💪 강점 영역</h4>
                <ul className="space-y-2">
                  {analysisResult.learningProgress.strengthAreas?.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-orange-700">🎯 도전 영역</h4>
                <ul className="space-y-2">
                  {analysisResult.learningProgress.challengeAreas?.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-0.5">⚡</span>
                      <span className="text-sm">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">📋 진전 지표</h4>
              <ul className="space-y-2">
                {analysisResult.learningProgress.progressIndicators?.map((indicator, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-0.5">📌</span>
                    <span className="text-sm text-blue-800">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* 학습 방향 및 추천사항 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              🚀 학습 방향 및 추천사항
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-purple-700">📈 다음 단계</h4>
                <div className="space-y-2">
                  {analysisResult.recommendations.nextSteps?.map((step, index) => (
                    <div key={index} className="flex items-start p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <span className="text-purple-600 mr-2 mt-0.5 font-bold">{index + 1}</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-indigo-700">📚 추가 학습 자료</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.additionalResources?.map((resource, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 mr-2 mt-0.5">📖</span>
                        <span className="text-sm">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-teal-700">🏃‍♂️ 실습 활동</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.practiceActivities?.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-teal-500 mr-2 mt-0.5">🔨</span>
                        <span className="text-sm">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium mb-3 text-yellow-900">🤔 자기 성찰 질문</h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.selfReflectionQuestions?.map((question, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">❓</span>
                      <span className="text-sm text-yellow-800">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* 동기 유발 및 지속성 */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
              🔥 동기 유발 및 지속성
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-green-700">💝 내재적 동기</h4>
                  <p className="text-sm text-gray-600">{analysisResult.motivationFactors.intrinsicMotivation}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-700">⚡ 참여 수준</h4>
                  <p className="text-sm text-gray-600">{analysisResult.motivationFactors.engagementLevel}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-orange-700">🏆 외적 동기 요인</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.motivationFactors.extrinsicFactors?.map((factor, index) => (
                    <div key={index} className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-orange-600 mr-2 mt-0.5">🎯</span>
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium mb-3 text-green-900">🌱 지속성 유지 팁</h4>
                <ul className="space-y-2">
                  {analysisResult.motivationFactors.sustainabilityTips?.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-0.5">💡</span>
                      <span className="text-sm text-green-800">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}