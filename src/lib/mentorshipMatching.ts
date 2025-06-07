// 멘토-멘티 매칭 알고리즘 및 유틸리티 함수

import { 
  MentorProfile, 
  MenteeProfile, 
  MentorshipMatch, 
  MatchingCriteria,
  DEFAULT_MATCHING_CRITERIA
} from '@/types/mentorship'

/**
 * 두 사용자 간의 호환성 점수 계산
 */
export function calculateCompatibilityScore(
  mentor: MentorProfile,
  mentee: MenteeProfile,
  criteria: MatchingCriteria = DEFAULT_MATCHING_CRITERIA
): number {
  // 1. 전문성 일치도 계산
  const expertiseAlignment = calculateExpertiseAlignment(mentor, mentee)
  
  // 2. 시간 가용성 일치도 계산
  const availabilityAlignment = calculateAvailabilityAlignment(mentor, mentee)
  
  // 3. 소통 스타일 일치도 계산
  const communicationMatch = calculateCommunicationMatch(mentor, mentee)
  
  // 4. 산업 분야 일치도 계산
  const industryAlignment = calculateIndustryAlignment(mentor, mentee)
  
  // 5. 경험 격차 적절성 계산
  const experienceGapScore = calculateExperienceGapScore(mentor, mentee)
  
  // 가중 평균으로 최종 점수 계산
  const totalScore = (
    expertiseAlignment * criteria.expertiseWeight +
    availabilityAlignment * criteria.availabilityWeight +
    communicationMatch * criteria.communicationWeight +
    industryAlignment * criteria.industryWeight +
    experienceGapScore * criteria.experienceGapWeight
  )
  
  return Math.round(totalScore * 100) / 100 // 소수점 2자리까지
}

/**
 * 전문성 영역 일치도 계산
 */
function calculateExpertiseAlignment(mentor: MentorProfile, mentee: MenteeProfile): number {
  const mentorAreas = new Set(mentor.expertiseAreas.map(area => area.toLowerCase()))
  const menteeInterests = new Set(mentee.interestedAreas.map(area => area.toLowerCase()))
  
  // 교집합 계산
  const intersection = new Set([...mentorAreas].filter(x => menteeInterests.has(x)))
  const union = new Set([...mentorAreas, ...menteeInterests])
  
  if (union.size === 0) return 0
  
  // Jaccard 유사도 계산
  return intersection.size / union.size
}

/**
 * 시간 가용성 일치도 계산
 */
function calculateAvailabilityAlignment(mentor: MentorProfile, mentee: MenteeProfile): number {
  if (!mentor.availability.isAvailable || !mentee.availability.isAvailable) {
    return 0
  }
  
  // 선호 요일 일치도
  const mentorDays = new Set(mentor.availability.preferredDays)
  const menteeDays = new Set(mentee.availability.preferredDays)
  const dayIntersection = new Set([...mentorDays].filter(x => menteeDays.has(x)))
  const dayAlignment = dayIntersection.size / Math.max(mentorDays.size, menteeDays.size)
  
  // 선호 시간 일치도
  const mentorHours = new Set(mentor.availability.preferredHours)
  const menteeHours = new Set(mentee.availability.preferredHours)
  const hourIntersection = new Set([...mentorHours].filter(x => menteeHours.has(x)))
  const hourAlignment = hourIntersection.size / Math.max(mentorHours.size, menteeHours.size)
  
  // 시간대 일치도 (같은 시간대면 1, 다르면 0.5)
  const timezoneAlignment = mentor.availability.timeZone === mentee.availability.timeZone ? 1 : 0.5
  
  return (dayAlignment + hourAlignment + timezoneAlignment) / 3
}

/**
 * 소통 스타일 일치도 계산
 */
function calculateCommunicationMatch(mentor: MentorProfile, mentee: MenteeProfile): number {
  const mentorStyle = mentor.mentoringPreferences.preferredCommunicationStyle
  const menteeStyle = mentee.mentorshipPreferences.communicationStyle
  
  if (mentorStyle === menteeStyle) return 1
  if (mentorStyle === 'mixed' || menteeStyle === 'mixed') return 0.8
  return 0.4 // 완전히 다른 스타일
}

/**
 * 산업 분야 일치도 계산
 */
function calculateIndustryAlignment(mentor: MentorProfile, mentee: MenteeProfile): number {
  if (!mentor.industry || !mentee.industry) return 0.5 // 정보 없으면 중립
  
  if (mentor.industry.toLowerCase() === mentee.industry.toLowerCase()) return 1
  
  // 관련 산업 분야 매핑 (확장 가능)
  const relatedIndustries: { [key: string]: string[] } = {
    'technology': ['software', 'it', 'ai', 'data'],
    'finance': ['banking', 'investment', 'fintech'],
    'healthcare': ['medical', 'pharmaceutical', 'biotech'],
    'education': ['training', 'academic', 'learning']
  }
  
  const mentorLower = mentor.industry.toLowerCase()
  const menteeLower = mentee.industry.toLowerCase()
  
  for (const [key, related] of Object.entries(relatedIndustries)) {
    if ((key === mentorLower || related.includes(mentorLower)) &&
        (key === menteeLower || related.includes(menteeLower))) {
      return 0.7 // 관련 분야
    }
  }
  
  return 0.2 // 다른 분야
}

