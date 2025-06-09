# SmartQ AI 통합 교사 주도 모드 PRD (Product Requirements Document)

## 📋 문서 개요

### 버전 정보
- **버전**: Final v1.0
- **작성일**: 2025년 1월
- **개발 철학**: 안정적 연착륙 (Soft Landing)
- **핵심 원칙**: 기존 시스템 100% 보존 + 점진적 확장

---

## 🎯 개발 가능성 및 범위

### 현실적 개발 범위 평가

#### ✅ **100% 개발 가능 (기존 기술 스택 활용)**
```
🔵 기본 교사 주도 모드
- 세션 모드 선택 UI
- 교사 질문 CRUD
- 실시간 답변 수집
- 기본 통계 표시

🔵 기존 AI 확장  
- Gemini API 활용 답변 분석
- 간단한 이해도 분류
- 키워드 기반 오개념 감지
- 후속 질문 템플릿 제공
```

#### ⚠️ **단계적 개발 권장 (복잡도 고려)**
```
🟡 고급 AI 분석
- 정교한 감정 분석
- 개별 학습 패턴 추적
- 예측 모델링
- 실시간 루브릭 평가

🟡 개인화 기능
- 학생별 맞춤 피드백
- 적응형 난이도 조절
- 장기간 성장 추적
```

#### ❌ **현재 범위 외 (미래 확장)**
```
🔴 고도 AI 기능
- 음성/영상 분석
- 자연어 생성 (GPT 수준)
- 완전 자동화 평가
- 메타버스 연동
```

---

## 🛡️ 안정적 개발 전략

### 연착륙 개발 원칙

#### 1. **Zero Impact Expansion (영향도 0 확장)**
```typescript
// ✅ 기존 코드 수정 없이 확장만
interface Session {
  // ... 기존 모든 필드 완전 보존
  
  // 새 필드 (선택적, 기본값 설정)
  interactionMode?: 'free_question' | 'teacher_led' = 'free_question';
  teacherQuestions?: TeacherQuestion[];
}

// ✅ 조건부 렌더링으로 기능 분리
const SessionPage = ({ session }) => {
  if (session.interactionMode === 'teacher_led') {
    return <TeacherLedMode session={session} />;
  }
  
  // 기존 코드 그대로 실행
  return <OriginalFreeQuestionMode session={session} />;
};
```

#### 2. **Feature Flag 기반 안전 배포**
```typescript
// ✅ 기능별 독립 배포
const useFeatureFlags = () => ({
  teacherLedMode: process.env.NEXT_PUBLIC_TEACHER_LED_ENABLED === 'true',
  aiAnalysis: process.env.NEXT_PUBLIC_AI_ANALYSIS_ENABLED === 'true',
  realtimeInsights: process.env.NEXT_PUBLIC_REALTIME_INSIGHTS_ENABLED === 'true'
});

// ✅ 단계별 활성화
const CreateSessionForm = () => {
  const { teacherLedMode } = useFeatureFlags();
  
  return (
    <form>
      {/* 기존 필드들 */}
      
      {teacherLedMode && (
        <ModeSelector />  // 새 기능만 조건부 표시
      )}
    </form>
  );
};
```

#### 3. **Graceful Degradation (우아한 성능 저하)**
```typescript
// ✅ AI 분석 실패 시에도 기본 기능 동작
const useAIAnalysis = (responses: StudentResponse[]) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const analyzeResponses = async () => {
    try {
      setIsLoading(true);
      const result = await aiService.analyze(responses);
      setAnalysis(result);
    } catch (error) {
      console.warn('AI 분석 실패, 기본 통계로 대체:', error);
      setAnalysis(generateBasicStats(responses));  // 폴백
    } finally {
      setIsLoading(false);
    }
  };
  
  return { analysis, isLoading, error, analyzeResponses };
};
```

---

## 📊 상세 개발 계획

### Phase 1: 기초 인프라 (2주) - **위험도 0%**

#### 1.1 데이터 구조 확장 (1주)
```typescript
// ✅ 완전히 독립적인 새 스키마
interface TeacherQuestion {
  questionId: string;
  sessionId: string;
  teacherId: string;
  text: string;
  order: number;
  source: 'prepared' | 'realtime';
  status: 'waiting' | 'active' | 'completed';
  createdAt: number;
  activatedAt?: number;
  completedAt?: number;
  
  // 메타데이터
  estimatedDifficulty?: 'easy' | 'medium' | 'hard';
  cognitiveLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
  targetConcepts?: string[];
}

interface StudentResponse {
  responseId: string;
  questionId: string;  // TeacherQuestion 참조
  sessionId: string;
  studentId: string;
  text: string;
  createdAt: number;
  
  // AI 분석 결과 (나중에 추가)
  analysisResult?: ResponseAnalysis;
}
```

