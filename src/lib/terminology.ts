/**
 * SmartQ 스마트 용어 변환 시스템
 * 교육 레벨별 맞춤형 용어 변환 및 톤 조정
 */

import { EducationLevel, AdultLearnerType, getEducationLevelConfig, ADULT_LEARNER_CONFIGS } from '@/types/education'

// 기본 용어 매핑 인터페이스
export interface TerminologyMapping {
  // 인칭 대명사
  participant: string      // 참여자/학생/연수생
  instructor: string       // 교사/강사/진행자
  class: string           // 수업/세션/강의
  
  // 활동 관련
  activity: string        // 활동/실습/워크숍
  question: string        // 질문/문의/이슈
  answer: string          // 답변/해답/솔루션
  discussion: string      // 토론/토의/논의
  
  // 평가 및 피드백
  evaluation: string      // 평가/검토/분석
  feedback: string        // 피드백/조언/개선사항
  result: string          // 결과/성과/산출물
  
  // 학습 관련
  learning: string        // 학습/교육/연수
  knowledge: string       // 지식/정보/인사이트
  skill: string           // 기능/스킬/역량
  
  // 조직 관련
  group: string           // 모둠/팀/그룹
  assignment: string      // 과제/미션/프로젝트
  goal: string            // 목표/타겟/KPI
}

// 톤 및 문체 설정
export interface ToneSettings {
  formality: 'informal' | 'semi-formal' | 'formal' | 'professional'
  politeness: 'casual' | 'polite' | 'respectful' | 'honorific'
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  encouragement: 'playful' | 'supportive' | 'motivational' | 'professional'
}

// 레벨별 용어 매핑
const TERMINOLOGY_MAPPINGS: Record<EducationLevel, TerminologyMapping> = {
  [EducationLevel.ELEMENTARY]: {
    participant: '친구들',
    instructor: '선생님',
    class: '수업',
    activity: '놀이',
    question: '궁금한 것',
    answer: '답',
    discussion: '이야기 나누기',
    evaluation: '확인하기',
    feedback: '칭찬과 격려',
    result: '결과',
    learning: '배움',
    knowledge: '새로운 것',
    skill: '능력',
    group: '모둠',
    assignment: '숙제',
    goal: '목표'
  },
  
  [EducationLevel.MIDDLE]: {
    participant: '학생',
    instructor: '선생님',
    class: '수업',
    activity: '활동',
    question: '질문',
    answer: '답변',
    discussion: '토론',
    evaluation: '평가',
    feedback: '피드백',
    result: '결과',
    learning: '학습',
    knowledge: '지식',
    skill: '기능',
    group: '모둠',
    assignment: '과제',
    goal: '목표'
  },
  
  [EducationLevel.HIGH]: {
    participant: '학생',
    instructor: '교사',
    class: '수업',
    activity: '활동',
    question: '질문',
    answer: '답변',
    discussion: '토론',
    evaluation: '평가',
    feedback: '피드백',
    result: '결과',
    learning: '학습',
    knowledge: '지식',
    skill: '역량',
    group: '팀',
    assignment: '과제',
    goal: '목표'
  },
  
  [EducationLevel.UNIVERSITY]: {
    participant: '학생',
    instructor: '교수',
    class: '강의',
    activity: '실습',
    question: '질문',
    answer: '답변',
    discussion: '토론',
    evaluation: '평가',
    feedback: '피드백',
    result: '결과',
    learning: '학습',
    knowledge: '지식',
    skill: '역량',
    group: '팀',
    assignment: '과제',
    goal: '목표'
  },
  
  [EducationLevel.ADULT]: {
    participant: '참여자',
    instructor: '진행자',
    class: '세션',
    activity: '워크숍',
    question: '문의',
    answer: '솔루션',
    discussion: '논의',
    evaluation: '분석',
    feedback: '개선사항',
    result: '성과',
    learning: '연수',
    knowledge: '인사이트',
    skill: '스킬',
    group: '그룹',
    assignment: '프로젝트',
    goal: 'KPI'
  }
}

