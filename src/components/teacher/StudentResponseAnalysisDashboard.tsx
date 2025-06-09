'use client'

import { useState, useEffect } from 'react'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { getStoredApiKey } from '@/lib/encryption'
import { TeacherQuestion, StudentResponse, StudentResponseAnalysis } from '@/types/teacher-led'

interface StudentResponseAnalysisDashboardProps {
  sessionId: string
  questionId: string
  onClose?: () => void
}

export default function StudentResponseAnalysisDashboard({ 
  sessionId, 
  questionId, 
  onClose 
}: StudentResponseAnalysisDashboardProps) {
  const { user } = useAuth()
  const [question, setQuestion] = useState<TeacherQuestion | null>(null)
  const [responses, setResponses] = useState<StudentResponse[]>([])
  const [analysis, setAnalysis] = useState<StudentResponseAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<StudentResponseAnalysis[]>([])

  // 질문과 답변 실시간 동기화
  useEffect(() => {
    if (!sessionId || !questionId) return

    // 질문 정보 로드
    const questionRef = ref(database, `teacherQuestions/${sessionId}`)
    const unsubscribeQuestion = onValue(questionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questions = Object.values(data) as TeacherQuestion[]
        const targetQuestion = questions.find(q => q.questionId === questionId)
        setQuestion(targetQuestion || null)
      }
    })

    // 답변 정보 로드
    const responsesRef = ref(database, `studentResponses/${sessionId}`)
    const unsubscribeResponses = onValue(responsesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allResponses = Object.values(data) as StudentResponse[]
        const targetResponses = allResponses.filter(r => r.questionId === questionId)
        targetResponses.sort((a, b) => b.createdAt - a.createdAt)
        setResponses(targetResponses)
      } else {
        setResponses([])
      }
    })

    // 저장된 분석 결과 로드
    const analysesRef = ref(database, `questionAnalyses/${sessionId}`)
    const unsubscribeAnalyses = onValue(analysesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allAnalyses = Object.values(data) as StudentResponseAnalysis[]
        const questionAnalyses = allAnalyses.filter(a => a.questionId === questionId)
        questionAnalyses.sort((a, b) => b.generatedAt - a.generatedAt)
        setSavedAnalyses(questionAnalyses)
        
        // 가장 최신 분석 결과를 현재 분석으로 설정
        if (questionAnalyses.length > 0) {
          setAnalysis(questionAnalyses[0])
        }
      } else {
        setSavedAnalyses([])
      }
    })

    return () => {
      unsubscribeQuestion()
      unsubscribeResponses()
      unsubscribeAnalyses()
    }
  }, [sessionId, questionId])

  // AI 분석 실행
  const runAnalysis = async () => {
    if (!user || responses.length === 0) return

    const apiKey = getStoredApiKey()
    if (!apiKey) {
      setError('AI 분석을 위해 API 키가 필요합니다. 설정에서 API 키를 등록해주세요.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-student-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          sessionId,
          apiKey
        })
      })

      if (!response.ok) {
        throw new Error('분석 요청 실패')
      }

      const result = await response.json()
      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        throw new Error(result.error || '분석 실패')
      }
    } catch (error) {
      console.error('AI 분석 오류:', error)
      setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getComprehensionColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'needs_improvement':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const getComprehensionLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return '매우 우수'
      case 'good':
        return '우수'
      case 'fair':
        return '보통'
      case 'needs_improvement':
        return '개선 필요'
      default:
        return level
    }
  }

  if (!question) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">질문 정보를 불러오는 중...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                학생 답변 분석
              </h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">분석 대상 질문</h3>
              <p className="text-blue-800 dark:text-blue-200">{question.text}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>📝 답변 수: {responses.length}개</span>
              <span>⏰ 질문 생성: {new Date(question.createdAt).toLocaleString()}</span>
              {question.activatedAt && (
                <span>🚀 활성화: {new Date(question.activatedAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              닫기
            </Button>
          )}
        </div>
      </Card>

      {/* 답변 목록 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          💬 학생 답변 ({responses.length}개)
        </h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>아직 제출된 답변이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.map((response, index) => (
              <div key={response.responseId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {index + 1}. {response.isAnonymous ? '익명' : response.studentName || '학생'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(response.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-sm">{response.text}</p>
              </div>
            ))}
          </div>
        )}

        {responses.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing || responses.length === 0}
              isLoading={isAnalyzing}
            >
              🤖 {savedAnalyses.length > 0 ? '새로운 AI 분석 실행' : 'AI 분석 실행'}
            </Button>
            
            {savedAnalyses.length > 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  📊 이전 분석 결과 ({savedAnalyses.length}개)
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {savedAnalyses.slice(1).map((savedAnalysis, index) => (
                    <Button
                      key={savedAnalysis.generatedAt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAnalysis(savedAnalysis)}
                      className="text-xs"
                    >
                      #{index + 2} ({new Date(savedAnalysis.generatedAt).toLocaleTimeString()})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </Card>

      {/* AI 분석 결과 */}
      {analysis && (
        <>
          {/* 전체 인사이트 */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📈 전체 분석 결과
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                생성: {new Date(analysis.generatedAt).toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 전체 이해도 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  📊 평균 이해도
                </h4>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {analysis.collectiveAnalysis.overallInsights.averageComprehension}점
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analysis.collectiveAnalysis.overallInsights.averageComprehension}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 질문 효과성 */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🎯 질문 효과성
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-200">명확성</span>
                    <span className="font-medium">{analysis.collectiveAnalysis.questionEffectiveness.clarityScore}점</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-200">참여도</span>
                    <span className="font-medium">{analysis.collectiveAnalysis.questionEffectiveness.engagementLevel}점</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-200">인지 수준</span>
                    <span className="font-medium">{analysis.collectiveAnalysis.questionEffectiveness.cognitiveLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 공통 강점과 도전점 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">✨ 공통 강점</h4>
                <ul className="space-y-1">
                  {analysis.collectiveAnalysis.overallInsights.commonStrengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">🎯 공통 도전점</h4>
                <ul className="space-y-1">
                  {analysis.collectiveAnalysis.overallInsights.commonChallenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* 개별 답변 분석 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              👥 개별 답변 분석
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysis.individualAnalyses.map((individual, index) => {
                const response = responses.find(r => r.responseId === individual.responseId)
                return (
                  <div key={individual.responseId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          답변 #{index + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getComprehensionColor(individual.analysisResults.comprehensionLevel)}`}>
                          {getComprehensionLabel(individual.analysisResults.comprehensionLevel)}
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {individual.analysisResults.comprehensionScore}점
                        </span>
                      </div>
                    </div>

                    {response && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-3">
                        <p className="text-sm text-gray-900 dark:text-white">{response.text}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">강점</h5>
                        <ul className="text-xs space-y-1">
                          {individual.analysisResults.keyStrengths.map((strength, i) => (
                            <li key={i} className="text-green-600 dark:text-green-400">• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">개선점</h5>
                        <ul className="text-xs space-y-1">
                          {individual.analysisResults.improvementAreas.map((area, i) => (
                            <li key={i} className="text-orange-600 dark:text-orange-400">• {area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {individual.analysisResults.detailedFeedback && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">상세 피드백</h5>
                        <p className="text-xs text-blue-800 dark:text-blue-200">{individual.analysisResults.detailedFeedback}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 교수법 추천 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🎓 교수법 추천
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-300 mb-3">🚨 즉시 조치사항</h4>
                <ul className="space-y-2">
                  {analysis.collectiveAnalysis.teachingRecommendations.immediateActions.map((action, index) => (
                    <li key={index} className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-red-700 dark:text-red-300">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-600 dark:text-blue-300 mb-3">❓ 후속 질문</h4>
                <ul className="space-y-2">
                  {analysis.collectiveAnalysis.teachingRecommendations.followUpQuestions.map((question, index) => (
                    <li key={index} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-300 mb-3">🎯 강화 활동</h4>
                <ul className="space-y-2">
                  {analysis.collectiveAnalysis.teachingRecommendations.reinforcementActivities.map((activity, index) => (
                    <li key={index} className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-green-700 dark:text-green-300">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-purple-600 dark:text-purple-300 mb-3">🎨 차별화 전략</h4>
                <ul className="space-y-2">
                  {analysis.collectiveAnalysis.teachingRecommendations.differentiationStrategies.map((strategy, index) => (
                    <li key={index} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-purple-700 dark:text-purple-300">{strategy}</span>
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