// SmartQ - Utility Types and Functions
import { AdultLearnerType, SessionMode } from '@/types/education'

export enum SessionType {
  // 기본 교육용 세션 타입
  DEBATE = 'debate',        // 토론/논제 발굴
  INQUIRY = 'inquiry',      // 탐구 활동 (과학 실험 등)
  PROBLEM = 'problem',      // 문제 해결 (수학, 논리)
  CREATIVE = 'creative',    // 창작 활동 (국어, 미술)
  GENERAL = 'general',      // 일반 Q&A
  DISCUSSION = 'discussion', // 토의/의견 나누기
  
  // 성인 교육용 세션 타입
  CORPORATE_TRAINING = 'corporate_training',  // 기업 연수
  UNIVERSITY_LECTURE = 'university_lecture',  // 대학 강의
  SEMINAR = 'seminar',                       // 세미나
  WORKSHOP = 'workshop',                     // 워크샵
  CONFERENCE = 'conference',                 // 컨퍼런스
  PROFESSIONAL_DEV = 'professional_dev',     // 전문 개발
  CERTIFICATION = 'certification',           // 자격증 과정
  MENTORING = 'mentoring',                   // 멘토링
  NETWORKING = 'networking'                  // 네트워킹
}

export enum Subject {
  KOREAN = 'korean',
  MATH = 'math',
  SCIENCE = 'science',
  SOCIAL = 'social',
  ENGLISH = 'english',
  ART = 'art',
  MUSIC = 'music',
  PE = 'pe',
  PRACTICAL = 'practical',
  MORAL = 'moral'
}

export interface Question {
  questionId: string;
  text: string;
  studentName?: string;
  studentId?: string; // 학생을 구분하기 위한 브라우저 세션 기반 ID
  isAnonymous: boolean;
  createdAt: number;
  sessionId: string;
}

export interface Session {
  sessionId: string;
  title: string;
  accessCode: string;
  createdAt: number;
  teacherId?: string;
  sessionType: SessionType;
  subjects: Subject[];
  learningGoals?: string;
  materials?: Material[];
  keywords?: string[];
  aiAnalysisResult?: MultiSubjectAnalysisResult;
  
  // Teacher-led mode support
  interactionMode?: SessionMode;
  activeTeacherQuestionId?: string;
  
  // Adult education specific fields
  isAdultEducation?: boolean;
  adultLearnerType?: AdultLearnerType;
  targetAudience?: string;
  prerequisites?: string;
  duration?: string;
  participantCount?: string;
  industryFocus?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  deliveryFormat?: 'in-person' | 'online' | 'hybrid';
  certificationOffered?: boolean;
  networkingOpportunities?: boolean;
  updatedAt?: number;
}

export interface Material {
  type: 'text' | 'youtube' | 'link' | 'file';
  content?: string;
  url?: string;
  fileName?: string;
  fileUrl?: string;
  linkTitle?: string;
}

export interface QuestionCluster {
  clusterId: string;
  clusterTitle: string;
  clusterSummary: string;
  questions: string[];
  combinationGuide: string;
}

export interface ActivityRecommendation {
  activityId: string;
  activityTitle: string;
  activityType: string;
  subject: Subject;
  description: string;
  materials: string[];
  timeRequired: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedQuestions: string[];
  reason: string;
}

export interface SubjectAnalysisResult {
  keyInsights: string[];
  misconceptions: string[];
  skillLevels: Record<string, number>;
  recommendedActivities: ActivityRecommendation[];
}

export interface MultiSubjectAnalysisResult {
  clusteredQuestions: QuestionCluster[];
  subjectAnalysis: Record<Subject, SubjectAnalysisResult>;
  recommendedActivities: ActivityRecommendation[];
  extractedTerms: TermDefinition[];
  conceptDefinitions: TermDefinition[];
}

export interface TermDefinition {
  definitionId?: string;
  term: string;
  definition: string;
  description?: string;
  studentGroup?: string;
  sessionId?: string;
}

