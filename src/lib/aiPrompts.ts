import { EducationLevel, AdultLearnerType } from '@/types/education';
import { SessionType, Subject } from './utils';

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

// 교과목별 특화 프롬프트 시스템
export function getSubjectSpecificPrompts(subjects: Subject[], sessionType: SessionType): string {
  if (subjects.length === 0) {
    return '일반적인 교육 관점에서 접근해주세요.';
  }

  const subjectPrompts = subjects.map(subject => getSubjectPrompt(subject)).join('\n\n');
  
  if (subjects.length === 1) {
    return `${getSubjectPrompt(subjects[0])}`;
  } else {
    return `다교과 통합 접근:
    
${subjectPrompts}

이들 교과를 통합적으로 연결하여 분석해주세요:
- 교과 간 연관성과 융합 가능성 탐색
- 통합 교육과정 관점에서의 학습 효과
- 실생활 문제 해결에서의 교과 융합 활용
- 창의적 사고와 비판적 사고 동시 함양`;
  }
}

function getSubjectPrompt(subject: Subject): string {
  const prompts = {
    [Subject.KOREAN]: `국어 교과 관점:
- 언어 사용 능력과 문학적 감수성 함양
- 비판적 읽기와 창의적 쓰기 능력 개발
- 의사소통 역량과 문화적 소양 확장
- 텍스트 분석과 논리적 사고 향상
- 국어의 아름다움과 창조적 표현 추구`,

    [Subject.MATH]: `수학 교과 관점:
- 논리적 사고와 문제 해결 능력 중심
- 수학적 개념과 원리의 체계적 이해
- 패턴 인식과 추론 능력 개발
- 실생활 연결성과 수학적 모델링
- 정확성과 논리성을 바탕으로 한 사고 훈련`,

    [Subject.SCIENCE]: `과학 교과 관점:
- 과학적 탐구 과정과 실험적 사고
- 자연 현상에 대한 호기심과 탐구심 자극
- 가설 설정, 실험 설계, 결과 분석 과정
- 과학적 증거와 논리적 추론 중시
- 일상생활 속 과학 원리 발견과 적용`,

    [Subject.SOCIAL]: `사회 교과 관점:
- 사회 현상에 대한 비판적 이해
- 역사적 사고와 시민 의식 함양
- 다양한 관점과 가치 존중
- 사회 문제 인식과 해결 방안 모색
- 공동체 의식과 참여적 시민성 개발`,

    [Subject.ENGLISH]: `영어 교과 관점:
- 글로벌 의사소통 능력 향상
- 영어권 문화와 다문화 이해
- 언어 학습 전략과 자기주도적 학습
- 실용적 영어 활용과 창의적 표현
- 국제적 감각과 세계 시민 의식`,

    [Subject.ART]: `미술 교과 관점:
- 시각적 사고와 창의적 표현력
- 미적 감수성과 예술적 소양 함양
- 다양한 매체와 기법을 통한 자기표현
- 문화 예술에 대한 이해와 감상 능력
- 상상력과 독창성을 바탕으로 한 창작`,

    [Subject.MUSIC]: `음악 교과 관점:
- 음악적 감수성과 표현 능력
- 소리와 리듬을 통한 감정 표현
- 음악 문화의 다양성과 역사적 이해
- 협력적 연주와 공감 능력 개발
- 창의적 음악 활동과 즐거운 참여`,

    [Subject.PE]: `체육 교과 관점:
- 신체 활동과 건강 관리 능력
- 협력과 경쟁을 통한 사회성 발달
- 운동 기능과 체력 향상
- 스포츠 정신과 페어플레이 정신
- 평생 스포츠 참여와 건강한 생활`,

    [Subject.PRACTICAL]: `실과 교과 관점:
- 실생활 문제 해결과 실용적 기술
- 창의적 만들기와 설계 능력
- 기술 활용과 정보 처리 능력
- 생활 자립과 진로 탐색
- 실무적 경험과 노작 활동의 가치`,

    [Subject.MORAL]: `도덕 교과 관점:
- 올바른 가치관과 윤리적 판단력
- 인성 교육과 품성 함양
- 자아 정체성과 도덕적 성찰
- 타인 배려와 공동체 의식
- 인권 존중과 정의로운 사회 추구`
  };

  return prompts[subject] || '해당 교과목의 특성을 고려하여 접근해주세요.';
}

// 다교과 질문 분석을 위한 특화 프롬프트
export function getMultiSubjectAnalysisPrompt(
  subjects: Subject[],
  sessionType: SessionType,
  learningGoals?: string
): string {
  const subjectList = subjects.map(s => getSubjectLabel(s)).join(', ');
  const subjectContext = getSubjectSpecificPrompts(subjects, sessionType);
  
  return `다교과 통합 분석 (${subjectList}):

${subjectContext}

${learningGoals ? `\n학습 목표: ${learningGoals}\n` : ''}

질문을 분석할 때 다음 사항들을 중점적으로 검토해주세요:

1. **교과 융합 관점**
   - 각 교과의 핵심 개념들이 어떻게 연결되는가?
   - 통합적 사고를 통해 얻을 수 있는 새로운 인사이트는?
   - 실생활 문제 해결에서의 융합 교육 효과는?

2. **학습자 중심 분석**
   - 각 교과별 학습자의 이해 수준과 관심도
   - 교과 간 연계를 통한 학습 동기 향상 방안
   - 개별 학습자의 강점 활용과 약점 보완 전략

3. **교육과정 연계성**
   - 교육과정 성취기준과의 연관성
   - 핵심역량 함양을 위한 교과 통합 방향
   - 평가와 피드백에서의 통합적 접근

4. **창의융합 활동 제안**
   - 교과 융합을 통한 창의적 문제 해결 활동
   - 프로젝트 기반 학습과 탐구 활동 아이디어
   - 실제적이고 의미 있는 학습 경험 설계

각 질문에 대해 단일 교과적 관점과 통합적 관점을 모두 제시하여, 교육적 가치를 극대화할 수 있는 방안을 제안해주세요.`;
}

// 교과목별 용어 정의를 위한 프롬프트
export function getSubjectTermDefinitionPrompt(subject: Subject, term: string): string {
  const subjectContext = getSubjectPrompt(subject);
  
  return `${subjectContext}

"${term}"에 대한 교과별 특화 정의:

1. **기본 개념 설명**
   - ${getSubjectLabel(subject)} 교과에서의 정확한 의미
   - 핵심 특징과 중요한 속성들
   - 관련 개념들과의 구분점

2. **교육과정 연계**
   - 해당 학습 단계에서의 중요성
   - 선수 학습과 후속 학습과의 연결
   - 성취기준과의 관련성

3. **실생활 연결**
   - 일상생활에서 만날 수 있는 예시
   - 실제 상황에서의 활용 방법
   - 사회적 의미와 가치

4. **학습 활동 제안**
   - 개념 이해를 돕는 구체적 활동
   - 체험과 탐구를 통한 학습 방법
   - 창의적 표현과 적용 아이디어

학습자가 단순히 암기하는 것이 아니라, 깊이 이해하고 의미 있게 활용할 수 있도록 설명해주세요.`;
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