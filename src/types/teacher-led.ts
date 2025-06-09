// Teacher-Led Mode Data Types
// 기존 types와 완전 독립적인 새로운 타입 정의

export interface TeacherQuestion {
  questionId: string;
  sessionId: string;
  text: string;
  teacherId: string;
  order: number;
  source: 'prepared' | 'realtime';
  status: 'waiting' | 'active' | 'completed';
  createdAt: number;
  activatedAt?: number;
  completedAt?: number;
  
  // 메타데이터 (선택적)
  estimatedDifficulty?: 'easy' | 'medium' | 'hard';
  cognitiveLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
  targetConcepts?: string[];
}

export interface StudentResponse {
  responseId: string;
  questionId: string; // TeacherQuestion 참조
  sessionId: string;
  studentId: string;
  text: string;
  createdAt: number;
  isAnonymous: boolean;
  studentName?: string;
  
  // AI 분석 결과 (나중에 추가)
  analysisResult?: ResponseAnalysis;
}

// 기본 AI 분석 인터페이스
export interface ResponseAnalysis {
  responseId: string;
  comprehensionLevel: 'advanced' | 'proficient' | 'developing' | 'beginning';
  keyPoints: string[];
  misconceptions?: string[];
  confidence: number; // 0-1
}

// 교사용 질문 분석
export interface QuestionAnalysis {
  questionId: string;
  totalResponses: number;
  avgResponseLength: number;
  
  // 이해도 분포
  comprehensionDistribution: {
    advanced: number;
    proficient: number;
    developing: number;
    beginning: number;
  };
  
  // 키워드 분석
  topKeywords: { word: string; count: number }[];
  conceptsIdentified: string[];
  
  // 오개념 감지
  potentialMisconceptions: {
    concept: string;
    frequency: number;
    evidence: string[];
  }[];
}

// 세션 모드 확장 (기존 Session 인터페이스와 호환)
export interface SessionModeExtension {
  interactionMode?: 'free_question' | 'teacher_led';
  activeTeacherQuestionId?: string;
  teacherQuestionCount?: number;
}

// 후속 질문 추천
export interface QuestionRecommendation {
  type: 'clarification' | 'extension' | 'remediation' | 'application';
  priority: 'high' | 'medium' | 'low';
  question: string;
  reasoning: string;
  targetStudents?: 'all' | 'struggling' | 'advanced';
}

// API 요청/응답 타입
export interface CreateTeacherQuestionRequest {
  sessionId: string;
  text: string;
  source: 'prepared' | 'realtime';
  order?: number;
}

export interface ActivateQuestionRequest {
  sessionId: string;
  questionId: string;
}

export interface SubmitResponseRequest {
  questionId: string;
  sessionId: string;
  text: string;
  studentId: string;
  isAnonymous: boolean;
  studentName?: string;
}

// UI 상태 관리 타입
export interface TeacherLedSessionState {
  currentQuestionId: string | null;
  questions: TeacherQuestion[];
  responses: StudentResponse[];
  isLoading: boolean;
  error: string | null;
}

export interface QuestionFormData {
  text: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  concepts?: string[];
}