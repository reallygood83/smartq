// AI 기반 피드백 품질 분석 엔진

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface FeedbackContent {
  id: string
  content: string
  fromUser: string
  toUser: string
  sessionId: string
  type: 'mentor_to_mentee' | 'mentee_to_mentor' | 'peer_to_peer'
  context?: string // 피드백 상황/맥락
  createdAt: number
}

export interface FeedbackQualityScore {
  overall: number // 전체 품질 점수 (0-100)
  dimensions: {
    specificity: number // 구체성 (0-100)
    constructiveness: number // 건설성 (0-100)
    clarity: number // 명확성 (0-100)
    actionability: number // 실행가능성 (0-100)
    empathy: number // 공감성 (0-100)
    relevance: number // 관련성 (0-100)
  }
}

export interface FeedbackAnalysisResult {
  feedbackId: string
  qualityScore: FeedbackQualityScore
  strengths: string[] // 피드백의 강점
  improvements: string[] // 개선 제안사항
  suggestedRevisions: string[] // 구체적 수정 제안
  keyInsights: string[] // 주요 인사이트
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed'
  wordCount: number
  readabilityScore: number // 가독성 점수 (0-100)
  categories: string[] // 피드백 카테고리 (기술적, 업무적, 개인적 등)
  followUpSuggestions: string[] // 후속 조치 제안
  analysisDate: number
}

export interface BatchFeedbackAnalysis {
  sessionId: string
  totalFeedbacks: number
  averageQuality: FeedbackQualityScore
  qualityTrends: {
    improving: number // 개선되고 있는 피드백 비율
    declining: number // 악화되고 있는 피드백 비율
    stable: number // 안정적인 피드백 비율
  }
  commonPatterns: {
    pattern: string
    frequency: number
    impact: 'positive' | 'negative' | 'neutral'
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    category: string
    suggestion: string
    expectedImpact: string
  }[]
  participantInsights: {
    userId: string
    averageQuality: number
    feedbackCount: number
    strongAreas: string[]
    improvementAreas: string[]
  }[]
  generateAt: number
}

/**
 * 단일 피드백의 품질을 AI로 분석
 */
export async function analyzeFeedbackQuality(
  feedback: FeedbackContent,
  apiKey: string
): Promise<FeedbackAnalysisResult> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
다음 피드백을 종합적으로 분석하여 품질을 평가해주세요.

【피드백 정보】
- 유형: ${feedback.type}
- 작성자: ${feedback.fromUser}
- 대상자: ${feedback.toUser}
- 맥락: ${feedback.context || '일반적인 멘토링 피드백'}
- 내용: "${feedback.content}"

【분석 기준】
1. 구체성 (Specificity): 피드백이 얼마나 구체적이고 명확한가?
2. 건설성 (Constructiveness): 개선에 도움이 되는 건설적인 내용인가?
3. 명확성 (Clarity): 이해하기 쉽고 명확하게 전달되었는가?
4. 실행가능성 (Actionability): 받는 사람이 실제로 행동할 수 있는 조언인가?
5. 공감성 (Empathy): 상대방의 입장을 이해하고 배려하는가?
6. 관련성 (Relevance): 상황과 목표에 적절한 피드백인가?

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "qualityScore": {
    "overall": [0-100],
    "dimensions": {
      "specificity": [0-100],
      "constructiveness": [0-100],
      "clarity": [0-100],
      "actionability": [0-100],
      "empathy": [0-100],
      "relevance": [0-100]
    }
  },
  "strengths": ["피드백의 강점 1", "피드백의 강점 2"],
  "improvements": ["개선 제안 1", "개선 제안 2"],
  "suggestedRevisions": ["수정 제안 1", "수정 제안 2"],
  "keyInsights": ["주요 인사이트 1", "주요 인사이트 2"],
  "emotionalTone": "positive|neutral|negative|mixed",
  "readabilityScore": [0-100],
  "categories": ["카테고리1", "카테고리2"],
  "followUpSuggestions": ["후속 조치 제안 1", "후속 조치 제안 2"]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // JSON 파싱
    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysisData = JSON.parse(cleanJson)

    const analysis: FeedbackAnalysisResult = {
      feedbackId: feedback.id,
      qualityScore: analysisData.qualityScore,
      strengths: analysisData.strengths || [],
      improvements: analysisData.improvements || [],
      suggestedRevisions: analysisData.suggestedRevisions || [],
      keyInsights: analysisData.keyInsights || [],
      emotionalTone: analysisData.emotionalTone || 'neutral',
      wordCount: feedback.content.length,
      readabilityScore: analysisData.readabilityScore || 70,
      categories: analysisData.categories || [],
      followUpSuggestions: analysisData.followUpSuggestions || [],
      analysisDate: Date.now()
    }

    return analysis
  } catch (error) {
    console.error('피드백 분석 오류:', error)
    throw new Error('피드백 분석 중 오류가 발생했습니다.')
  }
}

