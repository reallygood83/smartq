// 멘토-멘티 피드백 시스템을 위한 타입 정의

export interface MentorProfile {
  userId: string
  sessionId: string
  name: string
  email?: string
  expertiseAreas: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  industry?: string
  jobTitle?: string
  yearsOfExperience?: number
  mentoringPreferences: {
    maxMentees: number
    preferredCommunicationStyle: 'formal' | 'casual' | 'mixed'
    availableTimeSlots: string[]
    feedbackStyle: 'detailed' | 'concise' | 'structured'
  }
  availability: {
    isAvailable: boolean
    timeZone: string
    preferredDays: string[]
    preferredHours: string[]
  }
  createdAt: number
  updatedAt: number
}

export interface MenteeProfile {
  userId: string
  sessionId: string
  name: string
  email?: string
  learningGoals: string[]
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  interestedAreas: string[]
  industry?: string
  background?: string
  challengesNeeded: string[]
  mentorshipPreferences: {
    preferredMentorExperience: 'any' | 'intermediate' | 'advanced' | 'expert'
    communicationStyle: 'formal' | 'casual' | 'mixed'
    feedbackFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  }
  availability: {
    isAvailable: boolean
    timeZone: string
    preferredDays: string[]
    preferredHours: string[]
  }
  createdAt: number
  updatedAt: number
}

export interface MentorshipMatch {
  matchId: string
  sessionId: string
  mentorId: string
  menteeId: string
  compatibilityScore: number
  matchingFactors: {
    expertiseAlignment: number
    availabilityAlignment: number
    communicationStyleMatch: number
    industryAlignment: number
    experienceLevelGap: number
  }
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed' | 'paused'
  matchedAt: number
  acceptedAt?: number
  completedAt?: number
  feedback?: {
    mentorRating: number
    menteeRating: number
    mentorComments?: string
    menteeComments?: string
  }
}

export interface MentorshipSession {
  sessionId: string
  matchId: string
  mentorId: string
  menteeId: string
  title: string
  description?: string
  scheduledAt: number
  duration: number // in minutes
  type: 'video' | 'audio' | 'text' | 'in-person'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  agenda?: string[]
  outcomes?: string[]
  feedback?: {
    quality: number
    helpfulness: number
    clarity: number
    followUp: boolean
    comments?: string
  }
  followUpActions?: string[]
  createdAt: number
  updatedAt: number
}

export interface MentorshipRequest {
  requestId: string
  sessionId: string
  fromUserId: string
  toUserId: string
  type: 'mentor_request' | 'mentee_request'
  message?: string
  proposedSchedule?: {
    date: string
    time: string
    duration: number
  }
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: number
  respondedAt?: number
}

export interface MentorshipAnalytics {
  sessionId: string
  totalMatches: number
  activeMatches: number
  completedMatches: number
  averageCompatibilityScore: number
  successRate: number
  averageSessionDuration: number
  topExpertiseAreas: { area: string; count: number }[]
  participationRate: {
    mentors: number
    mentees: number
  }
  satisfactionScores: {
    overall: number
    mentorSatisfaction: number
    menteeSatisfaction: number
  }
  improvementAreas: string[]
  recommendations: string[]
  generatedAt: number
}

// 매칭 알고리즘 설정
export interface MatchingCriteria {
  expertiseWeight: number // 전문성 일치도 가중치
  availabilityWeight: number // 시간 일치도 가중치
  communicationWeight: number // 소통 스타일 일치도 가중치
  industryWeight: number // 산업 분야 일치도 가중치
  experienceGapWeight: number // 경험 격차 가중치
  minCompatibilityScore: number // 최소 호환성 점수
  maxMatchesPerMentor: number // 멘토당 최대 매칭 수
  maxMatchesPerMentee: number // 멘티당 최대 매칭 수
}

// 기본 매칭 기준
export const DEFAULT_MATCHING_CRITERIA: MatchingCriteria = {
  expertiseWeight: 0.3,
  availabilityWeight: 0.25,
  communicationWeight: 0.2,
  industryWeight: 0.15,
  experienceGapWeight: 0.1,
  minCompatibilityScore: 0.6,
  maxMatchesPerMentor: 3,
  maxMatchesPerMentee: 1
}