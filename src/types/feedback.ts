// SmartQ - 전문적 피드백 시스템 타입 정의

export enum FeedbackType {
  PEER_REVIEW = 'peer_review',           // 동료 간 피드백
  MENTOR_GUIDANCE = 'mentor_guidance',   // 멘토 가이던스
  SKILL_ASSESSMENT = 'skill_assessment', // 기술 평가
  PROJECT_REVIEW = 'project_review',     // 프로젝트 리뷰
  PRESENTATION_FEEDBACK = 'presentation_feedback', // 발표 피드백
  COLLABORATION_FEEDBACK = 'collaboration_feedback' // 협업 피드백
}

export enum FeedbackStatus {
  PENDING = 'pending',       // 대기 중
  IN_PROGRESS = 'in_progress', // 진행 중
  COMPLETED = 'completed',   // 완료
  EXPIRED = 'expired'        // 만료됨
}

export enum FeedbackCategory {
  TECHNICAL_SKILLS = 'technical_skills',     // 기술적 역량
  COMMUNICATION = 'communication',           // 커뮤니케이션
  LEADERSHIP = 'leadership',                // 리더십
  PROBLEM_SOLVING = 'problem_solving',      // 문제 해결
  CREATIVITY = 'creativity',                // 창의성
  TEAMWORK = 'teamwork',                   // 팀워크
  PRESENTATION = 'presentation',            // 발표 능력
  ANALYTICAL_THINKING = 'analytical_thinking' // 분석적 사고
}

export interface FeedbackRequest {
  requestId: string
  sessionId: string
  requesterId: string         // 피드백 요청자 ID
  requesterName: string       // 요청자 이름
  requesterEmail?: string     // 요청자 이메일
  
  // 피드백 요청 정보
  feedbackType: FeedbackType
  categories: FeedbackCategory[]
  title: string              // 피드백 요청 제목
  description: string        // 상세 설명
  specificQuestions?: string[] // 구체적 질문들
  
  // 첨부 자료
  attachments?: {
    type: 'document' | 'presentation' | 'video' | 'audio' | 'link'
    url: string
    title: string
    description?: string
  }[]
  
  // 대상자 정보
  targetAudience?: {
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    industry?: string
    role?: string
    experienceYears?: string
  }
  
  // 일정 정보
  createdAt: number
  deadline?: number          // 피드백 마감 기한
  estimatedDuration?: string // 예상 소요 시간
  
  // 상태 관리
  status: FeedbackStatus
  priority: 'low' | 'medium' | 'high'
  isAnonymous: boolean       // 익명 요청 여부
  
  // 메타데이터
  tags?: string[]
  linkedSessionData?: {
    sessionTitle: string
    sessionType: string
    learningGoals?: string
  }
}

export interface FeedbackResponse {
  responseId: string
  requestId: string
  reviewerId: string         // 피드백 제공자 ID
  reviewerName: string       // 제공자 이름
  reviewerProfile?: {
    expertise: string[]
    experienceYears: string
    industry: string
    role: string
    certifications?: string[]
  }
  
  // 피드백 내용
  overallRating: number      // 전체 평가 (1-10)
  categoryRatings: {
    category: FeedbackCategory
    rating: number           // 카테고리별 평가 (1-10)
    feedback: string         // 카테고리별 피드백
  }[]
  
  // 구체적 피드백
  strengths: string[]        // 강점
  improvementAreas: string[] // 개선 영역
  specificSuggestions: string[] // 구체적 제안
  actionItems: string[]      // 실행 항목
  
  // 추가 평가
  detailedFeedback: string   // 상세 피드백
  examplesCases?: string[]   // 예시/사례
  resourceRecommendations?: { // 추천 자료
    title: string
    url?: string
    description: string
    type: 'book' | 'course' | 'article' | 'tool' | 'community'
  }[]
  
  // 후속 조치
  followUpSuggestions?: string[] // 후속 제안
  mentorshipOffer?: boolean  // 멘토링 제안 여부
  collaborationInterest?: boolean // 협업 관심 여부
  
