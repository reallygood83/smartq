'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import {
  FeedbackContent,
  FeedbackAnalysisResult,
  BatchFeedbackAnalysis,
  analyzeFeedbackQuality,
  analyzeBatchFeedback,
  getFeedbackImprovementSuggestions,
  getQualityGrade,
  generateFeedbackReport
} from '@/lib/feedbackAnalysis'
import { database } from '@/lib/firebase'
import { ref, onValue, set } from 'firebase/database'

interface FeedbackQualityDashboardProps {
  sessionId: string
  userApiKey: string
}

export default function FeedbackQualityDashboard({ sessionId, userApiKey }: FeedbackQualityDashboardProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackContent[]>([])
  const [analyses, setAnalyses] = useState<FeedbackAnalysisResult[]>([])
  const [batchAnalysis, setBatchAnalysis] = useState<BatchFeedbackAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [improvementSuggestion, setImprovementSuggestion] = useState<{
    improvedVersion: string
    improvements: string[]
    reasoning: string[]
  } | null>(null)

  useEffect(() => {
    // 피드백 데이터 로드
    const feedbackRef = ref(database, `feedbackResponses/${sessionId}`)
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const feedbackList = Object.values(data) as any[]
        const formattedFeedbacks: FeedbackContent[] = feedbackList.map(fb => ({
          id: fb.responseId || fb.id,
          content: fb.feedback || fb.content,
          fromUser: fb.reviewerId || fb.fromUser,
          toUser: fb.requesterId || fb.toUser,
          sessionId: sessionId,
          type: 'peer_to_peer',
          context: fb.context || '멘토링 피드백',
          createdAt: fb.submittedAt || fb.createdAt || Date.now()
        }))
        setFeedbacks(formattedFeedbacks)
      } else {
        setFeedbacks([])
      }
      setLoading(false)
    })

    // 기존 분석 결과 로드
    const analysisRef = ref(database, `feedbackAnalyses/${sessionId}`)
    onValue(analysisRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        if (data.individual) {
          setAnalyses(Object.values(data.individual) as FeedbackAnalysisResult[])
        }
        if (data.batch) {
          setBatchAnalysis(data.batch as BatchFeedbackAnalysis)
        }
      }
    })

    return () => unsubscribe()
  }, [sessionId])

  const runIndividualAnalysis = async (feedback: FeedbackContent) => {
    if (!userApiKey) {
      alert('API 키가 필요합니다. 설정에서 Gemini API 키를 입력해주세요.')
      return
    }

    setAnalyzing(true)
    try {
      const analysis = await analyzeFeedbackQuality(feedback, userApiKey)
      
      // Firebase에 저장
      const analysisRef = ref(database, `feedbackAnalyses/${sessionId}/individual/${feedback.id}`)
      await set(analysisRef, analysis)
      
      // 로컬 상태 업데이트
      setAnalyses(prev => [...prev.filter(a => a.feedbackId !== feedback.id), analysis])
      
      alert('피드백 분석이 완료되었습니다!')
    } catch (error) {
      console.error('개별 분석 오류:', error)
      alert('분석 중 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const runBatchAnalysis = async () => {
    if (!userApiKey) {
      alert('API 키가 필요합니다. 설정에서 Gemini API 키를 입력해주세요.')
      return
    }

    if (feedbacks.length === 0) {
      alert('분석할 피드백이 없습니다.')
      return
    }

    setAnalyzing(true)
    try {
      const analysis = await analyzeBatchFeedback(feedbacks, userApiKey)
      
      // Firebase에 저장
      const batchRef = ref(database, `feedbackAnalyses/${sessionId}/batch`)
      await set(batchRef, analysis)
      
      setBatchAnalysis(analysis)
      
      alert('배치 분석이 완료되었습니다!')
    } catch (error) {
      console.error('배치 분석 오류:', error)
      alert('배치 분석 중 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getSuggestionForImprovement = async (feedback: FeedbackContent) => {
    if (!userApiKey) {
      alert('API 키가 필요합니다.')
      return
    }

    setAnalyzing(true)
    try {
      const suggestion = await getFeedbackImprovementSuggestions(
        feedback.content,
        feedback.context || '멘토링 피드백',
        userApiKey
      )
      setImprovementSuggestion(suggestion)
      setSelectedFeedback(feedback.id)
    } catch (error) {
      console.error('개선 제안 오류:', error)
      alert('개선 제안 생성 중 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getAnalysisForFeedback = (feedbackId: string) => {
    return analyses.find(a => a.feedbackId === feedbackId)
  }

  const report = generateFeedbackReport(analyses)

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">피드백 데이터를 불러오는 중...</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 전체 분석 버튼 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔍 피드백 품질 분석</h2>
            <p className="text-gray-600">AI 기반 피드백 품질 평가 및 개선 제안</p>
          </div>
          <div className="space-x-3">
            <Button
              onClick={runBatchAnalysis}
              disabled={analyzing || feedbacks.length === 0}
              variant="outline"
            >
              {analyzing ? '분석 중...' : '전체 분석'}
            </Button>
          </div>
        </div>

        {/* 요약 통계 */}
        {analyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{feedbacks.length}</div>
              <div className="text-sm text-blue-800">총 피드백 수</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyses.length}</div>
              <div className="text-sm text-green-800">분석 완료</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{report.totalScore}</div>
              <div className="text-sm text-purple-800">평균 품질 점수</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analyses.filter(a => a.qualityScore.overall >= 70).length}
              </div>
              <div className="text-sm text-orange-800">양호한 피드백 수</div>
            </div>
          </div>
        )}
      </Card>

      {/* 배치 분석 결과 */}
      {batchAnalysis && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 전체 분석 결과</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 품질 트렌드 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">품질 트렌드</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">개선되고 있음</span>
                  <span className="font-medium">{batchAnalysis.qualityTrends.improving.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">안정적</span>
                  <span className="font-medium">{batchAnalysis.qualityTrends.stable.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">악화되고 있음</span>
                  <span className="font-medium">{batchAnalysis.qualityTrends.declining.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 공통 패턴 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">공통 패턴</h4>
              <div className="space-y-2">
                {batchAnalysis.commonPatterns.slice(0, 3).map((pattern, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className={
                        pattern.impact === 'positive' ? 'text-green-600' :
                        pattern.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }>
                        {pattern.pattern}
                      </span>
                      <span className="text-gray-500">{pattern.frequency.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 권장사항 */}
          {batchAnalysis.recommendations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">개선 권장사항</h4>
              <div className="space-y-3">
                {batchAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`font-medium ${
                          rec.priority === 'high' ? 'text-red-800' :
                          rec.priority === 'medium' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {rec.category}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">{rec.suggestion}</div>
                        <div className="text-xs text-gray-600 mt-1">{rec.expectedImpact}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 개별 피드백 분석 */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 개별 피드백 분석</h3>
        
        {feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            분석할 피드백이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => {
              const analysis = getAnalysisForFeedback(feedback.id)
              const qualityGrade = analysis ? getQualityGrade(analysis.qualityScore.overall) : null

              return (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {feedback.fromUser} → {feedback.toUser}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        {qualityGrade && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${qualityGrade.color} bg-gray-100`}>
                            {qualityGrade.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 mb-3">{feedback.content}</p>
                      
                      {analysis && (
                        <div className="bg-gray-50 p-3 rounded-md mb-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">구체성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.specificity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">건설성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.constructiveness}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">명확성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.clarity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">실행가능성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.actionability}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">공감성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.empathy}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">관련성:</span>
                              <span className="ml-1 font-medium">{analysis.qualityScore.dimensions.relevance}</span>
                            </div>
                          </div>
                          
                          {analysis.strengths.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-green-700">강점:</span>
                              <ul className="text-sm text-green-600 mt-1">
                                {analysis.strengths.slice(0, 2).map((strength, index) => (
                                  <li key={index}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {analysis.improvements.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-orange-700">개선점:</span>
                              <ul className="text-sm text-orange-600 mt-1">
                                {analysis.improvements.slice(0, 2).map((improvement, index) => (
                                  <li key={index}>• {improvement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {!analysis && (
                        <Button
                          size="sm"
                          onClick={() => runIndividualAnalysis(feedback)}
                          disabled={analyzing}
                        >
                          {analyzing ? '분석 중...' : '분석하기'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => getSuggestionForImprovement(feedback)}
                        disabled={analyzing}
                      >
                        개선 제안
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* 개선 제안 모달 */}
      {improvementSuggestion && selectedFeedback && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-900">💡 피드백 개선 제안</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setImprovementSuggestion(null)
                setSelectedFeedback(null)
              }}
            >
              닫기
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">개선된 버전:</h4>
              <div className="bg-white p-3 rounded-md border border-blue-200">
                <p className="text-gray-900">{improvementSuggestion.improvedVersion}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">주요 개선사항:</h4>
              <ul className="space-y-1">
                {improvementSuggestion.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">개선 이유:</h4>
              <ul className="space-y-1">
                {improvementSuggestion.reasoning.map((reason, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}