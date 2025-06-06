// SmartQ - Gemini AI Integration with User API Keys
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SessionType, Subject, QuestionCluster, ActivityRecommendation, TermDefinition } from './utils';

// Subject-specific prompts for different educational contexts
const SUBJECT_PROMPTS = {
  [Subject.KOREAN]: {
    analyze: `다음은 국어 수업에서 학생들이 제출한 질문들입니다. 이 질문들을 독해력, 표현력, 문학적 이해력 관점에서 분석해주세요.
    학생들의 언어 사용 능력, 텍스트 이해 수준, 창의적 사고력을 파악하여 주요 키워드와 학습 포인트를 도출해주세요.`,
    suggest: `국어 수업에서 이 질문들을 활용할 수 있는 읽기, 쓰기, 말하기, 듣기 활동을 제안해주세요.
    문학 작품 감상, 토의·토론, 창작 활동 등 다양한 국어 교육 활동을 구체적으로 제시해주세요.`
  },
  [Subject.MATH]: {
    analyze: `다음은 수학 수업에서 학생들이 제출한 질문들입니다. 이 질문들에서 나타나는 수학적 개념 이해도, 
    문제해결 과정에서의 어려움, 수학적 오개념을 분석해주세요.`,
    suggest: `수학 문제해결 활동, 탐구 활동, 수학적 모델링 등으로 발전시킬 수 있는 구체적인 방법을 제안해주세요.
    학생들의 수학적 사고력을 기를 수 있는 활동을 중심으로 제시해주세요.`
  },
  [Subject.SCIENCE]: {
    analyze: `다음은 과학 수업에서 학생들이 제출한 질문들입니다. 과학적 탐구 능력, 가설 설정 수준, 
    관찰 및 실험에 대한 이해도를 분석해주세요.`,
    suggest: `실험 설계, 관찰 활동, 탐구 프로젝트 등으로 발전시킬 수 있는 구체적인 과학 활동을 제안해주세요.
    학생들의 과학적 사고력과 탐구 능력을 기를 수 있는 활동을 중심으로 제시해주세요.`
  },
  [Subject.SOCIAL]: {
    analyze: `다음은 사회 수업에서 학생들이 제출한 질문들입니다. 사회 현상에 대한 이해도, 
    비판적 사고력, 다양한 관점에서의 분석 능력을 파악해주세요.`,
    suggest: `사회 탐구 활동, 토의·토론, 프로젝트 학습 등으로 발전시킬 수 있는 구체적인 활동을 제안해주세요.
    학생들의 사회적 사고력과 시민 의식을 기를 수 있는 활동을 중심으로 제시해주세요.`
  },
  [Subject.ENGLISH]: {
    analyze: `다음은 영어 수업에서 학생들이 제출한 질문들입니다. 영어 의사소통 능력, 
    언어 구조에 대한 이해도, 문화적 맥락 파악 능력을 분석해주세요.`,
    suggest: `영어 의사소통 활동, 언어 게임, 문화 탐구 프로젝트 등으로 발전시킬 수 있는 구체적인 활동을 제안해주세요.
    학생들의 영어 실력과 국제적 소양을 기를 수 있는 활동을 중심으로 제시해주세요.`
  }
};

// Generic prompts for subjects not specifically defined
const GENERIC_PROMPTS = {
  analyze: `다음은 학생들이 수업에서 제출한 질문들입니다. 이 질문들에서 나타나는 학습자의 이해 수준, 
  관심사, 학습 요구를 분석해주세요.`,
  suggest: `이 질문들을 바탕으로 학생들의 학습을 촉진할 수 있는 구체적인 교육 활동을 제안해주세요.`
};

// Validate API key by making a test call
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Simple test prompt
    const result = await model.generateContent('Hello, this is a test. Please respond with "OK".');
    const response = result.response.text();
    
    return response.toLowerCase().includes('ok');
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

// Cluster questions based on similarity
export async function clusterQuestions(
  questions: string[], 
  userApiKey: string
): Promise<{ clusters: QuestionCluster[] }> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
다음은 학생들이 제출한 질문 목록입니다. 
이 질문들을 내용의 유사성에 따라 3-5개 그룹으로 묶고, 
각 그룹의 핵심 내용을 요약한 뒤, '이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 활동으로 연결할 수 있습니다.'라는 안내를 추가해주세요.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "clusters": [
    {
      "clusterId": "1",
      "clusterTitle": "그룹 요약 제목",
      "clusterSummary": "그룹에 포함된 질문들의 공통 주제 요약",
      "questions": ["질문1", "질문2", ...],
      "combinationGuide": "이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 활동으로 연결할 수 있습니다."
    }
  ]
}

