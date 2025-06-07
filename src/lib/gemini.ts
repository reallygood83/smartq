// SmartQ - Gemini AI Integration with User API Keys
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SessionType, Subject, QuestionCluster, ActivityRecommendation, TermDefinition, getSubjectLabel } from './utils';
import { EducationLevel, AdultLearnerType } from '@/types/education';
import { 
  getEducationLevelPrompts, 
  getTerminology, 
  getAdultEducationAnalysisPrompt,
  getBidirectionalAnalysisPrompt,
  getQualityMonitoringPrompt,
  getSubjectSpecificPrompts,
  getMultiSubjectAnalysisPrompt,
  getSubjectTermDefinitionPrompt
} from './aiPrompts';

// Helper function to get subject and session type context
function getSessionTypeContext(sessionType: SessionType): string {
  const contexts = {
    [SessionType.DEBATE]: '토론/논제 발굴 - 다양한 관점에서 토론할 수 있는 주제를 찾는 활동',
    [SessionType.INQUIRY]: '탐구 활동 - 궁금한 점을 스스로 조사하고 탐구하는 활동',
    [SessionType.PROBLEM]: '문제 해결 - 주어진 문제를 논리적으로 해결하는 활동',
    [SessionType.CREATIVE]: '창작 활동 - 상상력과 창의성을 발휘하는 활동',
    [SessionType.DISCUSSION]: '토의/의견 나누기 - 서로의 생각을 공유하고 의견을 나누는 활동',
    [SessionType.GENERAL]: '일반 Q&A - 자유로운 질문과 답변 활동',
    // 성인 교육 세션 타입
    [SessionType.CORPORATE_TRAINING]: '기업 연수 - 조직 성과 향상과 실무 역량 강화를 위한 전문 교육',
    [SessionType.UNIVERSITY_LECTURE]: '대학 강의 - 학술적 엄밀성과 체계적 지식 전달을 중심으로 한 고등 교육',
    [SessionType.SEMINAR]: '세미나 - 전문 주제에 대한 심화 학습과 상호 토론을 통한 지식 공유',
    [SessionType.WORKSHOP]: '워크샵 - 실습과 체험을 통한 직접적 기술 습득과 실무 적용',
    [SessionType.CONFERENCE]: '컨퍼런스 - 전문가들의 지식 공유와 네트워킹을 통한 업계 동향 파악',
    [SessionType.PROFESSIONAL_DEV]: '전문 개발 - 개인의 역량 강화와 경력 발전을 위한 맞춤형 교육',
    [SessionType.CERTIFICATION]: '자격증 과정 - 체계적이고 검증 가능한 전문 역량 인증을 위한 교육',
    [SessionType.MENTORING]: '멘토링 - 개인 맞춤형 성장과 경험 전수를 통한 전문성 개발',
    [SessionType.NETWORKING]: '네트워킹 - 전문적 관계 구축과 협업 기회 창출을 위한 소통 활동'
  };
  return contexts[sessionType] || '일반적인 학습 활동';
}


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
  userApiKey: string,
  educationLevel: EducationLevel = 'elementary',
  adultLearnerType?: AdultLearnerType,
  sessionType?: SessionType
): Promise<{ clusters: QuestionCluster[] }> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const levelPrompts = getEducationLevelPrompts(educationLevel, adultLearnerType, sessionType);
    const terminology = getTerminology('student', educationLevel);
    
    let analysisContext = levelPrompts.questionAnalysisPrompt;
    
    // 성인 교육의 경우 특별한 지침 추가
    if (educationLevel === 'adult') {
      analysisContext += `

**중요 지침:**
- 초등학교, 중학교, 고등학교 교육 관점이 아닌 성인 실무 관점에서 분석
- "학생", "선생님" 대신 "참여자", "진행자" 용어 사용
- 실무 적용과 전문성 향상 관점에서 질문 그룹화
- 경험 기반 학습과 동료 학습 기회 고려`;
    }

    const prompt = `
${levelPrompts.systemPrompt}

다음은 ${terminology}들이 제출한 질문 목록입니다. 
이 질문들을 내용의 유사성에 따라 3-5개 그룹으로 묶고, 
각 그룹의 핵심 내용을 요약한 뒤, '이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 활동으로 연결할 수 있습니다.'라는 안내를 추가해주세요.

${analysisContext}

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
  keywords: string[] = [],
  educationLevel: EducationLevel = 'elementary',
  adultLearnerType?: AdultLearnerType,
  industryFocus?: string,
  difficultyLevel?: string
): Promise<{
  clusteredQuestions: QuestionCluster[];
  recommendedActivities: ActivityRecommendation[];
  extractedTerms: TermDefinition[];
  conceptDefinitions: TermDefinition[];
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // First, cluster the questions
    const clusteringResult = await clusterQuestions(questions, userApiKey, educationLevel, adultLearnerType, sessionType)
    
    // Extract key concepts from questions
    const conceptDefinitions = await extractConceptsFromQuestions(questions, sessionType, subjects, userApiKey, educationLevel, adultLearnerType);

    // 성인 교육 여부에 따라 완전히 다른 프롬프트 사용
    const sessionTypeContext = getSessionTypeContext(sessionType);
    const keywordsText = keywords.length > 0 ? `추가 키워드: ${keywords.join(', ')}` : '';
    const levelPrompts = getEducationLevelPrompts(educationLevel, adultLearnerType, sessionType);
    const terminology = getTerminology('student', educationLevel);

    let prompt: string;

    if (educationLevel === 'adult') {
      // 성인 교육 전용 프롬프트 - 교과목 개념을 완전히 배제
      prompt = `