// 성인 학습자 타입별 세부 용어 매핑
const ADULT_LEARNER_TERMINOLOGY: Record<AdultLearnerType, Partial<TerminologyMapping>> = {
  [AdultLearnerType.PROFESSIONAL]: {
    participant: '동료',
    class: '미팅',
    activity: '브레인스토밍',
    goal: 'OKR',
    assignment: '액션 아이템'
  },
  
  [AdultLearnerType.RESKILLING]: {
    participant: '전환자',
    learning: '재교육',
    skill: '신규 역량',
    goal: '전환 목표'
  },
  
  [AdultLearnerType.UPSKILLING]: {
    participant: '수강생',
    learning: '역량 강화',
    skill: '심화 스킬',
    goal: '성장 목표'
  },
  
  [AdultLearnerType.DEGREE_COMPLETION]: {
    participant: '학습자',
    instructor: '교수',
    class: '강의',
    assignment: '학점 과제'
  },
  
  [AdultLearnerType.LIFELONG_LEARNING]: {
    participant: '학습자',
    learning: '평생학습',
    knowledge: '교양',
    goal: '자기계발 목표'
  }
}

// 레벨별 톤 설정
const TONE_SETTINGS: Record<EducationLevel, ToneSettings> = {
  [EducationLevel.ELEMENTARY]: {
    formality: 'informal',
    politeness: 'casual',
    complexity: 'simple',
    encouragement: 'playful'
  },
  
  [EducationLevel.MIDDLE]: {
    formality: 'informal',
    politeness: 'polite',
    complexity: 'simple',
    encouragement: 'supportive'
  },
  
  [EducationLevel.HIGH]: {
    formality: 'semi-formal',
    politeness: 'polite',
    complexity: 'moderate',
    encouragement: 'supportive'
  },
  
  [EducationLevel.UNIVERSITY]: {
    formality: 'semi-formal',
    politeness: 'respectful',
    complexity: 'complex',
    encouragement: 'motivational'
  },
  
  [EducationLevel.ADULT]: {
    formality: 'professional',
    politeness: 'respectful',
    complexity: 'expert',
    encouragement: 'professional'
  }
}

// 문장 패턴 및 문체 변환
const SENTENCE_PATTERNS = {
  // 존댓말/반말 패턴
  politeEndings: {
    casual: ['야', '지', '어', '아'],
    polite: ['요', '어요', '아요'],
    respectful: ['습니다', '입니다', '니다'],
    honorific: ['시겠습니다', '하시겠습니다', '되시겠습니다']
  },
  
  // 격려 표현
  encouragement: {
    playful: ['잘했어!', '대단해!', '멋져!', '신기하다!'],
    supportive: ['잘하고 있어요', '좋은 생각이에요', '계속해보세요'],
    motivational: ['훌륭합니다', '인상적입니다', '발전하고 있습니다'],
    professional: ['우수한 성과입니다', '효과적인 접근입니다', '가치 있는 기여입니다']
  },
  
  // 질문 유도 패턴
  questionPrompts: {
    simple: ['어떻게 생각해?', '왜 그럴까?', '뭐가 궁금해?'],
    moderate: ['어떻게 생각하나요?', '이유가 뭘까요?', '더 알고 싶은 게 있나요?'],
    complex: ['어떤 관점에서 접근하시겠습니까?', '근거는 무엇입니까?', '추가 분석이 필요한 부분은?'],
    expert: ['전략적 접근 방안은?', '핵심 이슈는 무엇인가요?', '최적화 포인트는?']
  }
}

/**
 * 교육 레벨에 맞는 용어 변환
 */
export function getTerminology(
  term: keyof TerminologyMapping, 
  level: EducationLevel, 
  adultType?: AdultLearnerType
): string {
  const baseTerminology = TERMINOLOGY_MAPPINGS[level]
  
  // 성인 교육이고 세부 타입이 있는 경우 오버라이드
  if (level === EducationLevel.ADULT && adultType && ADULT_LEARNER_TERMINOLOGY[adultType][term]) {
    return ADULT_LEARNER_TERMINOLOGY[adultType][term]!
  }
  
  return baseTerminology[term]
}

/**
 * 레벨에 맞는 톤 설정 반환
 */
export function getToneSettings(level: EducationLevel): ToneSettings {
  return TONE_SETTINGS[level]
}

/**
 * 문장을 교육 레벨에 맞게 변환
 */
export function adaptSentenceForLevel(
  sentence: string, 
  level: EducationLevel, 
  adultType?: AdultLearnerType
): string {
  const tone = getToneSettings(level)
  let adapted = sentence
  
  // 용어 치환
  Object.keys(TERMINOLOGY_MAPPINGS[EducationLevel.ADULT]).forEach(key => {
    const termKey = key as keyof TerminologyMapping
    const adultTerm = TERMINOLOGY_MAPPINGS[EducationLevel.ADULT][termKey]
    const levelTerm = getTerminology(termKey, level, adultType)
    
    if (adultTerm !== levelTerm) {
      adapted = adapted.replace(new RegExp(adultTerm, 'g'), levelTerm)
    }
  })
  
  return adapted
}