#### 1.2 Firebase 스키마 안전 확장 (1주)
```json
{
  "rules": {
    // 기존 규칙 완전 보존
    "sessions": { /* 기존 그대로 */ },
    "questions": { /* 기존 그대로 */ },
    
    // 새 테이블 추가 (기존과 독립)
    "teacherQuestions": {
      "$sessionId": {
        ".read": "true",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$questionId": {
          ".validate": "newData.hasChildren(['questionId', 'text', 'teacherId', 'createdAt'])"
        }
      }
    },
    
    "studentResponses": {
      "$sessionId": {
        ".read": "true",
        ".write": "true",  // 학생 익명 작성 허용
        "$responseId": {
          ".validate": "newData.hasChildren(['responseId', 'questionId', 'text', 'studentId', 'createdAt'])"
        }
      }
    }
  }
}
```

### Phase 2: 기본 UI/UX (2주) - **위험도 5%**

#### 2.1 세션 생성 UI 확장 (1주)
```tsx
// ✅ 기존 CreateSessionForm에 최소 수정
const CreateSessionForm = () => {
  const [sessionMode, setSessionMode] = useState<'free_question' | 'teacher_led'>('free_question');
  const [preparedQuestions, setPreparedQuestions] = useState<string[]>(['']);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 기존 필드들 완전 보존 */}
      <input name="title" />
      <select name="subject" />
      <select name="sessionType" />
      
      {/* 새 필드 추가 */}
      <div className="mt-6 p-4 border rounded-lg bg-blue-50">
        <h3 className="font-semibold mb-3">🎯 수업 진행 방식</h3>
        
        <label className="flex items-center mb-2">
          <input 
            type="radio" 
            value="free_question"
            checked={sessionMode === 'free_question'}
            onChange={(e) => setSessionMode(e.target.value)}
          />
          <span className="ml-2">자유 질문 모드 (기본)</span>
        </label>
        
        <label className="flex items-center">
          <input 
            type="radio" 
            value="teacher_led"
            checked={sessionMode === 'teacher_led'}
            onChange={(e) => setSessionMode(e.target.value)}
          />
          <span className="ml-2">교사 주도 Q&A 모드 (신규)</span>
        </label>
      </div>
      
      {/* 조건부 질문 준비 섹션 */}
      {sessionMode === 'teacher_led' && (
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-medium mb-3">📝 질문 미리 준비하기 (선택사항)</h4>
          <p className="text-sm text-gray-600 mb-3">
            수업 중 언제든 질문을 추가할 수 있습니다
          </p>
          
          {preparedQuestions.map((question, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`질문 ${index + 1}: 예) 오늘 배운 내용 중 가장 인상 깊었던 것은?`}
                className="flex-1 px-3 py-2 border rounded"
              />
              {index > 0 && (
                <button type="button" onClick={() => removeQuestion(index)}>
                  ❌
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addQuestion}
            className="text-blue-600 text-sm"
          >
            + 질문 추가
          </button>
        </div>
      )}
      
      {/* 기존 제출 버튼 */}
      <button type="submit">세션 만들기</button>
    </form>
  );
};
```