export interface SharedContent {
  contentId: string;
  title: string;
  content: string;
  type: 'text' | 'link' | 'instruction' | 'youtube';
  createdAt: number;
  sessionId: string;
  teacherId: string;
}

// Utility functions
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function extractYoutubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getSessionTypeLabel(type: SessionType): string {
  switch (type) {
    case SessionType.DEBATE:
      return '토론/논제 발굴';
    case SessionType.INQUIRY:
      return '탐구 활동';
    case SessionType.PROBLEM:
      return '문제 해결';
    case SessionType.CREATIVE:
      return '창작 활동';
    case SessionType.DISCUSSION:
      return '토의/의견 나누기';
    case SessionType.GENERAL:
      return '일반 Q&A';
    
    // 성인 교육용 세션 타입 라벨
    case SessionType.CORPORATE_TRAINING:
      return '기업 연수';
    case SessionType.UNIVERSITY_LECTURE:
      return '대학 강의';
    case SessionType.SEMINAR:
      return '세미나';
    case SessionType.WORKSHOP:
      return '워크샵';
    case SessionType.CONFERENCE:
      return '컨퍼런스';
    case SessionType.PROFESSIONAL_DEV:
      return '전문 개발';
    case SessionType.CERTIFICATION:
      return '자격증 과정';
    case SessionType.MENTORING:
      return '멘토링';
    case SessionType.NETWORKING:
      return '네트워킹';
    
    default:
      return '일반 Q&A';
  }
}

export function getSubjectLabel(subject: Subject): string {
  switch (subject) {
    case Subject.KOREAN:
      return '국어';
    case Subject.MATH:
      return '수학';
    case Subject.SCIENCE:
      return '과학';
    case Subject.SOCIAL:
      return '사회';
    case Subject.ENGLISH:
      return '영어';
    case Subject.ART:
      return '미술';
    case Subject.MUSIC:
      return '음악';
    case Subject.PE:
      return '체육';
    case Subject.PRACTICAL:
      return '실과';
    case Subject.MORAL:
      return '도덕';
    default:
      return subject;
  }
}

export function getSessionTypeIcon(type: SessionType): string {
  switch (type) {
    case SessionType.DEBATE:
      return '💬';
    case SessionType.INQUIRY:
      return '🔬';
    case SessionType.PROBLEM:
      return '🧮';
    case SessionType.CREATIVE:
      return '🎨';
    case SessionType.DISCUSSION:
      return '💭';
    case SessionType.GENERAL:
      return '❓';
    
    // 성인 교육용 세션 타입 아이콘
    case SessionType.CORPORATE_TRAINING:
      return '🏢';
    case SessionType.UNIVERSITY_LECTURE:
      return '🎓';
    case SessionType.SEMINAR:
      return '📊';
    case SessionType.WORKSHOP:
      return '🔧';
    case SessionType.CONFERENCE:
      return '🎤';
    case SessionType.PROFESSIONAL_DEV:
      return '📈';
    case SessionType.CERTIFICATION:
      return '🏆';
    case SessionType.MENTORING:
      return '👨‍🏫';
    case SessionType.NETWORKING:
      return '🤝';
    
    default:
      return '❓';
  }
}