/**
 * 레벨에 맞는 격려 표현 생성
 */
export function generateEncouragement(level: EducationLevel): string {
  const tone = getToneSettings(level)
  const expressions = SENTENCE_PATTERNS.encouragement[tone.encouragement]
  return expressions[Math.floor(Math.random() * expressions.length)]
}

/**
 * 레벨에 맞는 질문 유도 문구 생성
 */
export function generateQuestionPrompt(level: EducationLevel): string {
  const tone = getToneSettings(level)
  const prompts = SENTENCE_PATTERNS.questionPrompts[tone.complexity]
  return prompts[Math.floor(Math.random() * prompts.length)]
}

/**
 * AI 프롬프트에 레벨별 톤 지침 추가
 */
export function enhancePromptWithTone(
  basePrompt: string, 
  level: EducationLevel, 
  adultType?: AdultLearnerType
): string {
  const tone = getToneSettings(level)
  const terminology = getTerminology('participant', level, adultType)
  const instructorTerm = getTerminology('instructor', level, adultType)
  
  const toneGuidance = `
[톤 및 언어 지침]
- 대상: ${terminology}에게 맞는 ${tone.formality} 문체
- 복잡도: ${tone.complexity} 수준
- 격려 스타일: ${tone.encouragement}
- ${terminology}를 "${terminology}", ${instructorTerm}를 "${instructorTerm}"로 지칭
- 교육 레벨: ${getEducationLevelConfig(level).displayName}
${adultType ? `- 성인 학습자 유형: ${ADULT_LEARNER_CONFIGS[adultType].displayName}` : ''}

[원본 요청]
${basePrompt}
`
  
  return toneGuidance
}

/**
 * 컨텍스트 기반 스마트 용어 추천
 */
export function getContextualTerms(
  context: 'session' | 'question' | 'feedback' | 'evaluation',
  level: EducationLevel,
  adultType?: AdultLearnerType
): Record<string, string> {
  const baseTerms = {
    participant: getTerminology('participant', level, adultType),
    instructor: getTerminology('instructor', level, adultType),
    class: getTerminology('class', level, adultType),
  }
  
  switch (context) {
    case 'session':
      return {
        ...baseTerms,
        activity: getTerminology('activity', level, adultType),
        goal: getTerminology('goal', level, adultType)
      }
    
    case 'question':
      return {
        ...baseTerms,
        question: getTerminology('question', level, adultType),
        answer: getTerminology('answer', level, adultType)
      }
    
    case 'feedback':
      return {
        ...baseTerms,
        feedback: getTerminology('feedback', level, adultType),
        encouragement: generateEncouragement(level)
      }
    
    case 'evaluation':
      return {
        ...baseTerms,
        evaluation: getTerminology('evaluation', level, adultType),
        result: getTerminology('result', level, adultType)
      }
    
    default:
      return baseTerms
  }
}

/**
 * 텍스트의 난이도 자동 조정
 */
export function adjustTextComplexity(
  text: string,
  targetLevel: EducationLevel
): string {
  const tone = getToneSettings(targetLevel)
  
  // 복잡한 단어를 단순한 단어로 치환
  const complexityReplacements = {
    simple: {
      '구현': '만들기',
      '최적화': '더 좋게 만들기',
      '분석': '살펴보기',
      '효율성': '빠르고 좋음',
      '전략': '방법'
    },
    moderate: {
      '구현': '만들기',
      '최적화': '개선',
      '효율성': '효과'
    },
    complex: {
      // 대학 수준은 원본 유지
    },
    expert: {
      // 전문가 수준은 더 전문적 용어 사용
      '만들기': '구현',
      '개선': '최적화',
      '방법': '전략'
    }
  }
  
  let adjusted = text
  const replacements = complexityReplacements[tone.complexity]
  
  Object.entries(replacements).forEach(([complex, simple]) => {
    adjusted = adjusted.replace(new RegExp(complex, 'g'), simple)
  })
  
  return adjusted
}

// 2024 교육 트렌드 반영된 용어
export const TRENDING_TERMS_2024 = {
  [EducationLevel.ADULT]: {
    'hybrid_learning': '하이브리드 학습',
    'micro_credentials': '마이크로 자격증',
    'skills_based_hiring': '스킬 기반 채용',
    'continuous_learning': '지속 학습',
    'ai_assisted_learning': 'AI 학습 지원',
    'personalized_path': '개인 맞춤 경로',
    'competency_mapping': '역량 매핑',
    'learning_analytics': '학습 분석'
  }
}