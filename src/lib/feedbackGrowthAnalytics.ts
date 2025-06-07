// 피드백 성장 분석 및 추적 시스템

import { GoogleGenerativeAI } from '@google/generative-ai'
import { FeedbackAnalysisResult, FeedbackContent } from './feedbackAnalysis'

export interface GrowthPattern {
  dimension: string
  pattern: 'improving' | 'stable' | 'declining' | 'fluctuating'
  trendStrength: number // 0-100, 높을수록 명확한 트렌드
  averageChange: number // 기간 동안의 평균 변화량
  significantEvents: {
    date: number
    type: 'breakthrough' | 'setback' | 'plateau'
    description: string
    impactScore: number
  }[]
}

export interface LearningMilestone {
  achievedAt: number
  title: string
  description: string
  category: 'quality_improvement' | 'consistency' | 'specific_skill' | 'overall_growth'
  evidence: string[]
  nextGoals: string[]
}

export interface GrowthInsight {
  type: 'strength' | 'opportunity' | 'concern' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionableAdvice: string[]
  timeframe: string
  confidence: number // 0-100
}

export interface PersonalizedGrowthPlan {
  userId: string
  currentLevel: {
    overall: number
    strengths: string[]
    improvements: string[]
  }
  shortTermGoals: {
    goal: string
    targetScore: number
    timeframe: string
    strategies: string[]
  }[]
  longTermVision: {
    description: string
    milestones: string[]
    timeline: string
  }
  dailyPractices: string[]
  weeklyCheckpoints: string[]
}

export interface SessionImpactAnalysis {
  sessionId: string
  sessionTitle: string
  participationScore: number
  learningOutcomes: string[]
  skillsImproved: string[]
  feedbackQualityChange: number
  keyLearnings: string[]
  recommendedFollowUp: string[]
}

/**
 * 피드백 성장 패턴 분석
 */
export async function analyzeGrowthPatterns(
  feedbackAnalyses: FeedbackAnalysisResult[],
  timeWindowDays: number = 90
): Promise<GrowthPattern[]> {
  if (feedbackAnalyses.length < 3) {
    throw new Error('성장 패턴 분석을 위해서는 최소 3개의 피드백 분석이 필요합니다.')
  }

  const patterns: GrowthPattern[] = []
  const dimensions = ['specificity', 'constructiveness', 'clarity', 'actionability', 'empathy', 'relevance']

  for (const dimension of dimensions) {
    const scores = feedbackAnalyses
      .map(analysis => ({
        score: analysis.qualityScore.dimensions[dimension as keyof typeof analysis.qualityScore.dimensions],
        date: analysis.analysisDate
      }))
      .sort((a, b) => a.date - b.date)

    // 트렌드 계산
    const trendData = calculateTrend(scores.map(s => s.score))
    const pattern = determinePattern(scores, timeWindowDays)
    const significantEvents = identifySignificantEvents(scores)

    patterns.push({
      dimension: getDimensionLabel(dimension),
      pattern: pattern.type,
      trendStrength: pattern.strength,
      averageChange: trendData.averageChange,
      significantEvents
    })
  }

  return patterns
}

/**
 * 학습 이정표 식별
 */
