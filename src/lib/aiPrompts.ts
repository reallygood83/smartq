import { EducationLevel, AdultLearnerType } from '@/types/education';
import { SessionType } from './utils';

interface PromptConfig {
  systemPrompt: string;
  questionAnalysisPrompt: string;
  topicRecommendationPrompt: string;
  termDefinitionPrompt: string;
}

export function getEducationLevelPrompts(
  level: EducationLevel, 
  adultLearnerType?: AdultLearnerType,
  sessionType?: SessionType
): PromptConfig {
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

  // 성인 교육의 경우 학습자 타입과 세션 타입별로 프롬프트 조정
  if (level === 'adult') {
    // 성인 학습자 타입별 프롬프트 조정
    if (adultLearnerType) {
      const learnerModifiers: Record<AdultLearnerType, PromptConfig> = {
        [AdultLearnerType.PROFESSIONAL]: {
          systemPrompt: `${prompts.systemPrompt} 직업 전문가들을 위해 실무 경험과 연결된 실용적 접근법을 사용하세요.`,
          questionAnalysisPrompt: '이 질문을 실무 관점에서 분석하고, 업무 효율성과 전문성 향상에 어떻게 연결될 수 있는지 설명해주세요.',
          topicRecommendationPrompt: '현업에서 바로 적용 가능한 실무 중심 주제를 추천해주세요. 업무 프로세스, 전문 기술, 업계 트렌드와 연관지어 주세요.',
          termDefinitionPrompt: '이 용어를 실무적 관점에서 설명하고, 실제 업무 상황에서의 활용 방법과 사례를 제시해주세요.'
        },
        [AdultLearnerType.RESKILLING]: {
          systemPrompt: `${prompts.systemPrompt} 새로운 분야로 전환하는 학습자들을 위해 기초부터 체계적으로 접근하세요.`,
          questionAnalysisPrompt: '이 질문을 재교육 관점에서 분석하고, 새로운 분야 적응에 필요한 핵심 개념들을 연결해주세요.',
          topicRecommendationPrompt: '새로운 분야 진입에 필요한 기초 역량과 실무 적응력을 기를 수 있는 주제를 추천해주세요.',
          termDefinitionPrompt: '이 용어를 새로운 분야 입문자가 이해할 수 있도록 기초부터 설명하고, 실무 적용 단계를 제시해주세요.'
        },
        [AdultLearnerType.UPSKILLING]: {
          systemPrompt: `${prompts.systemPrompt} 기존 역량을 확장하려는 학습자들을 위해 심화 학습과 응용에 초점을 맞추세요.`,
          questionAnalysisPrompt: '이 질문을 역량 강화 관점에서 분석하고, 기존 지식을 확장할 수 있는 방향을 제시해주세요.',
          topicRecommendationPrompt: '전문성 심화와 새로운 기술 습득을 통한 역량 확장에 도움이 되는 고급 주제를 추천해주세요.',
          termDefinitionPrompt: '이 용어의 고급 개념과 응용 분야를 설명하고, 전문성 향상에 어떻게 기여하는지 알려주세요.'
        },
        [AdultLearnerType.DEGREE_COMPLETION]: {
          systemPrompt: `${prompts.systemPrompt} 학위 과정을 이수하는 성인 학습자들을 위해 학술적 체계성과 실용성을 균형있게 제공하세요.`,
          questionAnalysisPrompt: '이 질문을 학술적 관점과 실무적 관점을 모두 고려하여 분석하고, 이론과 실제의 연결점을 찾아주세요.',
          topicRecommendationPrompt: '학술적 깊이와 실무 적용성을 모두 갖춘 주제를 추천해주세요. 연구와 실무 경험을 연결할 수 있는 내용으로 구성하세요.',
          termDefinitionPrompt: '이 용어의 학술적 정의와 실무적 적용을 모두 설명하고, 이론과 실제의 연관성을 명확히 해주세요.'
        },
        [AdultLearnerType.LIFELONG_LEARNING]: {
          systemPrompt: `${prompts.systemPrompt} 평생 학습자들을 위해 지적 호기심을 자극하고 지속적 성장을 지원하는 방식으로 접근하세요.`,
          questionAnalysisPrompt: '이 질문을 평생 학습 관점에서 분석하고, 지속적인 성장과 자기계발에 어떻게 기여할 수 있는지 설명해주세요.',
          topicRecommendationPrompt: '개인적 성장과 지적 만족을 제공하면서도 사회적 가치를 창출할 수 있는 주제를 추천해주세요.',
          termDefinitionPrompt: '이 용어를 다각적으로 설명하고, 개인의 성장과 사회 발전에 어떤 의미를 갖는지 폭넓게 알려주세요.'
        }
      };

      prompts = learnerModifiers[adultLearnerType];
    }

    // 성인 세션 타입별 추가 조정
    if (sessionType) {
      const sessionModifiers: Partial<Record<SessionType, string>> = {
        [SessionType.CORPORATE_TRAINING]: '기업 연수의 특성을 고려하여 조직 성과와 직결되는 실무 중심으로',
        [SessionType.UNIVERSITY_LECTURE]: '대학 강의 형식에 맞춰 학술적 엄밀성과 체계적 구조로',
        [SessionType.SEMINAR]: '세미나의 상호작용적 특성을 활용하여 참여형 토론을 유도하는 방식으로',
        [SessionType.WORKSHOP]: '워크샵의 실습 중심 특성을 살려 단계별 실행 가이드를 제공하는 방식으로',
        [SessionType.CONFERENCE]: '컨퍼런스의 지식 공유 목적에 맞춰 인사이트와 네트워킹을 촉진하는 방식으로',
        [SessionType.PROFESSIONAL_DEV]: '전문 개발의 목적에 맞춰 역량 강화와 경력 발전에 초점을 맞춘 방식으로',
        [SessionType.CERTIFICATION]: '자격증 과정의 특성을 고려하여 체계적이고 검증 가능한 방식으로',
        [SessionType.MENTORING]: '멘토링의 개인 맞춤형 특성을 살려 개별 성장에 초점을 맞춘 방식으로',
        [SessionType.NETWORKING]: '네트워킹의 관계 구축 목적에 맞춰 소통과 협업을 촉진하는 방식으로'
      };

      const modifier = sessionModifiers[sessionType];
      if (modifier) {
        prompts = {
          ...prompts,
          systemPrompt: `${prompts.systemPrompt} ${modifier} 내용을 전달해주세요.`
        };
      }
    }
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

// 성인 교육 특화 분석 프롬프트 생성
export function getAdultEducationAnalysisPrompt(
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType,
  industryFocus?: string,
  difficultyLevel?: string
): string {
  const basePrompt = `성인 학습자를 위한 ${getSessionTypeLabel(sessionType)} 세션에서의 질문 분석을 수행합니다.`;
  
  const learnerTypeContext = getLearnerTypeContext(adultLearnerType);
  const sessionTypeContext = getAdultSessionTypeContext(sessionType);
  const industryContext = industryFocus ? `\n산업 분야: ${industryFocus}에 특화된 관점에서 분석` : '';
  const difficultyContext = difficultyLevel ? `\n난이도 수준: ${getDifficultyLevelContext(difficultyLevel)}` : '';

  return `${basePrompt}\n\n${learnerTypeContext}\n${sessionTypeContext}${industryContext}${difficultyContext}

참여자들의 질문을 분석할 때 다음 사항들을 중점적으로 고려하세요:
1. 실무 적용 가능성과 즉시 활용도
2. 참여자들의 경험 수준과 배경 지식
3. 조직 또는 개인의 성과 향상에 미치는 영향
4. 학습 전이 효과와 지속성
5. 협업과 네트워킹 기회 창출 가능성`;
}

// 교수자-학습자 양방향 분석 프롬프트
export function getBidirectionalAnalysisPrompt(
  perspective: 'instructor' | 'learner',
  sessionType: SessionType,
  adultLearnerType: AdultLearnerType
): string {
  const sessionLabel = getSessionTypeLabel(sessionType);
  const learnerTypeLabel = getAdultLearnerTypeLabel(adultLearnerType);

  if (perspective === 'instructor') {
    return `진행자/강사 관점에서의 ${sessionLabel} 분석:

${learnerTypeLabel} 대상 세션에서 다음 요소들을 분석해주세요:
1. 교육 효과성 평가
   - 학습 목표 달성도
   - 참여자 몰입도와 상호작용
   - 실무 적용 가능성

2. 세션 운영 개선점
   - 진행 방식의 적절성
   - 시간 배분과 구성
   - 참여자 반응과 피드백

3. 후속 활동 제안
   - 심화 학습 방향
   - 실무 적용 가이드
   - 지속적 성장 지원 방안

진행자가 다음 세션을 더 효과적으로 운영할 수 있도록 구체적이고 실행 가능한 개선 방안을 제시해주세요.`;
  } else {
    return `학습자/참여자 관점에서의 ${sessionLabel} 분석:

${learnerTypeLabel}으로서 이 세션에서 얻을 수 있는 가치를 분석해주세요:
1. 개인적 성장과 발전
   - 새로운 지식과 기술 습득
   - 기존 역량의 확장과 심화
   - 자기계발 목표와의 연관성

2. 실무 적용과 활용
   - 현재 업무에 직접 적용 가능한 내용
   - 경력 발전에 도움이 되는 요소
   - 조직 내 영향력 확대 방안

3. 네트워킹과 협업 기회
   - 동료 학습자와의 연결점
   - 전문적 네트워크 확장
   - 상호 학습과 지식 공유

참여자가 세션 후에도 지속적으로 성장할 수 있는 맞춤형 학습 로드맵을 제시해주세요.`;
  }
}

// 실시간 교육 품질 모니터링 프롬프트
export function getQualityMonitoringPrompt(
  sessionType: SessionType,
  participantCount: string,
  duration: string
): string {
  return `실시간 교육 품질 모니터링 분석:

세션 정보:
- 세션 유형: ${getSessionTypeLabel(sessionType)}
- 참여 인원: ${participantCount}
- 진행 시간: ${duration}

다음 지표들을 실시간으로 모니터링하고 분석해주세요:

1. 참여도 지표
   - 질문 제출 빈도와 품질
   - 상호작용 수준과 적극성
   - 집중도와 몰입 상태

2. 학습 효과 지표
   - 핵심 개념 이해도
   - 실무 연결성 인식도
   - 학습 목표 달성 진행률

3. 만족도 지표
   - 콘텐츠 적절성
   - 진행 방식 만족도
   - 기대치 충족 정도

4. 개선 신호 감지
   - 이해 부족 신호
   - 관심도 저하 징후
   - 진행 속도 부적절성

실시간 조정이 필요한 부분과 즉시 적용 가능한 개선 방안을 제시해주세요.`;
}

// Helper functions
function getLearnerTypeContext(adultLearnerType: AdultLearnerType): string {
  const contexts = {
    [AdultLearnerType.PROFESSIONAL]: '직업 전문가들을 대상으로 하는 세션입니다. 실무 경험이 풍부하며 즉시 적용 가능한 실용적 지식을 선호합니다.',
    [AdultLearnerType.RESKILLING]: '새로운 분야로 전환하는 학습자들을 대상으로 합니다. 기초부터 체계적인 학습과 실무 적응력 개발이 필요합니다.',
    [AdultLearnerType.UPSKILLING]: '기존 역량을 확장하려는 학습자들입니다. 심화 학습과 새로운 기술 습득을 통한 전문성 향상을 목표로 합니다.',
    [AdultLearnerType.DEGREE_COMPLETION]: '학위 과정을 이수하는 성인 학습자들입니다. 학술적 체계성과 실무 적용성의 균형을 중시합니다.',
    [AdultLearnerType.LIFELONG_LEARNING]: '평생 학습을 추구하는 학습자들입니다. 지적 호기심과 지속적 성장에 대한 열망이 높습니다.'
  };
  return contexts[adultLearnerType];
}

function getAdultSessionTypeContext(sessionType: SessionType): string {
  const contexts = {
    [SessionType.CORPORATE_TRAINING]: '기업 연수는 조직의 성과 향상과 직결되는 실무 중심 교육입니다.',
    [SessionType.UNIVERSITY_LECTURE]: '대학 강의는 학술적 엄밀성과 체계적 지식 전달에 중점을 둡니다.',
    [SessionType.SEMINAR]: '세미나는 전문 주제에 대한 심화 학습과 상호 토론을 중시합니다.',
    [SessionType.WORKSHOP]: '워크샵은 실습과 체험을 통한 직접적 기술 습득에 초점을 맞춥니다.',
    [SessionType.CONFERENCE]: '컨퍼런스는 전문가들의 지식 공유와 네트워킹을 촉진합니다.',
    [SessionType.PROFESSIONAL_DEV]: '전문 개발은 개인의 역량 강화와 경력 발전을 목표로 합니다.',
    [SessionType.CERTIFICATION]: '자격증 과정은 체계적이고 검증 가능한 역량 인증에 중점을 둡니다.',
    [SessionType.MENTORING]: '멘토링은 개인 맞춤형 성장과 경험 전수에 집중합니다.',
    [SessionType.NETWORKING]: '네트워킹은 전문적 관계 구축과 협업 기회 창출을 지향합니다.'
  };
  return contexts[sessionType] || '';
}

function getDifficultyLevelContext(level: string): string {
  const contexts = {
    'beginner': '초급 수준으로 기초 개념과 입문 내용 중심',
    'intermediate': '중급 수준으로 실무 적용과 심화 학습 균형',
    'advanced': '고급 수준으로 전문성과 숙련도 향상 중심',
    'expert': '전문가 수준으로 최신 트렌드와 혁신적 접근법 포함'
  };
  return contexts[level] || '';
}

function getSessionTypeLabel(sessionType: SessionType): string {
  // This would normally import from utils, but for now we'll define basic labels
  const labels = {
    [SessionType.CORPORATE_TRAINING]: '기업 연수',
    [SessionType.UNIVERSITY_LECTURE]: '대학 강의',
    [SessionType.SEMINAR]: '세미나',
    [SessionType.WORKSHOP]: '워크샵',
    [SessionType.CONFERENCE]: '컨퍼런스',
    [SessionType.PROFESSIONAL_DEV]: '전문 개발',
    [SessionType.CERTIFICATION]: '자격증 과정',
    [SessionType.MENTORING]: '멘토링',
    [SessionType.NETWORKING]: '네트워킹'
  };
  return labels[sessionType] || sessionType;
}

function getAdultLearnerTypeLabel(adultLearnerType: AdultLearnerType): string {
  const labels = {
    [AdultLearnerType.PROFESSIONAL]: '직업 전문가',
    [AdultLearnerType.RESKILLING]: '재교육/전환 학습자',
    [AdultLearnerType.UPSKILLING]: '역량 강화 학습자',
    [AdultLearnerType.DEGREE_COMPLETION]: '학위 완성 학습자',
    [AdultLearnerType.LIFELONG_LEARNING]: '평생 학습자'
  };
  return labels[adultLearnerType];
}