/**
 * 여러 피드백을 배치로 분석하여 전체적인 패턴과 트렌드 파악
 */
export async function analyzeBatchFeedback(
  feedbacks: FeedbackContent[],
  apiKey: string
): Promise<BatchFeedbackAnalysis> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  if (feedbacks.length === 0) {
    throw new Error('분석할 피드백이 없습니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // 피드백 요약 정보 생성
  const feedbackSummary = feedbacks.map((f, index) => ({
    index: index + 1,
    type: f.type,
    fromUser: f.fromUser,
    toUser: f.toUser,
    content: f.content.substring(0, 200) + (f.content.length > 200 ? '...' : ''),
    wordCount: f.content.length,
    createdAt: new Date(f.createdAt).toLocaleDateString()
  }))

  const prompt = `
다음 ${feedbacks.length}개의 피드백들을 전체적으로 분석하여 패턴과 트렌드를 파악해주세요.

【피드백 목록】
${JSON.stringify(feedbackSummary, null, 2)}

【분석 요청사항】
1. 전체적인 피드백 품질 수준 평가
2. 공통적으로 나타나는 패턴 식별
3. 품질 개선을 위한 구체적 권장사항
4. 참여자별 피드백 특성 분석

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "averageQuality": {
    "overall": [0-100],
    "dimensions": {
      "specificity": [0-100],
      "constructiveness": [0-100],
      "clarity": [0-100],
      "actionability": [0-100],
      "empathy": [0-100],
      "relevance": [0-100]
    }
  },
  "qualityTrends": {
    "improving": [0-100],
    "declining": [0-100],
    "stable": [0-100]
  },
  "commonPatterns": [
    {
      "pattern": "패턴 설명",
      "frequency": [0-100],
      "impact": "positive|negative|neutral"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "카테고리",
      "suggestion": "구체적 제안",
      "expectedImpact": "기대 효과"
    }
  ],
  "participantInsights": [
    {
      "userId": "사용자ID",
      "averageQuality": [0-100],
      "feedbackCount": [개수],
      "strongAreas": ["강점1", "강점2"],
      "improvementAreas": ["개선점1", "개선점2"]
    }
  ]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // JSON 파싱
    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysisData = JSON.parse(cleanJson)

    const batchAnalysis: BatchFeedbackAnalysis = {
      sessionId: feedbacks[0]?.sessionId || '',
      totalFeedbacks: feedbacks.length,
      averageQuality: analysisData.averageQuality,
      qualityTrends: analysisData.qualityTrends,
      commonPatterns: analysisData.commonPatterns || [],
      recommendations: analysisData.recommendations || [],
      participantInsights: analysisData.participantInsights || [],
      generateAt: Date.now()
    }

    return batchAnalysis
  } catch (error) {
    console.error('배치 피드백 분석 오류:', error)
    throw new Error('배치 피드백 분석 중 오류가 발생했습니다.')
  }
}

/**
 * 피드백 품질 개선을 위한 실시간 제안
 */
export async function getFeedbackImprovementSuggestions(
  originalFeedback: string,
  context: string,
  apiKey: string
): Promise<{
  improvedVersion: string
  improvements: string[]
  reasoning: string[]
}> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
다음 피드백을 더 효과적이고 건설적으로 개선해주세요.

【원본 피드백】
"${originalFeedback}"

【맥락】
${context}

【개선 목표】
1. 더 구체적이고 명확하게
2. 건설적이고 실행 가능하게
3. 공감적이고 격려적으로
4. 학습과 성장에 도움이 되도록

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "improvedVersion": "개선된 피드백 전체 내용",
  "improvements": ["개선사항 1", "개선사항 2", "개선사항 3"],
  "reasoning": ["개선 이유 1", "개선 이유 2", "개선 이유 3"]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // JSON 파싱
    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const suggestions = JSON.parse(cleanJson)

    return {
      improvedVersion: suggestions.improvedVersion,
      improvements: suggestions.improvements || [],
      reasoning: suggestions.reasoning || []
    }
  } catch (error) {
    console.error('피드백 개선 제안 오류:', error)
    throw new Error('피드백 개선 제안 생성 중 오류가 발생했습니다.')
  }
}

/**
 * 피드백 품질 점수를 시각적 등급으로 변환
 */
export function getQualityGrade(score: number): {
  grade: string
  color: string
  description: string
} {
  if (score >= 90) {
    return {
      grade: 'A+',
      color: 'text-green-600',
      description: '매우 우수한 피드백'
    }
  } else if (score >= 80) {
    return {
      grade: 'A',
      color: 'text-green-500',
      description: '우수한 피드백'
    }
  } else if (score >= 70) {
    return {
      grade: 'B+',
      color: 'text-blue-500',
      description: '양호한 피드백'
    }
  } else if (score >= 60) {
    return {
      grade: 'B',
      color: 'text-blue-400',
      description: '보통 수준의 피드백'
    }
  } else if (score >= 50) {
    return {
      grade: 'C',
      color: 'text-yellow-500',
      description: '개선이 필요한 피드백'
    }
  } else {
    return {
      grade: 'D',
      color: 'text-red-500',
      description: '대폭 개선이 필요한 피드백'
    }
  }
}

/**
 * 피드백 분석 결과를 요약 리포트로 생성
 */
export function generateFeedbackReport(
  analyses: FeedbackAnalysisResult[]
): {
  summary: string
  totalScore: number
  keyFindings: string[]
  actionItems: string[]
} {
  if (analyses.length === 0) {
    return {
      summary: '분석할 피드백이 없습니다.',
      totalScore: 0,
      keyFindings: [],
      actionItems: []
    }
  }

  const totalScore = analyses.reduce((sum, analysis) => sum + analysis.qualityScore.overall, 0) / analyses.length
  const allStrengths = analyses.flatMap(a => a.strengths)
  const allImprovements = analyses.flatMap(a => a.improvements)
  
  // 공통 패턴 찾기
  const strengthCounts = allStrengths.reduce((acc, strength) => {
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const improvementCounts = allImprovements.reduce((acc, improvement) => {
    acc[improvement] = (acc[improvement] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topStrengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([strength]) => strength)

  const topImprovements = Object.entries(improvementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([improvement]) => improvement)

  return {
    summary: `${analyses.length}개의 피드백을 분석한 결과, 평균 품질 점수는 ${totalScore.toFixed(1)}점입니다.`,
    totalScore: Math.round(totalScore),
    keyFindings: [
      `가장 강한 영역: ${topStrengths.join(', ')}`,
      `개선이 필요한 영역: ${topImprovements.join(', ')}`,
      `전체 피드백 중 ${analyses.filter(a => a.qualityScore.overall >= 70).length}개(${((analyses.filter(a => a.qualityScore.overall >= 70).length / analyses.length) * 100).toFixed(1)}%)가 양호한 수준입니다.`
    ],
    actionItems: topImprovements.slice(0, 2)
  }
}