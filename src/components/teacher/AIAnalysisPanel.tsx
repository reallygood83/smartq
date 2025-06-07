'use client'

import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'

interface AIAnalysisPanelProps {
  session: Session
  questions: Question[]
  sessionId: string
}

type AnalysisType = 'quick' | 'detailed'

export default function AIAnalysisPanel({ session, questions, sessionId }: AIAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>('quick')

  const hasApiKey = !!getStoredApiKey()
  const canAnalyze = hasApiKey && questions.length > 0

  const handleAnalysis = async (type: AnalysisType) => {
    if (!canAnalyze) return

    setIsAnalyzing(true)
    setAnalysisType(type)
    const apiKey = getStoredApiKey()
    
    try {
      const endpoint = type === 'quick' 
        ? '/api/ai/analyze-questions'
        : '/api/ai/analyze-adult-session'

      const requestBody = {
        questions: questions.map(q => q.text),
        sessionType: session.sessionType,
        subjects: session.subjects || ['general'], // 교과목 정보 추가
        userApiKey: apiKey,
        keywords: session.keywords || [],
        educationLevel: session.isAdultEducation ? 'adult' : 'elementary',
        adultLearnerType: session.adultLearnerType,
        industryFocus: session.industryFocus,
        difficultyLevel: session.difficultyLevel,
        analysisType: type === 'detailed' ? 'comprehensive' : 'quick'
      }

      // 성인 교육 세션인 경우 추가 정보 포함
      if (session.isAdultEducation && type === 'detailed') {
        Object.assign(requestBody, {
          sessionData: {
            title: session.title,
            participantCount: session.participantCount,
            duration: session.duration,
            learningGoals: session.learningGoals,
            industryFocus: session.industryFocus,
            difficultyLevel: session.difficultyLevel
          }
        })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(`분석 실패: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      setAnalysisResult(result)
      
    } catch (error) {
      console.error('AI 분석 오류:', error)
      const errorMessage = error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.'
      alert(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderAnalysisResult = () => {
    if (!analysisResult) return null

    const data = analysisResult.data || analysisResult

    return (
      <div className="space-y-4">
        {/* 주요 인사이트 */}
        {data.sessionAnalysis && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">📊 세션 분석</h4>
            <div className="space-y-2">
              {Object.entries(data.sessionAnalysis).map(([key, value], idx) => (
                value && (
                  <div key={idx}>
                    <span className="text-sm font-medium text-blue-800">
                      {key === 'goalAchievement' ? '목표 달성도' :
                       key === 'participantEngagement' ? '참여 수준' :
                       key === 'effectiveness' ? '효과성' :
                       key}:
                    </span>
                    <p className="text-sm text-blue-700 mt-1">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* 추천 활동 */}
        {data.activityRecommendations && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">🎯 추천 활동</h4>
            <div className="space-y-2">
              {Array.isArray(data.activityRecommendations) ? (
                data.activityRecommendations.slice(0, 3).map((activity: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-green-800">
                      {typeof activity === 'object' ? (activity.title || `활동 ${idx + 1}`) : `활동 ${idx + 1}`}
                    </span>
                    <p className="text-green-700 mt-1">
                      {typeof activity === 'object' ? activity.description : String(activity)}
                    </p>
                  </div>
                ))
              ) : typeof data.activityRecommendations === 'object' ? (
                Object.entries(data.activityRecommendations).slice(0, 3).map(([key, value], idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-green-800">{key}</span>
                    <p className="text-green-700 mt-1">{String(value)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-green-700">{String(data.activityRecommendations)}</p>
              )}
            </div>
          </div>
        )}

        {/* 개선 제안 */}
        {(data.practicalAnalysis || data.recommendations) && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-3">💡 개선 제안</h4>
            <div className="space-y-2">
              {data.practicalAnalysis && typeof data.practicalAnalysis === 'object' ? (
                Object.entries(data.practicalAnalysis).map(([key, value], idx) => (
                  value && (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-orange-800">
                        {key === 'recommendations' ? '실무 추천사항' : key}:
                      </span>
                      <p className="text-orange-700 mt-1">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  )
                ))
              ) : data.recommendations ? (
                <p className="text-sm text-orange-700">{String(data.recommendations)}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI 분석 시스템</h3>
              <p className="text-sm text-gray-600">
                {canAnalyze 
                  ? '질문을 분석하여 교육 인사이트를 제공합니다'
                  : !hasApiKey 
                    ? 'API 키 설정이 필요합니다' 
                    : '질문이 제출되면 분석할 수 있습니다'
                }
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6">
                {/* API 키 미설정 경고 */}
                {!hasApiKey && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      AI 분석을 사용하려면 Gemini API 키가 필요합니다.
                      <a href="/teacher/settings" className="ml-2 font-medium underline">
                        설정하기 →
                      </a>
                    </p>
                  </div>
                )}

                {/* 질문 없음 안내 */}
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      학생들이 질문을 제출하면 분석을 시작할 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 분석 버튼 */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAnalysis('quick')}
                        disabled={!canAnalyze || isAnalyzing}
                        isLoading={isAnalyzing && analysisType === 'quick'}
                        size="sm"
                      >
                        {isAnalyzing && analysisType === 'quick' ? '분석 중...' : '⚡ 빠른 분석'}
                      </Button>
                      <Button
                        onClick={() => handleAnalysis('detailed')}
                        disabled={!canAnalyze || isAnalyzing}
                        isLoading={isAnalyzing && analysisType === 'detailed'}
                        variant="outline"
                        size="sm"
                      >
                        {isAnalyzing && analysisType === 'detailed' ? '분석 중...' : '📊 상세 분석'}
                      </Button>
                    </div>

                    {/* 분석 결과 */}
                    {analysisResult && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            분석 결과 ({analysisType === 'quick' ? '빠른 분석' : '상세 분석'})
                          </span>
                          <span className="text-xs text-gray-500">
                            질문 {questions.length}개 분석
                          </span>
                        </div>
                        {renderAnalysisResult()}
                      </div>
                    )}

                    {/* 빠른 액션 */}
                    {canAnalyze && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/teacher/session/${sessionId}/comprehensive-analysis`}
                        >
                          📈 상세 분석 페이지
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/teacher/session/${sessionId}/real-time-monitoring`}
                        >
                          📡 실시간 모니터링
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}