#### 2.2 교사 대시보드 확장 (1주)
```tsx
// ✅ 기존 세션 페이지에 조건부 패널 추가
const TeacherSessionPage = ({ session }) => {
  return (
    <div className="space-y-6">
      {/* 기존 세션 정보 패널 유지 */}
      <SessionInfoPanel session={session} />
      
      {/* 조건부 모드별 대시보드 */}
      {session.interactionMode === 'teacher_led' ? (
        <TeacherLedDashboard session={session} />
      ) : (
        <FreeQuestionDashboard session={session} />  // 기존 그대로
      )}
    </div>
  );
};

const TeacherLedDashboard = ({ session }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionList, setQuestionList] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 질문 관리 패널 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">💭 질문 관리</h3>
        
        {/* 즉석 질문 입력 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            즉석 질문 (실시간 전송)
          </label>
          <div className="flex gap-2">
            <textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="수업 흐름에 맞는 질문을 입력하세요..."
              className="flex-1 px-3 py-2 border rounded resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => sendQuestionImmediately(currentQuestion)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                disabled={!currentQuestion.trim()}
              >
                📤 즉시 전송
              </button>
              <button 
                onClick={() => addToQueue(currentQuestion)}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm"
                disabled={!currentQuestion.trim()}
              >
                💾 대기열 추가
              </button>
            </div>
          </div>
        </div>
        
        {/* 질문 대기열 */}
        <div>
          <h4 className="font-medium mb-3">📋 질문 대기열</h4>
          <div className="space-y-2">
            {questionList.map((q, index) => (
              <div key={q.questionId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="text-sm">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      q.status === 'active' ? 'bg-green-100 text-green-700' :
                      q.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.status === 'active' ? '진행 중' :
                       q.status === 'completed' ? '완료' : '대기'}
                    </span>
                    {q.status === 'active' && (
                      <span className="text-xs text-gray-500">
                        답변: {q.responseCount || 0}/{session.studentCount || 0}명
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {q.status === 'waiting' && (
                    <button 
                      onClick={() => activateQuestion(q.questionId)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      활성화
                    </button>
                  )}
                  {q.status === 'active' && (
                    <button 
                      onClick={() => completeQuestion(q.questionId)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      종료
                    </button>
                  )}
                  <button 
                    onClick={() => editQuestion(q.questionId)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                  >
                    수정
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* 실시간 답변 현황 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 실시간 답변 현황</h3>
        
        {activeQuestionId ? (
          <ActiveQuestionPanel questionId={activeQuestionId} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>활성화된 질문이 없습니다</p>
            <p className="text-sm mt-1">질문을 활성화하여 학생 답변을 받아보세요</p>
          </div>
        )}
      </Card>
    </div>
  );
};
```

### Phase 3: 기본 AI 분석 (2주) - **위험도 10%**

#### 3.1 답변 기본 분석 (1주)
```typescript
// ✅ 기존 Gemini API 활용 확장
interface BasicResponseAnalysis {
  questionId: string;
  totalResponses: number;
  
  // 기본 통계
  avgResponseLength: number;
  responseTimeDistribution: {
    quick: number;    // 1분 이내
    normal: number;   // 1-3분
    slow: number;     // 3분 이상
  };
  
  // 키워드 분석 (기존 기술)
  topKeywords: { word: string; count: number }[];
  conceptsIdentified: string[];
  
  // 간단한 분류 (Gemini API)
  comprehensionLevels: {
    advanced: { count: number; examples: string[] };
    proficient: { count: number; examples: string[] };
    developing: { count: number; examples: string[] };
    beginning: { count: number; examples: string[] };
  };
  
  // 오개념 감지 (키워드 기반)
  potentialMisconceptions: {
    concept: string;
    frequency: number;
    evidence: string[];
  }[];
}

// ✅ 기존 AI 서비스 확장
const aiService = {
  // 기존 함수 유지
  analyzeQuestions: async (questions: Question[]) => { /* 기존 코드 */ },
  
  // 새 함수 추가
  analyzeResponses: async (responses: StudentResponse[]): Promise<BasicResponseAnalysis> => {
    try {
      // 1. 기본 통계 계산 (로컬)
      const basicStats = calculateBasicStats(responses);
      
      // 2. Gemini API로 내용 분석
      const geminiAnalysis = await geminiAPI.analyze({
        prompt: `다음 학생 답변들을 분석해주세요:
        
        ${responses.map(r => `학생답변: "${r.text}"`).join('\n')}
        
        분석 요청:
        1. 이해도 수준별 분류 (상/중상/중하/하)
        2. 주요 개념 추출
        3. 잠재적 오개념 발견
        
        JSON 형태로 응답해주세요.`,
        
        model: 'gemini-pro',
        temperature: 0.3
      });
      
      return {
        ...basicStats,
        ...geminiAnalysis,
        questionId: responses[0]?.questionId
      };
      
    } catch (error) {
      console.warn('AI 분석 실패, 기본 통계 제공:', error);
      return calculateBasicStats(responses);  // 폴백
    }
  }
};
```