/**
 * 경험 격차 적절성 계산
 */
function calculateExperienceGapScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  const experienceLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 }
  
  const mentorLevel = experienceLevels[mentor.experienceLevel]
  const menteeLevel = experienceLevels[mentee.currentLevel]
  
  const gap = mentorLevel - menteeLevel
  
  // 적절한 격차는 1-2 레벨 차이
  if (gap >= 1 && gap <= 2) return 1
  if (gap === 3) return 0.7 // 격차가 큰 경우
  if (gap === 0) return 0.5 // 같은 레벨
  if (gap < 0) return 0.2 // 멘티가 더 경험이 많은 경우
  
  return 0.1 // 격차가 너무 큰 경우
}

/**
 * 멘토-멘티 매칭 알고리즘
 */
export function findBestMatches(
  mentors: MentorProfile[],
  mentees: MenteeProfile[],
  criteria: MatchingCriteria = DEFAULT_MATCHING_CRITERIA
): MentorshipMatch[] {
  const matches: MentorshipMatch[] = []
  const mentorMatchCounts = new Map<string, number>()
  const menteeMatchCounts = new Map<string, number>()
  
  // 모든 가능한 조합의 호환성 점수 계산
  const candidateMatches = []
  
  for (const mentor of mentors) {
    if (!mentor.availability.isAvailable) continue
    
    for (const mentee of mentees) {
      if (!mentee.availability.isAvailable) continue
      
      const compatibilityScore = calculateCompatibilityScore(mentor, mentee, criteria)
      
      if (compatibilityScore >= criteria.minCompatibilityScore) {
        candidateMatches.push({
          mentor,
          mentee,
          compatibilityScore,
          matchingFactors: {
            expertiseAlignment: calculateExpertiseAlignment(mentor, mentee),
            availabilityAlignment: calculateAvailabilityAlignment(mentor, mentee),
            communicationStyleMatch: calculateCommunicationMatch(mentor, mentee),
            industryAlignment: calculateIndustryAlignment(mentor, mentee),
            experienceLevelGap: calculateExperienceGapScore(mentor, mentee)
          }
        })
      }
    }
  }
  
  // 호환성 점수 순으로 정렬
  candidateMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  
  // 매칭 제한을 고려하여 최종 매칭 선정
  for (const candidate of candidateMatches) {
    const mentorMatches = mentorMatchCounts.get(candidate.mentor.userId) || 0
    const menteeMatches = menteeMatchCounts.get(candidate.mentee.userId) || 0
    
    if (mentorMatches < criteria.maxMatchesPerMentor && 
        menteeMatches < criteria.maxMatchesPerMentee) {
      
      const match: MentorshipMatch = {
        matchId: generateMatchId(),
        sessionId: candidate.mentor.sessionId,
        mentorId: candidate.mentor.userId,
        menteeId: candidate.mentee.userId,
        compatibilityScore: candidate.compatibilityScore,
        matchingFactors: candidate.matchingFactors,
        status: 'pending',
        matchedAt: Date.now()
      }
      
      matches.push(match)
      mentorMatchCounts.set(candidate.mentor.userId, mentorMatches + 1)
      menteeMatchCounts.set(candidate.mentee.userId, menteeMatches + 1)
    }
  }
  
  return matches
}

/**
 * 매칭 ID 생성
 */