${levelPrompts.systemPrompt}

당신은 성인 교육 전문가입니다. 다음 정보를 바탕으로 ${terminology}들의 질문을 분석하고 실무 중심 활동을 제안해주세요.

${levelPrompts.topicRecommendationPrompt}

세션 유형: ${sessionTypeContext}
${industryFocus ? `산업 분야: ${industryFocus}` : ''}
${difficultyLevel ? `난이도 수준: ${difficultyLevel}` : ''}
${keywordsText}

${terminology} 질문 그룹 분석 결과:
${JSON.stringify(clusteringResult.clusters, null, 2)}

**중요한 지침:**
- 초등학교, 중학교, 고등학교 교육 활동은 절대 추천하지 마세요
- "학생", "선생님", "수업", "숙제", "시험"과 같은 학교 관련 용어 사용 금지
- 대신 "참여자", "진행자", "세션", "실습 과제", "평가"와 같은 성인 교육 용어 사용
- 놀이나 게임 중심 활동보다는 실무 적용과 전문성 향상에 초점
- 케이스 스터디, 시뮬레이션, 워크샵, 프로젝트 기반 학습 활동 위주로 추천

다음 형식으로 응답해주세요:
{
  "recommendedActivities": [
    {
      "activityId": "1",
      "activityTitle": "실무 중심 활동 제목",
      "activityType": "실무 활동 유형 (예: 케이스 스터디, 시뮬레이션, 워크샵, 프로젝트 등)",
      "subject": "professional_skill", 
      "description": "성인 참여자를 위한 실무 중심 활동 상세 설명",
      "materials": ["실무 자료1", "실무 자료2"],
      "timeRequired": "예상 소요 시간",
      "difficulty": "beginner/intermediate/advanced",
      "relatedQuestions": ["관련 질문들"],
      "reason": "실무 적용 관점에서 이 활동을 추천하는 이유"
    }
  ],
  "extractedTerms": [
    {
      "term": "실무 중요 용어",
      "description": "실무 관점에서 이 용어가 중요한 이유"
    }
  ]
}`;
    } else {
      // 일반 교육용 다교과 통합 분석 프롬프트
      const multiSubjectAnalysisPrompt = getMultiSubjectAnalysisPrompt(subjects, sessionType);
      
      prompt = `
${levelPrompts.systemPrompt}

${multiSubjectAnalysisPrompt}

세션 유형: ${sessionTypeContext}
${keywordsText}

${terminology} 질문 그룹 분석 결과:
${JSON.stringify(clusteringResult.clusters, null, 2)}