export async function identifyLearningMilestones(
  feedbackAnalyses: FeedbackAnalysisResult[],
  apiKey: string
): Promise<LearningMilestone[]> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // 분석 데이터 요약
  const analysisData = feedbackAnalyses.map(analysis => ({
    date: new Date(analysis.analysisDate).toLocaleDateString(),
    overallScore: analysis.qualityScore.overall,
    strengths: analysis.strengths.slice(0, 2),
    improvements: analysis.improvements.slice(0, 2),
    keyInsights: analysis.keyInsights.slice(0, 1)
  }))

  const prompt = `
다음 피드백 분석 이력을 바탕으로 학습 이정표를 식별해주세요.

【분석 데이터】
${JSON.stringify(analysisData, null, 2)}

【이정표 식별 기준】
1. 품질 개선: 특정 차원에서 지속적인 향상
2. 일관성 달성: 안정적인 품질 유지
3. 특정 기술: 새로운 피드백 기술 습득
4. 전체적 성장: 종합적인 피드백 능력 향상

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "milestones": [
    {
      "title": "이정표 제목",
      "description": "상세 설명",
      "category": "quality_improvement|consistency|specific_skill|overall_growth",
      "evidence": ["근거 1", "근거 2"],
      "nextGoals": ["다음 목표 1", "다음 목표 2"]
    }
  ]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleanJson)

    return data.milestones.map((milestone: any, index: number) => ({
      achievedAt: feedbackAnalyses[Math.floor(feedbackAnalyses.length * (index + 1) / data.milestones.length)].analysisDate,
      title: milestone.title,
      description: milestone.description,
      category: milestone.category,
      evidence: milestone.evidence,
      nextGoals: milestone.nextGoals
    }))
  } catch (error) {
    console.error('학습 이정표 식별 오류:', error)
    throw new Error('학습 이정표 식별 중 오류가 발생했습니다.')
  }
}

/**
 * 성장 인사이트 생성
 */
export async function generateGrowthInsights(
  patterns: GrowthPattern[],
  milestones: LearningMilestone[],
  apiKey: string
): Promise<GrowthInsight[]> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
다음 성장 패턴과 이정표를 바탕으로 개인화된 성장 인사이트를 생성해주세요.

【성장 패턴】
${JSON.stringify(patterns, null, 2)}

【학습 이정표】
${JSON.stringify(milestones, null, 2)}

【인사이트 생성 기준】
1. 강점: 지속적으로 잘하고 있는 영역
2. 기회: 개선할 수 있는 영역
3. 우려: 주의가 필요한 영역  
4. 성취: 달성한 목표나 진전

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "insights": [
    {
      "type": "strength|opportunity|concern|achievement",
      "priority": "high|medium|low",
      "title": "인사이트 제목",
      "description": "상세 설명",
      "actionableAdvice": ["실행 가능한 조언 1", "실행 가능한 조언 2"],
      "timeframe": "예상 개선 기간",
      "confidence": [0-100]
    }
  ]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleanJson)

    return data.insights
  } catch (error) {
    console.error('성장 인사이트 생성 오류:', error)
    throw new Error('성장 인사이트 생성 중 오류가 발생했습니다.')
  }
}

/**
 * 개인화된 성장 계획 생성
 */
export async function createPersonalizedGrowthPlan(
  userId: string,
  patterns: GrowthPattern[],
  insights: GrowthInsight[],
  currentLevel: { overall: number; strengths: string[]; improvements: string[] },
  apiKey: string
): Promise<PersonalizedGrowthPlan> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
다음 정보를 바탕으로 개인화된 피드백 성장 계획을 수립해주세요.

【현재 수준】
${JSON.stringify(currentLevel, null, 2)}

【성장 패턴】
${JSON.stringify(patterns.slice(0, 3), null, 2)}

【주요 인사이트】
${JSON.stringify(insights.slice(0, 3), null, 2)}

【계획 수립 기준】
1. 단기 목표: 1-3개월 내 달성 가능한 구체적 목표
2. 장기 비전: 6-12개월 후 도달하고 싶은 상태
3. 일일 실천: 매일 할 수 있는 작은 습관
4. 주간 점검: 주별로 확인할 진전 사항

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "shortTermGoals": [
    {
      "goal": "구체적 목표",
      "targetScore": [0-100],
      "timeframe": "기간",
      "strategies": ["전략 1", "전략 2"]
    }
  ],
  "longTermVision": {
    "description": "장기 비전 설명",
    "milestones": ["이정표 1", "이정표 2"],
    "timeline": "타임라인"
  },
  "dailyPractices": ["일일 실천사항 1", "일일 실천사항 2"],
  "weeklyCheckpoints": ["주간 점검사항 1", "주간 점검사항 2"]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleanJson)

    return {
      userId,
      currentLevel,
      shortTermGoals: data.shortTermGoals,
      longTermVision: data.longTermVision,
      dailyPractices: data.dailyPractices,
      weeklyCheckpoints: data.weeklyCheckpoints
    }
  } catch (error) {
    console.error('개인화된 성장 계획 생성 오류:', error)
    throw new Error('개인화된 성장 계획 생성 중 오류가 발생했습니다.')
  }
}

/**
 * 세션별 임팩트 분석
 */
export async function analyzeSessionImpact(
  sessionId: string,
  sessionTitle: string,
  beforeAnalyses: FeedbackAnalysisResult[],
  afterAnalyses: FeedbackAnalysisResult[],
  apiKey: string
): Promise<SessionImpactAnalysis> {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const beforeAvg = beforeAnalyses.length > 0 ? 
    beforeAnalyses.reduce((sum, a) => sum + a.qualityScore.overall, 0) / beforeAnalyses.length : 0
  const afterAvg = afterAnalyses.length > 0 ? 
    afterAnalyses.reduce((sum, a) => sum + a.qualityScore.overall, 0) / afterAnalyses.length : 0
  
  const qualityChange = afterAvg - beforeAvg

  const prompt = `
다음 세션의 임팩트를 분석해주세요.

【세션 정보】
- 제목: ${sessionTitle}
- 세션 전 평균 품질: ${beforeAvg.toFixed(1)}점
- 세션 후 평균 품질: ${afterAvg.toFixed(1)}점
- 품질 변화: ${qualityChange.toFixed(1)}점

