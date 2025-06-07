'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'
import { AdultLearnerType } from '@/types/education'

interface AIAnalysisPanelProps {
  session: Session
  questions: Question[]
  sessionId: string
}

type AnalysisTab = 'comprehensive' | 'instructor' | 'learner' | 'quality' | 'realtime'

interface TabInfo {
  id: AnalysisTab
  label: string
  icon: string
  description: string
  color: string
}

const ANALYSIS_TABS: TabInfo[] = [
  {
    id: 'comprehensive',
    label: '종합 분석',
    icon: '📊',
    description: '실무 분석, 학습 추천, 세션 평가 모두 포함',
    color: 'blue'
  },
  {
    id: 'instructor',
    label: '교수자 분석',
    icon: '🔍',
    description: '교수자/진행자 관점의 교육 효과성 분석',
    color: 'green'
  },
  {
    id: 'learner',
    label: '학습자 분석',
    icon: '🎯',
    description: '학습자/참여자 관점의 성과 및 방향 분석',
    color: 'purple'
  },
  {
    id: 'quality',
    label: '품질 분석',
    icon: '📈',
    description: '교육 품질 지표의 실시간 모니터링',
    color: 'orange'
  },
  {
    id: 'realtime',
    label: '실시간 모니터링',
    icon: '📡',
    description: '세션 진행 상황의 실시간 추적',
    color: 'red'
  }
]