다음 형식으로 응답해주세요:
{
  "recommendedActivities": [
    {
      "activityId": "1",
      "activityTitle": "활동 제목",
      "activityType": "활동 유형 (예: 토의, 실험, 창작, 융합 탐구 등)",
      "subject": "${subjects[0] || 'general'}", 
      "description": "교과 융합 관점을 포함한 활동 상세 설명",
      "materials": ["필요한 자료1", "필요한 자료2"],
      "timeRequired": "예상 소요 시간",
      "difficulty": "easy/medium/hard",
      "relatedQuestions": ["관련 질문들"],
      "reason": "교과 융합 교육 관점에서 이 활동을 추천하는 이유"
    }
  ],
  "extractedTerms": [
    {
      "term": "중요 용어",
      "description": "교과별 관점에서 이 용어가 중요한 이유"
    }
  ]
}`;
    }

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
        extractedTerms: parsed.extractedTerms || [],
        conceptDefinitions: conceptDefinitions
      };
    } catch (e) {
      console.error('JSON parsing error:', e);
      return {
        clusteredQuestions: clusteringResult.clusters,
        recommendedActivities: [],
        extractedTerms: [],
        conceptDefinitions: conceptDefinitions
      };
    }
  } catch (error) {
    console.error('Multi-subject analysis error:', error);
    return {
      clusteredQuestions: [],
      recommendedActivities: [],
      extractedTerms: [],
      conceptDefinitions: []
    };
  }
}

// Extract and define key concepts from student questions
export async function extractConceptsFromQuestions(
  questions: string[],
  sessionType: SessionType,
  subjects: Subject[],
  userApiKey: string,
  educationLevel: EducationLevel = 'elementary',
  adultLearnerType?: AdultLearnerType
): Promise<TermDefinition[]> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const subjectContext = subjects.map(s => getSubjectLabel(s)).join(', ');
    const sessionContext = getSessionTypeContext(sessionType);
    const levelPrompts = getEducationLevelPrompts(educationLevel, adultLearnerType, sessionType);
    const terminology = getTerminology('student', educationLevel);

    // 교과목별 특화 용어 정의 프롬프트 생성
    const subjectSpecificContext = subjects.length > 0 
      ? getSubjectSpecificPrompts(subjects, sessionType)
      : '일반적인 교육 관점에서 접근해주세요.';

    const prompt = `
${levelPrompts.systemPrompt}

${subjectSpecificContext}

다음 ${terminology}들의 질문에서 중요한 개념들을 찾아내고, ${educationLevel === 'adult' ? '실무에 적용할 수 있도록' : '이해하기 쉽게'} 설명해주세요.

${levelPrompts.termDefinitionPrompt}

세션 유형: ${sessionContext}
교과목: ${subjectContext}

${terminology} 질문들:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

다음 기준으로 중요한 개념들을 추출하고 설명해주세요:

${educationLevel === 'adult' ? `
1. 실무에서 자주 사용되는 전문 용어나 개념
2. 업무 효율성과 직접 연관된 핵심 개념
3. 팀워크와 협업에 필요한 기본 개념
4. 참여자들이 궁금해하는 실무 원리

각 개념은 다음과 같이 설명해주세요:
- 실무 경험과 연결된 실용적 설명
- 구체적인 업무 상황 예시 활용
- 바로 적용 가능한 방법론 포함
- 참여자의 전문성 향상에 도움이 되는 방식` : `
1. ${terminology}들이 어려워할 수 있는 전문 용어나 개념
2. 교과서에 나오는 핵심 개념
3. 학습에 꼭 필요한 기초 개념
4. ${terminology}들이 궁금해하는 현상이나 원리

각 개념은 다음과 같이 설명해주세요:
- ${educationLevel} 수준에 맞는 적절한 언어 사용
- 일상생활 예시나 비유 활용
- 2-3문장으로 간단명료하게
- ${terminology}의 호기심을 자극하는 방식`}

응답 형식 (JSON):
{
  "concepts": [
    {
      "term": "개념 이름",
      "definition": "쉬운 설명 (초등학생 수준)",
      "example": "일상생활 예시",
      "subject": "${subjects[0] || 'general'}",
      "difficulty": "easy/medium"
    }
  ]
}