export function getSessionTypeDescription(type: SessionType): string {
  switch (type) {
    case SessionType.DEBATE:
      return '토론 주제를 발굴하고 다양한 관점 탐색';
    case SessionType.INQUIRY:
      return '과학적 탐구와 실험 설계 활동';
    case SessionType.PROBLEM:
      return '수학적 사고와 논리적 문제 해결';
    case SessionType.CREATIVE:
      return '창의적 표현과 상상력 발휘 활동';
    case SessionType.DISCUSSION:
      return '협력적 토의와 의견 공유';
    case SessionType.GENERAL:
      return '자유로운 질문과 답변으로 시작하는 기본 활동';
    
    // 성인 교육용 세션 타입 설명
    case SessionType.CORPORATE_TRAINING:
      return '기업 내 직무 역량 강화 및 전문성 개발';
    case SessionType.UNIVERSITY_LECTURE:
      return '대학 수준의 학술적 강의 및 토론';
    case SessionType.SEMINAR:
      return '전문 주제에 대한 심화 학습 및 토론';
    case SessionType.WORKSHOP:
      return '실습 중심의 체험형 학습 활동';
    case SessionType.CONFERENCE:
      return '전문가들의 지식 공유 및 네트워킹';
    case SessionType.PROFESSIONAL_DEV:
      return '개인 경력 개발 및 전문성 향상';
    case SessionType.CERTIFICATION:
      return '자격증 취득을 위한 체계적 학습';
    case SessionType.MENTORING:
      return '1:1 또는 소그룹 멘토링 세션';
    case SessionType.NETWORKING:
      return '업계 전문가들과의 네트워킹 및 정보 교환';
    
    default:
      return '자유로운 질문과 답변으로 시작하는 기본 활동';
  }
}

// 기본 교육용 세션 타입
export const BASIC_SESSION_TYPES: SessionType[] = [
  SessionType.GENERAL,
  SessionType.DEBATE,
  SessionType.INQUIRY,
  SessionType.PROBLEM,
  SessionType.CREATIVE,
  SessionType.DISCUSSION
]

// 성인 교육용 세션 타입
export const ADULT_SESSION_TYPES: SessionType[] = [
  SessionType.CORPORATE_TRAINING,
  SessionType.UNIVERSITY_LECTURE,
  SessionType.SEMINAR,
  SessionType.WORKSHOP,
  SessionType.CONFERENCE,
  SessionType.PROFESSIONAL_DEV,
  SessionType.CERTIFICATION,
  SessionType.MENTORING,
  SessionType.NETWORKING
]

// 교육 레벨에 따른 세션 타입 추천
export function getRecommendedSessionTypes(isAdultEducation: boolean = false): SessionType[] {
  return isAdultEducation ? ADULT_SESSION_TYPES : BASIC_SESSION_TYPES
}

// 세션 타입이 성인용인지 확인
export function isAdultSessionType(type: SessionType): boolean {
  return ADULT_SESSION_TYPES.includes(type)
}

export function getSubjectColor(subject: Subject): string {
  switch (subject) {
    case Subject.KOREAN:
      return 'bg-red-100 text-red-800';
    case Subject.MATH:
      return 'bg-blue-100 text-blue-800';
    case Subject.SCIENCE:
      return 'bg-green-100 text-green-800';
    case Subject.SOCIAL:
      return 'bg-yellow-100 text-yellow-800';
    case Subject.ENGLISH:
      return 'bg-purple-100 text-purple-800';
    case Subject.ART:
      return 'bg-pink-100 text-pink-800';
    case Subject.MUSIC:
      return 'bg-indigo-100 text-indigo-800';
    case Subject.PE:
      return 'bg-orange-100 text-orange-800';
    case Subject.PRACTICAL:
      return 'bg-teal-100 text-teal-800';
    case Subject.MORAL:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// YouTube URL 관련 함수들
export function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

export function getYouTubeVideoId(url: string): string | null {
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const regex of regexPatterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
}

// Firebase에 저장하기 전에 undefined 값을 제거하는 함수
export function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirebase(item)) as T
  }
  
  if (typeof obj === 'object') {
    const sanitized = {} as T
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        (sanitized as any)[key] = sanitizeForFirebase(value)
      }
    }
    return sanitized
  }
  
  return obj
}

// AI 분석 결과에 sessionId를 추가하고 undefined 값을 제거하는 함수
export function prepareAnalysisResultForFirebase(
  result: MultiSubjectAnalysisResult, 
  sessionId: string
): MultiSubjectAnalysisResult {
  const cleanResult = {
    ...result,
    conceptDefinitions: result.conceptDefinitions?.map(concept => ({
      ...concept,
      sessionId: sessionId
    })) || []
  }
  
  return sanitizeForFirebase(cleanResult)
}