질문 목록:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON parsing error:', e);
      return { clusters: [] };
    }
  } catch (error) {
    console.error('Gemini API call error:', error);
    return { clusters: [] };
  }
}

// Analyze questions for specific subjects and session types
export async function analyzeQuestionsMultiSubject(
  questions: string[],
  sessionType: SessionType,
  subjects: Subject[],
  userApiKey: string,
  keywords: string[] = []
): Promise<{
  clusteredQuestions: QuestionCluster[];
  recommendedActivities: ActivityRecommendation[];
  extractedTerms: TermDefinition[];
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // First, cluster the questions
    const clusteringResult = await clusterQuestions(questions, userApiKey);

    // Get subject-specific or generic prompts
    const subjectPrompts = subjects.map(subject => 
      SUBJECT_PROMPTS[subject] || GENERIC_PROMPTS
    );

    const sessionTypeContext = getSessionTypeContext(sessionType);
    const keywordsText = keywords.length > 0 ? `추가 키워드: ${keywords.join(', ')}` : '';

    const prompt = `
당신은 교육 전문가입니다. 다음 정보를 바탕으로 학생들의 질문을 분석하고 교육 활동을 제안해주세요.

세션 유형: ${sessionTypeContext}
교과목: ${subjects.map(s => getSubjectLabel(s)).join(', ')}
${keywordsText}

학생 질문 그룹 분석 결과:
${JSON.stringify(clusteringResult.clusters, null, 2)}

다음 형식으로 응답해주세요:
{
  "recommendedActivities": [
    {
      "activityId": "1",
      "activityTitle": "활동 제목",
      "activityType": "활동 유형 (예: 토의, 실험, 창작 등)",
      "subject": "${subjects[0]}", 
      "description": "활동 상세 설명",
      "materials": ["필요한 자료1", "필요한 자료2"],
      "timeRequired": "예상 소요 시간",
      "difficulty": "easy/medium/hard",
      "relatedQuestions": ["관련 질문들"],
      "reason": "이 활동을 추천하는 이유"
    }
  ],
  "extractedTerms": [
    {
      "term": "중요 용어",
      "description": "이 용어가 중요한 이유"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      const parsed = JSON.parse(jsonStr);
      return {
        clusteredQuestions: clusteringResult.clusters,
        recommendedActivities: parsed.recommendedActivities || [],
        extractedTerms: parsed.extractedTerms || []
      };
    } catch (e) {
      console.error('JSON parsing error:', e);
      return {
        clusteredQuestions: clusteringResult.clusters,
        recommendedActivities: [],
        extractedTerms: []
      };
    }
  } catch (error) {
    console.error('Multi-subject analysis error:', error);
    return {
      clusteredQuestions: [],
      recommendedActivities: [],
      extractedTerms: []
    };
  }
}

function getSessionTypeContext(sessionType: SessionType): string {
  switch (sessionType) {
    case SessionType.DEBATE:
      return '토론/논제 발굴 - 다양한 관점에서 토론할 수 있는 주제를 찾는 활동';
    case SessionType.INQUIRY:
      return '탐구 활동 - 궁금한 점을 스스로 조사하고 탐구하는 활동';
    case SessionType.PROBLEM:
      return '문제 해결 - 주어진 문제를 논리적으로 해결하는 활동';
    case SessionType.CREATIVE:
      return '창작 활동 - 상상력과 창의성을 발휘하는 활동';
    case SessionType.DISCUSSION:
      return '토의/의견 나누기 - 서로의 생각을 공유하고 의견을 나누는 활동';
    default:
      return '일반 Q&A - 자유로운 질문과 답변 활동';
  }
}

function getSubjectLabel(subject: Subject): string {
  const labels = {
    [Subject.KOREAN]: '국어',
    [Subject.MATH]: '수학',
    [Subject.SCIENCE]: '과학',
    [Subject.SOCIAL]: '사회',
    [Subject.ENGLISH]: '영어',
    [Subject.ART]: '미술',
    [Subject.MUSIC]: '음악',
    [Subject.PE]: '체육',
    [Subject.PRACTICAL]: '실과',
    [Subject.MORAL]: '도덕'
  };
  return labels[subject] || subject;
}