최대 5개의 가장 중요한 개념만 선별해주세요.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Convert to TermDefinition format
      return parsed.concepts?.map((concept: any, index: number) => ({
        definitionId: `concept-${Date.now()}-${index}`,
        term: concept.term,
        definition: concept.definition,
        description: concept.example,
        studentGroup: educationLevel
        // sessionId는 undefined 대신 생략 - 나중에 호출하는 곳에서 설정
      })) || [];
    } catch (e) {
      console.error('JSON parsing error:', e);
      return [];
    }
  } catch (error) {
    console.error('Concept extraction error:', error);
    return [];
  }
}


// Adult education specialized analysis
export async function analyzeAdultEducationSession(
  questions: string[],
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType,
  userApiKey: string,
  industryFocus?: string,
  difficultyLevel?: string,
  participantCount?: string,
  duration?: string
): Promise<{
  instructorAnalysis: any;
  learnerAnalysis: any;
  qualityMetrics: any;
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Get specialized prompts
    const instructorPrompt = getBidirectionalAnalysisPrompt('instructor', sessionType, adultLearnerType);
    const learnerPrompt = getBidirectionalAnalysisPrompt('learner', sessionType, adultLearnerType);
    const qualityPrompt = getQualityMonitoringPrompt(sessionType, participantCount || '미지정', duration || '미지정');
    const analysisPrompt = getAdultEducationAnalysisPrompt(sessionType, adultLearnerType, industryFocus, difficultyLevel);

    // Instructor perspective analysis
    const instructorResult = await model.generateContent(`
      ${instructorPrompt}
      
      ${analysisPrompt}
      
      참여자 질문들:
      ${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
      
      JSON 형식으로 응답해주세요:
      {
        "sessionEffectiveness": {
          "goalAchievement": "목표 달성도 평가",
          "participantEngagement": "참여자 몰입도",
          "practicalApplication": "실무 적용 가능성"
        },
        "improvementAreas": ["개선점1", "개선점2"],
        "nextSteps": ["후속 활동1", "후속 활동2"]
      }
    `);

    // Learner perspective analysis  
    const learnerResult = await model.generateContent(`
      ${learnerPrompt}
      
      ${analysisPrompt}
      
      참여자 질문들:
      ${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
      
      JSON 형식으로 응답해주세요:
      {
        "personalGrowth": {
          "knowledgeGained": "습득한 지식",
          "skillImprovement": "향상된 기술",
          "careerRelevance": "경력 연관성"
        },
        "practicalValue": {
          "immediateApplication": "즉시 적용 가능한 내용",
          "longTermBenefit": "장기적 효익"
        },
        "learningPath": ["추천 학습 경로1", "추천 학습 경로2"]
      }
    `);

    // Quality monitoring analysis
    const qualityResult = await model.generateContent(`
      ${qualityPrompt}
      
      참여자 질문들:
      ${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
      
      JSON 형식으로 응답해주세요:
      {
        "participationMetrics": {
          "questionQuality": "질문 품질 점수 (1-10)",
          "engagementLevel": "참여도 수준 (1-10)",
          "comprehensionRate": "이해도 (1-10)"
        },
        "satisfactionIndicators": {
          "contentRelevance": "콘텐츠 적절성 (1-10)",
          "deliveryMethod": "진행 방식 만족도 (1-10)"
        },
        "recommendations": ["즉시 개선 방안1", "즉시 개선 방안2"]
      }
    `);

    return {
      instructorAnalysis: parseJsonResponse(instructorResult.response.text()),
      learnerAnalysis: parseJsonResponse(learnerResult.response.text()),
      qualityMetrics: parseJsonResponse(qualityResult.response.text())
    };

  } catch (error) {
    console.error('Adult education analysis error:', error);
    return {
      instructorAnalysis: null,
      learnerAnalysis: null,
      qualityMetrics: null
    };
  }
}

// Helper function to parse JSON responses
function parseJsonResponse(text: string): any {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parsing error:', e);
    return null;
  }
}