  // 메타데이터
  submittedAt: number
  timeSpent?: number         // 피드백 작성 소요 시간 (분)
  confidence: number         // 피드백 신뢰도 (1-10)
  isConstructive: boolean    // 건설적 피드백 여부
  
  // AI 분석 결과 (선택적)
  aiAnalysis?: {
    qualityScore: number     // AI 분석 품질 점수
    sentiment: 'positive' | 'neutral' | 'constructive' | 'critical'
    actionability: number    // 실행 가능성 점수 (1-10)
    specificity: number      // 구체성 점수 (1-10)
  }
}

export interface FeedbackSession {
  sessionId: string
  title: string
  description: string
  organizerId: string
  organizerName: string
  
  // 세션 설정
  sessionType: 'open_feedback' | 'structured_review' | 'peer_circle' | 'expert_panel'
  maxParticipants?: number
  duration: string           // 예상 소요 시간
  
  // 참여자 관리
  participants: {
    userId: string
    name: string
    role: 'organizer' | 'participant' | 'expert' | 'observer'
    status: 'invited' | 'confirmed' | 'declined' | 'attended'
    expertise?: string[]
  }[]
  
  // 일정
  scheduledAt?: number       // 예정 시간
  createdAt: number
  startedAt?: number
  endedAt?: number
  
  // 피드백 요청들
  feedbackRequests: string[] // FeedbackRequest IDs
  
  // 세션 결과
  summary?: {
    totalFeedbackGiven: number
    totalFeedbackReceived: number
    averageQualityScore: number
    participantSatisfaction: number
    keyInsights: string[]
  }
  
  status: 'planning' | 'open' | 'in_progress' | 'completed' | 'cancelled'
}

export interface FeedbackAnalytics {
  userId: string
  userName: string
  
  // 피드백 제공 통계
  feedbackGiven: {
    total: number
    byCategory: Record<FeedbackCategory, number>
    averageQuality: number
    averageResponseTime: number  // 시간(시간)
  }
  
  // 피드백 수신 통계
  feedbackReceived: {
    total: number
    byCategory: Record<FeedbackCategory, number>
    averageRating: number
    improvementTrends: {
      category: FeedbackCategory
      previousScore: number
      currentScore: number
      trend: 'improving' | 'stable' | 'declining'
    }[]
  }
  
  // 성장 지표
  growthMetrics: {
    skillDevelopmentAreas: {
      category: FeedbackCategory
      currentLevel: number
      targetLevel: number
      progressRate: number
      timeToTarget?: number    // 목표 달성 예상 시간(일)
    }[]
    
    strengthAreas: FeedbackCategory[]
    developmentAreas: FeedbackCategory[]
    
    // 학습 추천
    recommendedActions: {
      priority: 'high' | 'medium' | 'low'
      category: FeedbackCategory
      action: string
      estimatedImpact: number  // 예상 효과 (1-10)
      resources?: string[]
    }[]
  }
  
  // 네트워킹 지표
  networkingMetrics: {
    mentorshipConnections: number
    peerConnections: number
    expertConnections: number
    collaborationOpportunities: number
  }
  
  lastUpdated: number
}

export interface MentorshipConnection {
  connectionId: string
  mentorId: string
  menteeId: string
  mentorName: string
  menteeName: string
  
  // 멘토십 정보
  focus: FeedbackCategory[]
  goals: string[]
  duration: string           // 멘토십 기간
  frequency: string          // 미팅 빈도
  
  // 진행 상황
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
  startedAt?: number
  expectedEndAt?: number
  
  // 활동 기록
  sessions: {
    sessionId: string
    date: number
    duration: number         // 분
    topics: string[]
    feedback?: string
    nextSteps?: string[]
  }[]
  
  // 평가
  mentorRating?: number      // 멘티의 멘토 평가
  menteeProgress?: number    // 멘토의 멘티 진전 평가
  
  createdAt: number
  lastActivityAt?: number
}