function generateMatchId(): string {
  return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 매칭 품질 분석
 */
export function analyzeMatchingQuality(matches: MentorshipMatch[]): {
  averageCompatibility: number
  scoreDistribution: { range: string; count: number }[]
  factorAnalysis: { factor: string; averageScore: number }[]
  recommendations: string[]
} {
  if (matches.length === 0) {
    return {
      averageCompatibility: 0,
      scoreDistribution: [],
      factorAnalysis: [],
      recommendations: ['매칭할 수 있는 참가자가 부족합니다.']
    }
  }
  
  const totalCompatibility = matches.reduce((sum, match) => sum + match.compatibilityScore, 0)
  const averageCompatibility = totalCompatibility / matches.length
  
  // 점수 분포 계산
  const scoreRanges = [
    { range: '0.9-1.0', min: 0.9, max: 1.0, count: 0 },
    { range: '0.8-0.9', min: 0.8, max: 0.9, count: 0 },
    { range: '0.7-0.8', min: 0.7, max: 0.8, count: 0 },
    { range: '0.6-0.7', min: 0.6, max: 0.7, count: 0 },
    { range: '0.5-0.6', min: 0.5, max: 0.6, count: 0 }
  ]
  
  matches.forEach(match => {
    for (const range of scoreRanges) {
      if (match.compatibilityScore >= range.min && match.compatibilityScore < range.max) {
        range.count++
        break
      }
    }
  })
  
  const scoreDistribution = scoreRanges.map(r => ({ range: r.range, count: r.count }))
  
  // 요소별 분석
  const factorSums = {
    expertiseAlignment: 0,
    availabilityAlignment: 0,
    communicationStyleMatch: 0,
    industryAlignment: 0,
    experienceLevelGap: 0
  }
  
  matches.forEach(match => {
    Object.keys(factorSums).forEach(factor => {
      factorSums[factor as keyof typeof factorSums] += 
        match.matchingFactors[factor as keyof typeof match.matchingFactors]
    })
  })
  
  const factorAnalysis = Object.entries(factorSums).map(([factor, sum]) => ({
    factor,
    averageScore: sum / matches.length
  }))
  
  // 개선 권장사항 생성
  const recommendations = []
  
  if (averageCompatibility < 0.7) {
    recommendations.push('전체적인 매칭 품질이 낮습니다. 참가자 프로필을 더 상세히 수집해보세요.')
  }
  
  const weakestFactor = factorAnalysis.reduce((min, current) => 
    current.averageScore < min.averageScore ? current : min
  )
  
  if (weakestFactor.averageScore < 0.6) {
    const factorNames: { [key: string]: string } = {
      expertiseAlignment: '전문성 일치도',
      availabilityAlignment: '시간 가용성',
      communicationStyleMatch: '소통 스타일',
      industryAlignment: '산업 분야',
      experienceLevelGap: '경험 격차'
    }
    
    recommendations.push(`${factorNames[weakestFactor.factor]} 측면에서 개선이 필요합니다.`)
  }
  
  if (matches.length < 5) {
    recommendations.push('더 많은 참가자를 모집하여 다양한 매칭 옵션을 제공해보세요.')
  }
  
  return {
    averageCompatibility,
    scoreDistribution,
    factorAnalysis,
    recommendations
  }
}

/**
 * 멘토 추천 시스템 (멘티가 선호하는 멘토 찾기)
 */
export function recommendMentorsForMentee(
  mentee: MenteeProfile,
  availableMentors: MentorProfile[],
  limit: number = 5
): Array<{ mentor: MentorProfile; score: number; reasons: string[] }> {
  const recommendations = availableMentors
    .filter(mentor => mentor.availability.isAvailable)
    .map(mentor => {
      const score = calculateCompatibilityScore(mentor, mentee)
      const reasons = generateRecommendationReasons(mentor, mentee)
      return { mentor, score, reasons }
    })
    .filter(rec => rec.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  return recommendations
}

/**
 * 추천 이유 생성
 */
function generateRecommendationReasons(mentor: MentorProfile, mentee: MenteeProfile): string[] {
  const reasons = []
  
  // 전문성 일치
  const commonAreas = mentor.expertiseAreas.filter(area => 
    mentee.interestedAreas.some(interest => 
      interest.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(interest.toLowerCase())
    )
  )
  
  if (commonAreas.length > 0) {
    reasons.push(`${commonAreas.join(', ')} 분야의 전문 지식을 보유하고 있습니다`)
  }
  
  // 경험 수준
  const experienceLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 }
  const gap = experienceLevels[mentor.experienceLevel] - experienceLevels[mentee.currentLevel]
  
  if (gap === 1) {
    reasons.push('적절한 경험 차이로 실질적인 조언을 제공할 수 있습니다')
  } else if (gap === 2) {
    reasons.push('풍부한 경험을 바탕으로 전략적 가이드를 제공할 수 있습니다')
  }
  
  // 산업 분야
  if (mentor.industry && mentee.industry && 
      mentor.industry.toLowerCase() === mentee.industry.toLowerCase()) {
    reasons.push('같은 업계에서의 실무 경험을 공유할 수 있습니다')
  }
  
  // 소통 스타일
  if (mentor.mentoringPreferences.preferredCommunicationStyle === 
      mentee.mentorshipPreferences.communicationStyle) {
    reasons.push('선호하는 소통 방식이 일치합니다')
  }
  
  // 시간 가용성
  const mentorDays = new Set(mentor.availability.preferredDays)
  const menteeDays = new Set(mentee.availability.preferredDays)
  const commonDays = [...mentorDays].filter(x => menteeDays.has(x))
  
  if (commonDays.length > 0) {
    reasons.push(`${commonDays.join(', ')} 일정이 맞습니다`)
  }
  
  return reasons
}