// 실무 중심 질문 분석 시스템
export async function analyzePracticalQuestions(
  questions: string[],
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType,
  userApiKey: string,
  industryFocus?: string,
  difficultyLevel?: string
): Promise<{
  practicalInsights: any;
  immediateActions: string[];
  skillGaps: string[];
  businessImpact: any;
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const analysisPrompt = getAdultEducationAnalysisPrompt(sessionType, adultLearnerType, industryFocus, difficultyLevel);
    const terminology = getTerminology('student', 'adult');

    const prompt = `
${analysisPrompt}

다음 ${terminology}들의 질문을 실무 중심 관점에서 심층 분석해주세요.

**분석 목표:**
1. 실무 적용 가능성과 즉시 활용도 평가
2. 현재 업무에서의 활용 방안 도출
3. 기술/지식 격차 (Skill Gap) 식별
4. 비즈니스 임팩트 및 ROI 예측

**질문 목록:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**분석 기준:**
- 실무 연관성: 실제 업무 상황과의 연결성
- 적용 긴급도: 즉시 적용 가능한 정도
- 학습 전이: 다른 업무 영역으로의 확장 가능성
- 조직 기여도: 팀/조직 성과에 미치는 영향

JSON 형식으로 응답해주세요:
{
  "practicalInsights": {
    "keyFindings": ["핵심 발견사항1", "핵심 발견사항2"],
    "realWorldApplication": "실무 적용 종합 평가",
    "learningPriority": "학습 우선순위 분석",
    "transferability": "학습 전이 가능성"
  },
  "immediateActions": [
    "즉시 실행 가능한 액션1",
    "즉시 실행 가능한 액션2"
  ],
  "skillGaps": [
    "식별된 기술 격차1",
    "식별된 기술 격차2"
  ],
  "businessImpact": {
    "productivityGain": "생산성 향상 예상 효과",
    "qualityImprovement": "업무 품질 개선 예상",
    "collaborationBenefit": "협업 효과 예상",
    "roi": "투자 대비 효과 예측"
  }
}
`;

    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text()) || {
      practicalInsights: { keyFindings: [], realWorldApplication: "", learningPriority: "", transferability: "" },
      immediateActions: [],
      skillGaps: [],
      businessImpact: { productivityGain: "", qualityImprovement: "", collaborationBenefit: "", roi: "" }
    };

  } catch (error) {
    console.error('Practical question analysis error:', error);
    return {
      practicalInsights: { keyFindings: [], realWorldApplication: "", learningPriority: "", transferability: "" },
      immediateActions: [],
      skillGaps: [],
      businessImpact: { productivityGain: "", qualityImprovement: "", collaborationBenefit: "", roi: "" }
    };
  }
}

// 경험 기반 학습 활동 추천 엔진
export async function recommendExperienceBasedActivities(
  questions: string[],
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType,
  userApiKey: string,
  participantCount?: string,
  duration?: string,
  industryFocus?: string
): Promise<{
  activities: any[];
  scaffolding: any;
  assessment: any;
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const terminology = getTerminology('student', 'adult');
    const sessionContext = getSessionTypeContext(sessionType);

    const prompt = `
당신은 성인 교육 전문가입니다. ${terminology}들의 질문을 바탕으로 경험 기반 학습 활동을 설계해주세요.

**세션 정보:**
- 세션 유형: ${sessionContext}
- 학습자 유형: ${adultLearnerType}
- 참여자 수: ${participantCount || '미지정'}
- 진행 시간: ${duration || '미지정'}
${industryFocus ? `- 산업 분야: ${industryFocus}` : ''}

**${terminology} 질문들:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**설계 원칙:**
1. 성인 학습자의 경험을 활용한 학습 설계
2. 문제 중심 학습 (Problem-Based Learning) 접근
3. 실무 시뮬레이션과 케이스 스터디 활용
4. 동료 학습과 지식 공유 촉진
5. 즉시 적용 가능한 실행 계획 수립

JSON 형식으로 응답해주세요:
{
  "activities": [
    {
      "activityId": "act_001",
      "title": "활동 제목",
      "type": "case_study|simulation|workshop|discussion|project",
      "description": "활동 상세 설명",
      "experienceLevel": "개인 경험 활용 방법",
      "practicalConnection": "실무 연결점",
      "timeRequired": "소요 시간",
      "groupSize": "권장 그룹 크기",
      "materials": ["필요 자료1", "필요 자료2"],
      "facilitationTips": "진행 팁",
      "expectedOutcome": "기대 성과"
    }
  ],
  "scaffolding": {
    "preparationPhase": "사전 준비 단계 가이드",
    "executionPhase": "실행 단계 가이드", 
    "reflectionPhase": "성찰 단계 가이드",
    "supportStrategies": ["학습 지원 전략1", "학습 지원 전략2"]
  },
  "assessment": {
    "formativeAssessment": "형성 평가 방법",
    "summativeAssessment": "총합 평가 방법",
    "selfAssessment": "자기 평가 도구",
    "peerAssessment": "동료 평가 방법"
  }
}
`;

    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text()) || {
      activities: [],
      scaffolding: { preparationPhase: "", executionPhase: "", reflectionPhase: "", supportStrategies: [] },
      assessment: { formativeAssessment: "", summativeAssessment: "", selfAssessment: "", peerAssessment: "" }
    };

  } catch (error) {
    console.error('Experience-based activity recommendation error:', error);
    return {
      activities: [],
      scaffolding: { preparationPhase: "", executionPhase: "", reflectionPhase: "", supportStrategies: [] },
      assessment: { formativeAssessment: "", summativeAssessment: "", selfAssessment: "", peerAssessment: "" }
    };
  }
}