#### 3.2 실시간 인사이트 대시보드 (1주)
```tsx
// ✅ AI 분석 결과 시각화
const ActiveQuestionPanel = ({ questionId }) => {
  const { responses, isLoading } = useRealTimeResponses(questionId);
  const { analysis, analyzeResponses } = useAIAnalysis();
  
  useEffect(() => {
    if (responses.length >= 5) {  // 최소 5개 답변 시 분석
      analyzeResponses(responses);
    }
  }, [responses]);
  
  return (
    <div className="space-y-4">
      {/* 실시간 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {responses.length}
          </div>
          <div className="text-sm text-gray-600">답변 수</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((responses.length / (session.studentCount || 1)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">참여율</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">
            {analysis?.avgResponseLength || 0}
          </div>
          <div className="text-sm text-gray-600">평균 글자수</div>
        </div>
      </div>
      
      {/* AI 분석 결과 */}
      {analysis && (
        <div className="space-y-4">
          {/* 이해도 분포 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">📊 이해도 분포</h4>
            <div className="space-y-2">
              {Object.entries(analysis.comprehensionLevels).map(([level, data]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm">
                    {level === 'advanced' ? '🟢 우수' :
                     level === 'proficient' ? '🟡 양호' :
                     level === 'developing' ? '🟠 보통' : '🔴 부족'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(data.count / responses.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm w-8">{data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 주요 키워드 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">🔑 주요 키워드</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.topKeywords.slice(0, 10).map((keyword) => (
                <span 
                  key={keyword.word}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {keyword.word} ({keyword.count})
                </span>
              ))}
            </div>
          </div>
          
          {/* 오개념 알림 */}
          {analysis.potentialMisconceptions.length > 0 && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-3 text-orange-800">⚠️ 주의 필요 개념</h4>
              <div className="space-y-2">
                {analysis.potentialMisconceptions.map((misconception, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-orange-800">
                      {misconception.concept}
                    </span>
                    <span className="text-orange-600 ml-2">
                      ({misconception.frequency}명)
                    </span>
                    <div className="text-orange-700 text-xs mt-1">
                      예: "{misconception.evidence[0]}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 최근 답변 스트림 */}
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">💬 최근 답변</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {responses.slice(-10).reverse().map((response) => (
            <div key={response.responseId} className="p-2 bg-gray-50 rounded text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">
                  {response.isAnonymous ? '익명' : response.studentName || '학생'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(response.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1">{response.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Phase 4: 고급 AI 기능 (3주) - **위험도 15%**

#### 4.1 후속 질문 추천 시스템 (1주)
```typescript
// ✅ 템플릿 기반 + AI 보강 추천
interface QuestionRecommendation {
  type: 'clarification' | 'extension' | 'remediation' | 'application';
  priority: 'high' | 'medium' | 'low';
  question: string;
  reasoning: string;
  targetStudents?: 'all' | 'struggling' | 'advanced';
}

const questionRecommendationService = {
  generateRecommendations: async (
    analysis: BasicResponseAnalysis,
    currentQuestion: string,
    educationContext: EducationContext
  ): Promise<QuestionRecommendation[]> => {
    const recommendations: QuestionRecommendation[] = [];
    
    // 1. 규칙 기반 추천 (안정적)
    if (analysis.comprehensionLevels.beginning.count > analysis.totalResponses * 0.3) {
      recommendations.push({
        type: 'remediation',
        priority: 'high',
        question: await generateSimplifiedQuestion(currentQuestion, educationContext),
        reasoning: '30% 이상의 학생이 기초 이해 부족으로 보임',
        targetStudents: 'struggling'
      });
    }
    
    if (analysis.comprehensionLevels.advanced.count > analysis.totalResponses * 0.5) {
      recommendations.push({
        type: 'extension',
        priority: 'medium',
        question: await generateAdvancedQuestion(currentQuestion, educationContext),
        reasoning: '절반 이상의 학생이 우수한 이해도를 보임',
        targetStudents: 'advanced'
      });
    }
    
    // 2. AI 기반 추천 (보조적)
    try {
      const aiRecommendations = await geminiAPI.analyze({
        prompt: `
        현재 질문: "${currentQuestion}"
        학생 답변 분석: ${JSON.stringify(analysis)}
        교육 수준: ${educationContext.level}
        과목: ${educationContext.subject}
        
        다음 질문 3개를 추천해주세요:
        1. 오개념 해결용 질문
        2. 심화 탐구용 질문  
        3. 실생활 적용 질문
        
        각 질문에 대해 추천 이유도 함께 제시해주세요.
        `,
        model: 'gemini-pro'
      });
      
      recommendations.push(...aiRecommendations);
      
    } catch (error) {
      console.warn('AI 추천 실패, 템플릿 기반 추천만 사용:', error);
    }
    
    return recommendations.slice(0, 5);  // 최대 5개
  }
};