export default function AIAnalysisPanel({ session, questions, sessionId }: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('comprehensive')
  const [isExpanded, setIsExpanded] = useState(true) // 기본적으로 열려있도록 변경
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<Record<AnalysisTab, any>>({
    comprehensive: null,
    instructor: null,
    learner: null,
    quality: null,
    realtime: null
  })

  const hasApiKey = !!getStoredApiKey()
  const canAnalyze = hasApiKey && questions.length > 0

  const handleAnalysis = async (type: AnalysisTab) => {
    if (!canAnalyze) return

    setIsAnalyzing(true)
    const apiKey = getStoredApiKey()
    
    try {
      let endpoint = ''
      let requestBody: any = {
        questions: questions.map(q => q.text),
        sessionType: session.sessionType,
        userApiKey: apiKey,
        educationLevel: session.isAdultEducation ? 'adult' : 'elementary',
        adultLearnerType: session.adultLearnerType
      }

      // 성인 교육 세션인 경우 추가 정보 포함
      if (session.isAdultEducation) {
        requestBody = {
          ...requestBody,
          sessionData: {
            title: session.title,
            participantCount: session.participantCount,
            duration: session.duration,
            learningGoals: session.learningGoals,
            industryFocus: session.industryFocus,
            difficultyLevel: session.difficultyLevel
          }
        }
      }

      switch (type) {
        case 'comprehensive':
          endpoint = '/api/ai/analyze-adult-session'
          requestBody.analysisType = 'comprehensive'
          break
        case 'instructor':
          endpoint = '/api/ai/instructor-analysis'
          break
        case 'learner':
          endpoint = '/api/ai/learner-analysis'
          break
        case 'quality':
          endpoint = '/api/ai/quality-monitoring'
          break
        case 'realtime':
          // 실시간 모니터링은 별도 페이지로 이동
          window.location.href = `/teacher/session/${sessionId}/real-time-monitoring`
          return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) throw new Error('분석 실패')

      const result = await response.json()
      setAnalysisResults(prev => ({ ...prev, [type]: result }))
      
    } catch (error) {
      console.error('AI 분석 오류:', error)
      alert('AI 분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderAnalysisResult = () => {
    const result = analysisResults[activeTab]
    
    if (!result) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            아직 분석을 실행하지 않았습니다.
          </p>
          <Button 
            onClick={() => handleAnalysis(activeTab)}
            disabled={!canAnalyze || isAnalyzing}
            isLoading={isAnalyzing}
          >
            {isAnalyzing ? '분석 중...' : '분석 시작'}
          </Button>
        </div>
      )
    }

    // 각 분석 타입별 결과 렌더링
    switch (activeTab) {
      case 'comprehensive':
        return renderComprehensiveAnalysis(result)
      case 'instructor':
        return renderInstructorAnalysis(result)
      case 'learner':
        return renderLearnerAnalysis(result)
      case 'quality':
        return renderQualityAnalysis(result)
      default:
        return <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
    }
  }

  const renderComprehensiveAnalysis = (data: any) => {
    console.log('Comprehensive analysis data:', data) // 디버깅용
    
    if (!data) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">분석 결과를 불러올 수 없습니다.</p>
        </div>
      )
    }

    // data 구조에 따른 유연한 처리
    const analysisData = data.data || data
    const { 
      sessionAnalysis, 
      practicalAnalysis, 
      activityRecommendations, 
      analysisType,
      // 기존 구조 지원
      instructorAnalysis, 
      nextSteps 
    } = analysisData || {}

    // 데이터가 비어있는 경우
    if (!sessionAnalysis && !practicalAnalysis && !activityRecommendations && !instructorAnalysis && !nextSteps) {
      return (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            분석 데이터가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            질문 데이터가 충분하지 않거나 분석에 실패했을 수 있습니다.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>원시 응답 데이터:</strong>
            </p>
            <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* 세션 분석 결과 */}
        {sessionAnalysis && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              🎯 세션 분석 결과
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {typeof sessionAnalysis === 'object' ? (
                <div className="space-y-4">
                  {Object.entries(sessionAnalysis).map(([key, value], idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700">
                          {key === 'goalAchievement' ? '목표 달성도' :
                           key === 'participantEngagement' ? '참여자 몰입도' :
                           key === 'practicalApplication' ? '실무 적용성' :
                           key === 'improvementAreas' ? '개선 필요 영역' :
                           key === 'effectiveness' ? '세션 효과성' :
                           key === 'engagement' ? '몰입도' :
                           key === 'applicability' ? '적용 가능성' :
                           key === 'recommendations' ? '추천사항' :
                           key}:
                        </span>
                        <div className="text-sm text-gray-900 mt-1">
                          {Array.isArray(value) ? (
                            value.map((item: any, itemIdx: number) => (
                              <div key={itemIdx} className="mb-1">• {String(item)}</div>
                            ))
                          ) : typeof value === 'object' ? (
                            <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            String(value) || '분석 중...'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-900">{String(sessionAnalysis)}</p>
              )}
            </div>
          </div>
        )}

        {/* 실무 분석 결과 */}
        {practicalAnalysis && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              💼 실무 적용 분석
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-3">
                {typeof practicalAnalysis === 'object' ? (
                  Object.entries(practicalAnalysis).map(([key, value], idx) => (
                    <div key={idx}>
                      <span className="text-sm font-medium text-blue-800 capitalize">
                        {key === 'industry' ? '산업 관련성' : 
                         key === 'applicability' ? '적용 가능성' :
                         key === 'recommendations' ? '실무 추천사항' :
                         key}:
                      </span>
                      <div className="text-sm text-blue-700 mt-1">
                        {Array.isArray(value) ? (
                          value.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="mb-1">• {String(item)}</div>
                          ))
                        ) : typeof value === 'object' ? (
                          <pre className="whitespace-pre-wrap text-xs bg-blue-100 p-2 rounded">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-blue-700">{String(practicalAnalysis)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 활동 추천 */}
        {activityRecommendations && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              🎯 추천 활동
            </h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-3">
                {Array.isArray(activityRecommendations) ? (
                  activityRecommendations.map((activity: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-green-900">
                        {typeof activity === 'object' ? (activity.title || activity.name || `활동 ${idx + 1}`) : `활동 ${idx + 1}`}
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        {typeof activity === 'object' ? (activity.description || activity.content || JSON.stringify(activity, null, 2)) : String(activity)}
                      </p>
                      {typeof activity === 'object' && activity.duration && (
                        <p className="text-xs text-green-600 mt-1">소요시간: {activity.duration}</p>
                      )}
                    </div>
                  ))
                ) : typeof activityRecommendations === 'object' && activityRecommendations !== null ? (
                  Object.entries(activityRecommendations).map(([key, value], idx) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-green-900">{key}</h5>
                      <div className="text-sm text-green-700 mt-1">
                        {typeof value === 'object' ? (
                          <pre className="whitespace-pre-wrap text-xs bg-green-100 p-2 rounded">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-800">{String(activityRecommendations)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 기존 구조 지원 - 교수자 분석 */}
        {instructorAnalysis && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              👨‍🏫 교수자 관점 분석
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-blue-800">세션 효과성:</span>
                  <p className="text-sm text-blue-700 mt-1">{instructorAnalysis.sessionEffectiveness?.goalAchievement}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">참여자 몰입도:</span>
                  <p className="text-sm text-blue-700 mt-1">{instructorAnalysis.sessionEffectiveness?.participantEngagement}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">실무 적용성:</span>
                  <p className="text-sm text-blue-700 mt-1">{instructorAnalysis.sessionEffectiveness?.practicalApplication}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 기존 구조 지원 - 다음 단계 추천 */}
        {nextSteps && nextSteps.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              🚀 추천 다음 단계
            </h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-2">
                {nextSteps.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">{idx + 1}.</span>
                    <span className="text-sm text-green-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInstructorAnalysis = (data: any) => {
    if (!data.data) return null
    const { sessionEffectiveness, teachingInsights, recommendations } = data.data

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">📊 세션 효과성</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>목표 달성도:</strong> {sessionEffectiveness?.goalAchievement}</p>
            <p><strong>참여자 몰입도:</strong> {sessionEffectiveness?.participantEngagement}</p>
            <p><strong>실무 적용성:</strong> {sessionEffectiveness?.practicalApplication}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">전체 점수</span>
                <span className="text-sm font-bold">{sessionEffectiveness?.overallScore || 0}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sessionEffectiveness?.overallScore || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">💡 교수법 인사이트</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">강점 영역</h5>
              <ul className="text-sm text-green-700 space-y-1">
                {teachingInsights?.strengthAreas?.map((item: string, idx: number) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="font-medium text-orange-900 mb-2">개발 필요 영역</h5>
              <ul className="text-sm text-orange-700 space-y-1">
                {teachingInsights?.developmentAreas?.map((item: string, idx: number) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderLearnerAnalysis = (data: any) => {
    if (!data.data) return null
    const { learningOutcomes, learningProgress, recommendations } = data.data

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">🎯 학습 성과</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">
                {learningOutcomes?.overallScore || 0}
              </div>
              <div className="text-sm text-blue-600 mt-1">전체 성취도</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-1">지식 습득</h5>
              <p className="text-sm text-green-700">{learningOutcomes?.knowledgeGain}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-1">기술 발전</h5>
              <p className="text-sm text-purple-700">{learningOutcomes?.skillDevelopment}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">📚 추천 학습 경로</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3">
              {recommendations?.nextSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">{idx + 1}.</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderQualityAnalysis = (data: any) => {
    if (!data.data) return null
    const { participationMetrics, learningMetrics, satisfactionMetrics } = data.data

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">📈 품질 지표</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="참여도"
              value={participationMetrics?.overallScore || 0}
              color="blue"
              details={[
                `질문 빈도: ${participationMetrics?.questionFrequency || 'N/A'}`,
                `상호작용: ${participationMetrics?.interactionLevel || 'N/A'}`
              ]}
            />
            <MetricCard
              title="학습 효과"
              value={learningMetrics?.overallScore || 0}
              color="green"
              details={[
                `이해도: ${learningMetrics?.comprehension || 'N/A'}`,
                `적용 가능성: ${learningMetrics?.applicability || 'N/A'}`
              ]}
            />
            <MetricCard
              title="만족도"
              value={satisfactionMetrics?.overallScore || 0}
              color="purple"
              details={[
                `콘텐츠: ${satisfactionMetrics?.contentRelevance || 'N/A'}`,
                `진행 방식: ${satisfactionMetrics?.deliveryMethod || 'N/A'}`
              ]}
            />
          </div>
        </div>
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
                  ? '실시간 AI 분석으로 교육 효과를 높이세요'
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

                {/* 탭 네비게이션 */}
                <div className="flex flex-wrap gap-2 mb-6 border-b">
                  {ANALYSIS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        px-4 py-2 font-medium text-sm rounded-t-lg transition-all
                        ${activeTab === tab.id 
                          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 활성 탭 설명 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    {ANALYSIS_TABS.find(t => t.id === activeTab)?.description}
                  </p>
                </div>

                {/* 분석 결과 영역 */}
                <div className="min-h-[300px]">
                  {questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        학생들이 질문을 제출하면 분석을 시작할 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    renderAnalysisResult()
                  )}
                </div>

                {/* 빠른 액션 버튼들 */}
                {canAnalyze && (
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // 모든 분석 일괄 실행
                        ['comprehensive', 'instructor', 'learner', 'quality'].forEach(type => {
                          handleAnalysis(type as AnalysisTab)
                        })
                      }}
                    >
                      🚀 전체 분석 실행
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/teacher/session/${sessionId}/comprehensive-analysis`}
                    >
                      📊 상세 분석 페이지
                    </Button>
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

// 메트릭 카드 컴포넌트
function MetricCard({ 
  title, 
  value, 
  color, 
  details 
}: { 
  title: string
  value: number
  color: string
  details: string[]
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h5 className="font-medium mb-2">{title}</h5>
      <div className="text-2xl font-bold mb-2">{value}/10</div>
      <div className="text-xs space-y-1">
        {details.map((detail, idx) => (
          <div key={idx}>{detail}</div>
        ))}
      </div>
    </div>
  )
}