【세션 전 분석】
${JSON.stringify(beforeAnalyses.slice(-3).map(a => ({
  score: a.qualityScore.overall,
  strengths: a.strengths.slice(0, 2),
  improvements: a.improvements.slice(0, 2)
})), null, 2)}

【세션 후 분석】
${JSON.stringify(afterAnalyses.slice(0, 3).map(a => ({
  score: a.qualityScore.overall,
  strengths: a.strengths.slice(0, 2),
  improvements: a.improvements.slice(0, 2)
})), null, 2)}

【응답 형식】
다음 JSON 형식으로만 응답해주세요:

{
  "participationScore": [0-100],
  "learningOutcomes": ["학습 성과 1", "학습 성과 2"],
  "skillsImproved": ["향상된 기술 1", "향상된 기술 2"],
  "keyLearnings": ["주요 학습 1", "주요 학습 2"],
  "recommendedFollowUp": ["후속 조치 1", "후속 조치 2"]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleanJson)

    return {
      sessionId,
      sessionTitle,
      participationScore: data.participationScore,
      learningOutcomes: data.learningOutcomes,
      skillsImproved: data.skillsImproved,
      feedbackQualityChange: Math.round(qualityChange * 10) / 10,
      keyLearnings: data.keyLearnings,
      recommendedFollowUp: data.recommendedFollowUp
    }
  } catch (error) {
    console.error('세션 임팩트 분석 오류:', error)
    throw new Error('세션 임팩트 분석 중 오류가 발생했습니다.')
  }
}

// 유틸리티 함수들

function calculateTrend(scores: number[]): { averageChange: number; direction: 'up' | 'down' | 'stable' } {
  if (scores.length < 2) return { averageChange: 0, direction: 'stable' }
  
  const changes = []
  for (let i = 1; i < scores.length; i++) {
    changes.push(scores[i] - scores[i - 1])
  }
  
  const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length
  
  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (averageChange > 2) direction = 'up'
  else if (averageChange < -2) direction = 'down'
  
  return { averageChange, direction }
}

function determinePattern(
  scores: { score: number; date: number }[], 
  timeWindowDays: number
): { type: 'improving' | 'stable' | 'declining' | 'fluctuating'; strength: number } {
  if (scores.length < 3) return { type: 'stable', strength: 0 }
  
  const recentScores = scores.slice(-Math.min(5, scores.length))
  const trend = calculateTrend(recentScores.map(s => s.score))
  
  // 변동성 계산
  const avgScore = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
  const variance = recentScores.reduce((sum, s) => sum + Math.pow(s.score - avgScore, 2), 0) / recentScores.length
  const standardDeviation = Math.sqrt(variance)
  
  const strength = Math.min(100, Math.abs(trend.averageChange) * 10)
  
  if (standardDeviation > 15) {
    return { type: 'fluctuating', strength: Math.min(100, standardDeviation) }
  }
  
  if (trend.direction === 'up') return { type: 'improving', strength }
  if (trend.direction === 'down') return { type: 'declining', strength }
  return { type: 'stable', strength }
}

function identifySignificantEvents(scores: { score: number; date: number }[]): {
  date: number
  type: 'breakthrough' | 'setback' | 'plateau'
  description: string
  impactScore: number
}[] {
  const events = []
  
  for (let i = 1; i < scores.length - 1; i++) {
    const prev = scores[i - 1].score
    const current = scores[i].score
    const next = scores[i + 1].score
    
    // 돌파구 (큰 향상)
    if (current - prev > 15 && next - current > -5) {
      events.push({
        date: scores[i].date,
        type: 'breakthrough' as const,
        description: `품질 점수가 ${prev}에서 ${current}으로 크게 향상`,
        impactScore: current - prev
      })
    }
    
    // 좌절 (큰 하락)
    if (prev - current > 15 && current - next > -5) {
      events.push({
        date: scores[i].date,
        type: 'setback' as const,
        description: `품질 점수가 ${prev}에서 ${current}으로 하락`,
        impactScore: prev - current
      })
    }
    
    // 정체 (장기간 변화 없음)
    if (i >= 3) {
      const recentRange = scores.slice(i - 3, i + 1)
      const maxScore = Math.max(...recentRange.map(s => s.score))
      const minScore = Math.min(...recentRange.map(s => s.score))
      
      if (maxScore - minScore < 5) {
        events.push({
          date: scores[i].date,
          type: 'plateau' as const,
          description: `품질 점수가 ${Math.round((maxScore + minScore) / 2)} 근처에서 정체`,
          impactScore: maxScore - minScore
        })
      }
    }
  }
  
  return events
}

function getDimensionLabel(dimension: string): string {
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