// 전문성 수준별 맞춤 설명 생성기
export async function generateExpertiseLevelExplanations(
  concepts: string[],
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType,
  userApiKey: string,
  industryFocus?: string
): Promise<{
  explanations: any[];
  progressionPath: any;
  resources: any[];
}> {
  try {
    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const terminology = getTerminology('student', 'adult');
    const levelDescriptions = {
      beginner: '초급자 - 기초 개념과 입문 수준의 실무 적용',
      intermediate: '중급자 - 기본 경험을 바탕으로 한 심화 학습',
      advanced: '고급자 - 전문성을 바탕으로 한 응용과 최적화',
      expert: '전문가 - 혁신과 지식 창조 수준의 고도화'
    };

    const prompt = `
당신은 성인 교육 전문가입니다. 다음 개념들을 ${levelDescriptions[targetLevel]} 수준에 맞춰 설명해주세요.

**대상 정보:**
- 전문성 수준: ${levelDescriptions[targetLevel]}
- 학습자 유형: ${adultLearnerType}
- 세션 유형: ${sessionType}
${industryFocus ? `- 산업 분야: ${industryFocus}` : ''}

**설명할 개념들:**
${concepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**설명 원칙:**
1. 대상자의 경험 수준에 맞는 적절한 깊이
2. 실무 상황과 연결된 구체적 예시
3. 단계별 학습 진행 경로 제시
4. 즉시 적용 가능한 실행 방법
5. 추가 학습 자료 및 리소스 안내

JSON 형식으로 응답해주세요:
{
  "explanations": [
    {
      "concept": "개념명",
      "basicDefinition": "기본 정의",
      "levelAppropriateExplanation": "수준별 맞춤 설명",
      "practicalExample": "실무 적용 예시",
      "commonMistakes": "흔한 실수나 주의점",
      "keyTakeaways": ["핵심 포인트1", "핵심 포인트2"],
      "applicationScenarios": ["적용 시나리오1", "적용 시나리오2"]
    }
  ],
  "progressionPath": {
    "currentLevel": "${targetLevel}",
    "nextLevel": "다음 단계 학습 목표",
    "prerequisites": ["필요한 사전 지식1", "필요한 사전 지식2"],
    "milestones": ["성취 지표1", "성취 지표2"],
    "timeEstimate": "예상 학습 기간"
  },
  "resources": [
    {
      "type": "book|article|course|tool|community",
      "title": "리소스 제목",
      "description": "리소스 설명",
      "difficulty": "적합한 난이도",
      "format": "형태 (온라인/오프라인/혼합)",
      "estimatedTime": "예상 소요 시간"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text()) || {
      explanations: [],
      progressionPath: { currentLevel: targetLevel, nextLevel: "", prerequisites: [], milestones: [], timeEstimate: "" },
      resources: []
    };

  } catch (error) {
    console.error('Expertise level explanation generation error:', error);
    return {
      explanations: [],
      progressionPath: { currentLevel: targetLevel, nextLevel: "", prerequisites: [], milestones: [], timeEstimate: "" },
      resources: []
    };
  }
}