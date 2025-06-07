import { EducationLevel, AdultSessionType } from '@/types/education';

interface PromptConfig {
  systemPrompt: string;
  questionAnalysisPrompt: string;
  topicRecommendationPrompt: string;
  termDefinitionPrompt: string;
}

export function getEducationLevelPrompts(level: EducationLevel, sessionType?: AdultSessionType): PromptConfig {
  const basePrompts: Record<EducationLevel, PromptConfig> = {
    elementary: {
      systemPrompt: '당신은 초등학생들을 위한 친절하고 재미있는 교육 도우미입니다. 쉬운 언어와 많은 예시를 사용하세요.',
      questionAnalysisPrompt: '이 질문을 초등학생이 이해하기 쉽게 분석해주세요. 어려운 단어는 쉽게 풀어서 설명하고, 재미있는 비유를 사용하세요.',
      topicRecommendationPrompt: '초등학생들이 흥미롭게 토론할 수 있는 주제를 추천해주세요. 일상생활과 연결된 쉬운 주제로 제안하세요.',
      termDefinitionPrompt: '이 용어를 초등학생이 이해할 수 있도록 아주 쉽게 설명해주세요. 그림으로 설명하듯이 구체적인 예시를 들어주세요.'
    },
    middle: {
      systemPrompt: '당신은 중학생들의 호기심을 자극하는 교육 멘토입니다. 탐구심을 키우고 비판적 사고를 시작할 수 있도록 도와주세요.',
      questionAnalysisPrompt: '이 질문을 중학생 수준에서 분석하고, 더 깊이 탐구할 수 있는 방향을 제시해주세요.',
      topicRecommendationPrompt: '중학생들이 다양한 관점에서 토론할 수 있는 주제를 추천해주세요. 사회 이슈나 과학적 호기심을 자극하는 주제가 좋습니다.',
      termDefinitionPrompt: '이 용어를 중학생이 이해할 수 있도록 설명하고, 왜 중요한지 설명해주세요.'
    },
    high: {
      systemPrompt: '당신은 고등학생들의 학술적 성장을 돕는 교육 전문가입니다. 논리적 사고와 심화 학습을 지원하세요.',
      questionAnalysisPrompt: '이 질문을 고등학생 수준에서 학술적으로 분석하고, 관련된 이론이나 개념을 연결해주세요.',
      topicRecommendationPrompt: '고등학생들이 비판적으로 사고하고 논증할 수 있는 심화 토론 주제를 추천해주세요.',
      termDefinitionPrompt: '이 용어의 학술적 정의와 함께 관련 개념들을 체계적으로 설명해주세요.'
    },
    university: {
      systemPrompt: '당신은 대학생들을 위한 학술 연구 조언자입니다. 전문적이고 학술적인 관점에서 지원하세요.',
      questionAnalysisPrompt: '이 질문을 학술적 관점에서 분석하고, 관련 연구나 이론적 프레임워크를 제시해주세요.',
      topicRecommendationPrompt: '대학생들이 연구하고 논문으로 발전시킬 수 있는 학술적 주제를 추천해주세요.',
      termDefinitionPrompt: '이 용어의 학술적 정의와 다양한 학파의 해석, 최신 연구 동향을 포함해 설명해주세요.'
    },
    adult: {
      systemPrompt: '당신은 성인 학습자를 위한 실무 중심 교육 전문가입니다. 실용적이고 즉시 적용 가능한 지식을 제공하세요.',
      questionAnalysisPrompt: '이 질문을 실무적 관점에서 분석하고, 현업에서의 적용 방안을 함께 제시해주세요.',
      topicRecommendationPrompt: '실무에서 바로 활용할 수 있는 토론 주제를 추천해주세요. 업무 효율성, 팀워크, 리더십 등과 연관지어 주세요.',
      termDefinitionPrompt: '이 용어를 실무적 관점에서 설명하고, 실제 업무에서 어떻게 활용되는지 사례를 들어 설명해주세요.'
    }
  };

  let prompts = basePrompts[level];

  // 성인 교육의 경우 세션 타입별로 프롬프트 조정
  if (level === 'adult' && sessionType) {
    const sessionModifiers: Record<AdultSessionType, string> = {
      lecture: '강의 형식에 맞춰 체계적이고 구조화된 방식으로',
      seminar: '세미나의 상호작용적 특성을 고려하여 토론을 유도하는 방식으로',
      workshop: '실습과 체험을 중심으로 단계별 가이드를 제공하는 방식으로',
      training: '스킬 개발과 역량 강화에 초점을 맞춰 실천 가능한 방식으로',
      conference: '다양한 배경의 참가자를 고려하여 포괄적이고 통찰력 있는 방식으로'
    };

    const modifier = sessionModifiers[sessionType];
    prompts = {
      ...prompts,
      systemPrompt: `${prompts.systemPrompt} ${modifier} 내용을 전달해주세요.`
    };
  }

  return prompts;
}

// 용어 변경을 위한 매핑
export const TERMINOLOGY_MAP = {
  student: {
    elementary: '학생',
    middle: '학생',
    high: '학생',
    university: '학생',
    adult: '참여자'
  },
  teacher: {
    elementary: '선생님',
    middle: '선생님',
    high: '선생님',
    university: '교수님',
    adult: '진행자'
  },
  class: {
    elementary: '수업',
    middle: '수업',
    high: '수업',
    university: '강의',
    adult: '세션'
  },
  homework: {
    elementary: '숙제',
    middle: '과제',
    high: '과제',
    university: '과제',
    adult: '실습 과제'
  },
  grade: {
    elementary: '학년',
    middle: '학년',
    high: '학년',
    university: '학년',
    adult: '경력'
  }
};

export function getTerminology(term: keyof typeof TERMINOLOGY_MAP, level: EducationLevel): string {
  return TERMINOLOGY_MAP[term][level] || term;
}