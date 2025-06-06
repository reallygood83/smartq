// SmartQ - Utility Types and Functions

export enum SessionType {
  DEBATE = 'debate',        // 토론/논제 발굴
  INQUIRY = 'inquiry',      // 탐구 활동 (과학 실험 등)
  PROBLEM = 'problem',      // 문제 해결 (수학, 논리)
  CREATIVE = 'creative',    // 창작 활동 (국어, 미술)
  GENERAL = 'general',      // 일반 Q&A
  DISCUSSION = 'discussion' // 토의/의견 나누기
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
  type: 'text' | 'link' | 'instruction';
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
    default:
      return '❓';
  }
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