// ✅ 추천 질문 UI
const QuestionRecommendationPanel = ({ currentAnalysis, currentQuestion }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await questionRecommendationService.generateRecommendations(
        currentAnalysis,
        currentQuestion,
        educationContext
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('추천 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">🤖 AI 추천 후속 질문</h4>
        <button 
          onClick={loadRecommendations}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {isLoading ? '분석 중...' : '추천 받기'}
        </button>
      </div>
      
      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  rec.type === 'remediation' ? 'bg-red-100 text-red-700' :
                  rec.type === 'extension' ? 'bg-green-100 text-green-700' :
                  rec.type === 'clarification' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {rec.type === 'remediation' ? '🔄 복습' :
                   rec.type === 'extension' ? '🚀 심화' :
                   rec.type === 'clarification' ? '💡 명확화' : '🌍 적용'}
                </span>
                <span className={`text-xs ${
                  rec.priority === 'high' ? 'text-red-600' :
                  rec.priority === 'medium' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {rec.priority === 'high' ? '높음' :
                   rec.priority === 'medium' ? '보통' : '낮음'}
                </span>
              </div>
              
              <p className="text-sm font-medium mb-2">{rec.question}</p>
              <p className="text-xs text-gray-600 mb-2">{rec.reasoning}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => useAsNextQuestion(rec.question)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                >
                  다음 질문으로 사용
                </button>
                <button 
                  onClick={() => addToQueue(rec.question)}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                >
                  대기열 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
```

#### 4.2 학생별 개별 피드백 (1주)
```typescript
// ✅ 기본적인 개별 분석
interface StudentInsight {
  studentId: string;
  responseCount: number;
  avgResponseLength: number;
  responseQuality: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  participationPattern: 'early_bird' | 'steady' | 'last_minute' | 'inconsistent';
  
  strengths: string[];
  improvementAreas: string[];
  
  // 간단한 맞춤 피드백
  personalizedFeedback: string;
  nextStepSuggestion: string;
}

const studentAnalysisService = {
  analyzeIndividualStudent: async (
    studentId: string,
    responses: StudentResponse[],
    questionContext: TeacherQuestion
  ): Promise<StudentInsight> => {
    const studentResponses = responses.filter(r => r.studentId === studentId);
    
    if (studentResponses.length === 0) {
      return {
        studentId,
        responseCount: 0,
        avgResponseLength: 0,
        responseQuality: 'needs_improvement',
        participationPattern: 'inconsistent',
        strengths: [],
        improvementAreas: ['수업 참여 필요'],
        personalizedFeedback: '아직 답변을 제출하지 않았습니다. 편하게 참여해보세요!',
        nextStepSuggestion: '간단한 키워드로라도 생각을 공유해보세요.'
      };
    }
    
    // 기본 통계 계산
    const avgLength = studentResponses.reduce((sum, r) => sum + r.text.length, 0) / studentResponses.length;
    const responsePattern = analyzeResponsePattern(studentResponses);
    
    // AI 기반 품질 분석 (선택적)
    let qualityAnalysis;
    try {
      qualityAnalysis = await geminiAPI.analyze({
        prompt: `
        교사 질문: "${questionContext.text}"
        학생 답변: "${studentResponses[0].text}"
        
        이 답변을 평가해주세요:
        1. 핵심 개념 이해도
        2. 설명의 명확성
        3. 창의적 사고
        4. 개선 필요 부분
        
        격려적이고 건설적인 피드백으로 응답해주세요.
        `,
        model: 'gemini-pro',
        temperature: 0.7
      });
    } catch (error) {
      // AI 실패 시 기본 피드백
      qualityAnalysis = generateBasicFeedback(studentResponses[0], avgLength);
    }
    
    return {
      studentId,
      responseCount: studentResponses.length,
      avgResponseLength: Math.round(avgLength),
      responseQuality: determineQuality(avgLength, qualityAnalysis),
      participationPattern: responsePattern,
      strengths: qualityAnalysis.strengths || ['적극적 참여'],
      improvementAreas: qualityAnalysis.improvements || [],
      personalizedFeedback: qualityAnalysis.feedback || '좋은 답변입니다!',
      nextStepSuggestion: qualityAnalysis.nextStep || '계속해서 적극적으로 참여해주세요.'
    };
  }
};
```

#### 4.3 실시간 학습 모니터링 (1주)
```tsx
// ✅ 교사용 실시간 학습 현황 대시보드
const LearningMonitoringDashboard = ({ session, activeQuestionId }) => {
  const { responses } = useRealTimeResponses(activeQuestionId);
  const { analysis } = useAIAnalysis(responses);
  const [alerts, setAlerts] = useState([]);
  
  // 실시간 알림 시스템
  useEffect(() => {
    if (analysis) {
      const newAlerts = [];
      
      // 참여율 저조 알림
      const participationRate = responses.length / (session.studentCount || 1);
      if (participationRate < 0.6) {
        newAlerts.push({
          type: 'warning',
          title: '참여율 저조',
          message: `현재 참여율 ${Math.round(participationRate * 100)}%. 참여 독려가 필요합니다.`,
          action: '참여 독려 메시지 전송'
        });
      }
      
      // 오개념 다수 발견
      if (analysis.potentialMisconceptions.length > 0) {
        const majorMisconception = analysis.potentialMisconceptions[0];
        if (majorMisconception.frequency > responses.length * 0.2) {
          newAlerts.push({
            type: 'error',
            title: '오개념 주의',
            message: `"${majorMisconception.concept}" 개념에 대한 혼동이 발견됩니다 (${majorMisconception.frequency}명)`,
            action: '개념 재설명 질문 추가'
          });
        }
      }
      
      // 우수 답변 발견
      if (analysis.comprehensionLevels.advanced.count > responses.length * 0.3) {
        newAlerts.push({
          type: 'success',
          title: '우수한 이해도',
          message: '많은 학생들이 깊이 있는 이해를 보여주고 있습니다.',
          action: '심화 질문으로 확장'
        });
      }
      
      setAlerts(newAlerts);
    }
  }, [analysis, responses.length]);
  
  return (
    <div className="space-y-4">
      {/* 실시간 알림 */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              alert.type === 'error' ? 'bg-red-50 border-red-400' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
                <button className="text-xs bg-white px-2 py-1 rounded border">
                  {alert.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 실시간 학습 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="참여율"
          value={`${Math.round((responses.length / (session.studentCount || 1)) * 100)}%`}
          trend={calculateParticipationTrend()}
          color="blue"
        />
        <MetricCard
          title="평균 답변 길이"
          value={`${analysis?.avgResponseLength || 0}자`}
          trend={calculateLengthTrend()}
          color="green"
        />
        <MetricCard
          title="이해도 평균"
          value={calculateComprehensionAverage(analysis)}
          trend={calculateComprehensionTrend()}
          color="purple"
        />
        <MetricCard
          title="응답 시간"
          value={`${calculateAvgResponseTime(responses)}분`}
          trend={calculateTimeTrend()}
          color="orange"
        />
      </div>
      
      {/* 학급 전체 이해도 히트맵 */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">🎯 학급 이해도 현황</h4>
        <ComprehensionHeatmap analysis={analysis} responses={responses} />
      </Card>
    </div>
  );
};

const MetricCard = ({ title, value, trend, color }) => (
  <div className={`p-3 bg-${color}-50 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`text-${trend > 0 ? 'green' : trend < 0 ? 'red' : 'gray'}-500`}>
        {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️'}
      </div>
    </div>
  </div>
);
```

### Phase 5: 통합 및 최적화 (2주) - **위험도 5%**

#### 5.1 성능 최적화 및 캐싱 (1주)
```typescript
// ✅ 효율적인 데이터 관리
const useOptimizedRealTimeData = (sessionId: string) => {
  const [data, setData] = useState({
    questions: [],
    responses: [],
    analysis: null
  });
  
  const [cache, setCache] = useState(new Map());
  
  useEffect(() => {
    // 배치 업데이트로 성능 최적화
    const batchUpdateHandler = debounce((updates) => {
      setData(prevData => ({
        ...prevData,
        ...updates
      }));
    }, 500);
    
    // Firebase 리스너
    const unsubscribeQuestions = onValue(
      ref(database, `teacherQuestions/${sessionId}`),
      (snapshot) => {
        const questions = Object.values(snapshot.val() || {});
        batchUpdateHandler({ questions });
      }
    );
    
    const unsubscribeResponses = onValue(
      ref(database, `studentResponses/${sessionId}`),
      (snapshot) => {
        const responses = Object.values(snapshot.val() || {});
        batchUpdateHandler({ responses });
        
        // AI 분석 캐싱
        const cacheKey = generateCacheKey(responses);
        if (!cache.has(cacheKey) && responses.length >= 5) {
          analyzeResponsesBatched(responses).then(analysis => {
            setCache(prev => new Map(prev).set(cacheKey, analysis));
            batchUpdateHandler({ analysis });
          });
        }
      }
    );
    
    return () => {
      unsubscribeQuestions();
      unsubscribeResponses();
    };
  }, [sessionId]);
  
  return data;
};

// ✅ AI 분석 배치 처리
const analyzeResponsesBatched = async (responses: StudentResponse[]) => {
  // 중복 분석 방지
  const analysisKey = `${responses.length}_${responses[responses.length - 1]?.createdAt}`;
  
  if (analysisCache.has(analysisKey)) {
    return analysisCache.get(analysisKey);
  }
  
  try {
    const analysis = await aiService.analyzeResponses(responses);
    analysisCache.set(analysisKey, analysis);
    
    // 캐시 크기 제한
    if (analysisCache.size > 50) {
      const firstKey = analysisCache.keys().next().value;
      analysisCache.delete(firstKey);
    }
    
    return analysis;
  } catch (error) {
    console.warn('배치 분석 실패:', error);
    return generateBasicStats(responses);
  }
};
```

#### 5.2 에러 처리 및 안정성 (1주)
```typescript
// ✅ 포괄적 에러 처리
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('교사 주도 모드 오류:', error);
      
      // 에러 리포팅 (선택적)
      if (process.env.NODE_ENV === 'production') {
        reportError(error, { feature: 'teacher_led_mode', ...errorInfo });
      }
      
      setHasError(true);
      setError(error);
    };
    
    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="font-medium text-red-800 mb-2">
          일시적 오류가 발생했습니다
        </h3>
        <p className="text-sm text-red-600 mb-4">
          교사 주도 모드에 문제가 발생했습니다. 기본 모드로 전환하거나 페이지를 새로고침해주세요.
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            새로고침
          </button>
          <button 
            onClick={() => switchToFreeQuestionMode()}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            기본 모드로 전환
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

// ✅ API 호출 안정성
const safeApiCall = async <T>(
  apiFunction: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> => {
  try {
    return await apiFunction();
  } catch (error) {
    console.warn(`${context} API 호출 실패, 폴백 사용:`, error);
    
    // 사용자에게 부드러운 알림
    toast.warning(`${context} 기능이 일시적으로 제한됩니다. 기본 기능은 정상 작동합니다.`);
    
    return fallback;
  }
};

// 사용 예시
const { analysis } = useAIAnalysis(responses, {
  onError: (error) => {
    console.warn('AI 분석 실패:', error);
    return generateBasicStats(responses);  // 폴백
  },
  retryCount: 2,
  timeout: 10000
});
```

---

## 📊 개발 리스크 및 완화 방안

### 높은 확실성 (95%+ 성공률)
```
✅ 기본 UI/UX 확장
- 기존 컴포넌트 패턴 재사용
- 조건부 렌더링으로 안전한 분기
- Firebase 스키마 독립적 확장

✅ 실시간 데이터 동기화  
- 기존 Firebase 리스너 패턴 활용
- 검증된 onValue 방식 사용
- 에러 처리 및 폴백 완비

✅ 기본 AI 분석
- 기존 Gemini API 확장
- 키워드 기반 안전한 분석
- AI 실패 시 통계 기반 폴백
```

### 중간 확실성 (80%+ 성공률)
```
⚠️ 고급 AI 추천 시스템
- Gemini API 응답 품질 의존적
- 프롬프트 엔지니어링 필요
- 대안: 템플릿 기반 추천

⚠️ 실시간 성능 최적화
- 대용량 데이터 처리 부하
- 동시 접속자 증가 시 이슈
- 대안: 배치 처리 및 캐싱

⚠️ 개별 학생 분석
- AI 분석 비용 및 시간
- 개인정보 처리 고려사항
- 대안: 집단 분석 우선
```

### 낮은 확실성 (60%+ 성공률)
```
🔴 실시간 감정 분석
- 텍스트만으로 감정 파악 한계
- 문화적/개인적 차이 고려 필요
- 대안: 참여 패턴 분석

🔴 완전 자동화 평가
- 주관식 답변의 정량화 어려움
- 교육적 맥락 이해 한계
- 대안: 보조 도구로만 활용
```

---

## 🎯 성공 지표 및 KPI

### 기술적 성공 지표
```
📊 안정성 지표
- 시스템 가용성: 99.5% 이상
- 에러율: 1% 미만  
- 평균 응답 시간: 500ms 이하
- 기존 기능 영향도: 0%

📊 성능 지표
- 동시 접속자: 기존 대비 동일 수준
- 데이터베이스 부하: 20% 이하 증가
- AI 분석 완료 시간: 10초 이하
- 캐시 적중률: 70% 이상
```

### 교육적 성공 지표
```
📈 사용성 지표
- 교사 모드 선택률: 20% 이상
- 기능 완주율: 80% 이상
- 사용자 만족도: 4.0/5.0 이상
- 재사용률: 60% 이상

📈 교육 효과 지표
- 학생 참여율: 기존 대비 30% 향상
- 답변 품질: 정성적 평가 개선
- 교사 피드백: "유용함" 70% 이상
- 수업 목표 달성도: 측정 가능한 개선
```

---

## 🚀 배포 계획

### 단계별 Feature Flag 배포

#### Week 1-2: 내부 개발팀 (5명)
```javascript
// .env.local
NEXT_PUBLIC_TEACHER_LED_MODE=true
NEXT_PUBLIC_AI_ANALYSIS=false
NEXT_PUBLIC_REALTIME_INSIGHTS=false
```

#### Week 3-4: 베타 교사 그룹 (20명)
```javascript
// Feature flag 조건부 활성화
const isInBetaGroup = BETA_TEACHER_IDS.includes(user.uid);
const showTeacherMode = process.env.NEXT_PUBLIC_TEACHER_LED_MODE === 'true' && isInBetaGroup;
```

#### Week 5-6: 제한적 공개 (전체의 30%)
```javascript
// 해시 기반 점진적 롤아웃
const showTeacherMode = hashUserId(user.uid) % 100 < 30;
```

#### Week 7-8: 전체 공개 (100%)
```javascript
// 전체 활성화
NEXT_PUBLIC_TEACHER_LED_MODE=true
NEXT_PUBLIC_AI_ANALYSIS=true
```

---

## 📋 최종 개발 체크리스트

### Phase 1: 기초 인프라 (2주) ✅
- [ ] Firebase 스키마 확장 및 보안 규칙 업데이트
- [ ] 기본 데이터 모델 (TeacherQuestion, StudentResponse) 구현
- [ ] 세션 생성 UI에 모드 선택 추가
- [ ] 기본 CRUD API 엔드포인트 구현
- [ ] 기존 시스템 호환성 테스트

### Phase 2: 기본 UI/UX (2주) ✅
- [ ] 교사 질문 관리 컴포넌트 개발
- [ ] 실시간 질문 전송 기능 구현
- [ ] 학생 답변 수집 UI 개발
- [ ] 기본 통계 대시보드 구현
- [ ] 모바일 반응형 디자인 적용

### Phase 3: 기본 AI 분석 (2주) ⚠️
- [ ] Gemini API 기반 답변 분석 구현
- [ ] 이해도 수준별 분류 시스템
- [ ] 키워드 추출 및 개념 식별
- [ ] 기본 오개념 감지 기능
- [ ] AI 실패 시 폴백 시스템 구현

### Phase 4: 고급 AI 기능 (3주) ⚠️
- [ ] 후속 질문 추천 시스템 구현
- [ ] 학생별 개별 분석 기능
- [ ] 실시간 학습 모니터링 대시보드
- [ ] 알림 및 인사이트 시스템
- [ ] 맞춤형 피드백 생성 기능

### Phase 5: 통합 및 최적화 (2주) ✅
- [ ] 성능 최적화 및 캐싱 구현
- [ ] 종합적 에러 처리 시스템
- [ ] 사용자 가이드 및 온보딩
- [ ] 최종 통합 테스트
- [ ] 배포 준비 및 모니터링 설정

---

## 💎 결론

### 개발 가능성 평가: **85% 확신**

#### ✅ **확실히 가능한 부분 (95%)**
- 기본 교사 주도 모드 구현
- 실시간 질문-답변 시스템
- 기초적 AI 분석 및 통계
- 안정적인 UI/UX 확장

#### ⚠️ **도전적이지만 달성 가능 (75%)**
- 고급 AI 추천 시스템
- 개별 학생 분석
- 실시간 학습 모니터링
- 성능 최적화

#### 🎯 **핵심 성공 요인**
1. **점진적 개발**: 각 Phase별 독립적 가치 제공
2. **안전한 폴백**: AI 실패 시에도 기본 기능 보장
3. **기존 호환성**: 현재 사용자에게 영향 없음
4. **실용적 범위**: 과도한 기능보다 안정성 우선

### 예상 개발 기간: **11주 (약 3개월)**

이 계획대로 진행하면 SmartQ가 **"질문 수집 도구"**에서 **"지능형 교육 상호작용 플랫폼"**으로 안전하게 진화할 수 있습니다.

**"기존의 안정성을 유지하면서도 혁신적인 교육 경험을 제공하는"** 진정한 스마트 교육 플랫폼이 완성될 것입니다! 🌟