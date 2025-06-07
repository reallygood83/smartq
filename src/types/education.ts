// SmartQ - Education Level Types and Configurations
// 2024년 최신 교육 트렌드를 반영한 교육 레벨 시스템

export enum EducationLevel {
  ELEMENTARY = 'elementary',     // 초등교육 (6-12세)
  MIDDLE = 'middle',            // 중등교육 (13-15세)  
  HIGH = 'high',                // 고등교육 (16-18세)
  UNIVERSITY = 'university',     // 대학교육 (19-25세)
  ADULT = 'adult'               // 성인교육 (25세+)
}

export enum AdultLearnerType {
  PROFESSIONAL = 'professional',     // 직장인 재교육
  RESKILLING = 'reskilling',         // 재숙련 교육
  UPSKILLING = 'upskilling',         // 역량 강화
  DEGREE_COMPLETION = 'degree_completion', // 학위 완성
  LIFELONG_LEARNING = 'lifelong_learning' // 평생학습
}

export interface EducationLevelConfig {
  level: EducationLevel;
  displayName: string;
  description: string;
  ageRange: string;
  characteristics: string[];
  
  // UI/UX 설정
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontSizeScale: number;
    iconSize: 'small' | 'medium' | 'large';
    borderRadius: number;
  };
  
  // 용어 설정
  terminology: {
    student: string;
    teacher: string;
    class: string;
    homework: string;
    grade: string;
  };
  
  // AI 프롬프트 수정자
  aiPromptModifiers: {
    languageLevel: 'simple' | 'intermediate' | 'advanced' | 'professional';
    explanationStyle: 'friendly' | 'formal' | 'academic' | 'business';
    exampleTypes: string[];
    focusAreas: string[];
  };
  
  // 세션 타입 가중치 (선호도)
  sessionTypeWeights: Record<string, number>;
}

// 2024년 교육 트렌드를 반영한 레벨별 설정
export const EDUCATION_LEVEL_CONFIGS: Record<EducationLevel, EducationLevelConfig> = {
  [EducationLevel.ELEMENTARY]: {
    level: EducationLevel.ELEMENTARY,
    displayName: '초등교육',
    description: '호기심과 창의성을 키우는 기초 학습',
    ageRange: '6-12세',
    characteristics: ['호기심 중심', '놀이 학습', '기초 개념', '창의성 발달'],
    
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4', 
      backgroundColor: '#FFF8E1',
      fontSizeScale: 1.2,
      iconSize: 'large',
      borderRadius: 16
    },
    
    terminology: {
      student: '학생',
      teacher: '선생님', 
      class: '수업',
      homework: '숙제',
      grade: '학년'
    },
    
    aiPromptModifiers: {
      languageLevel: 'simple',
      explanationStyle: 'friendly',
      exampleTypes: ['일상생활', '놀이', '동화', '만화'],
      focusAreas: ['기초개념', '흥미유발', '체험활동', '창의사고']
    },
    
    sessionTypeWeights: {
      'creative': 1.5,
      'inquiry': 1.3,
      'discussion': 1.2,
      'debate': 0.8,
      'problem': 1.0
    }
  },

  [EducationLevel.MIDDLE]: {
    level: EducationLevel.MIDDLE,
    displayName: '중등교육',
    description: '논리적 사고와 자기주도학습 발달',
    ageRange: '13-15세',
    characteristics: ['논리적 사고', '자기주도성', '또래 학습', '진로 탐색'],
    
    theme: {
      primaryColor: '#6C5CE7',
      secondaryColor: '#A29BFE',
      backgroundColor: '#F8F9FF',
      fontSizeScale: 1.1,
      iconSize: 'medium',
      borderRadius: 12
    },
    
    terminology: {
      student: '학생',
      teacher: '선생님',
      class: '수업', 
      homework: '과제',
      grade: '학년'
    },
    
    aiPromptModifiers: {
      languageLevel: 'intermediate',
      explanationStyle: 'friendly',
      exampleTypes: ['또래관계', '학교생활', '게임', '유튜브'],
      focusAreas: ['논리적사고', '토론능력', '자기표현', '협력학습']
    },
    
    sessionTypeWeights: {
      'debate': 1.4,
      'discussion': 1.3,
      'inquiry': 1.2,
      'problem': 1.1,
      'creative': 1.0
    }
  },

  [EducationLevel.HIGH]: {
    level: EducationLevel.HIGH,
    displayName: '고등교육',
    description: '비판적 사고와 진로 준비 중심',
    ageRange: '16-18세', 
    characteristics: ['비판적 사고', '입시 준비', '진로 설계', '심화 학습'],
    
    theme: {
      primaryColor: '#0984E3',
      secondaryColor: '#74B9FF',
      backgroundColor: '#F0F8FF',
      fontSizeScale: 1.0,
      iconSize: 'medium',
      borderRadius: 10
    },
    
    terminology: {
      student: '학생',
      teacher: '교사',
      class: '수업',
      homework: '과제',
      grade: '학년'
    },
    
    aiPromptModifiers: {
      languageLevel: 'advanced',
      explanationStyle: 'academic',
      exampleTypes: ['시사', '진로', '대학입시', '사회문제'],
      focusAreas: ['비판적사고', '분석능력', '논증력', '진로탐색']
    },
    
    sessionTypeWeights: {
      'debate': 1.5,
      'problem': 1.4,
      'inquiry': 1.3,
      'discussion': 1.1,
      'creative': 0.9
    }
  },

  [EducationLevel.UNIVERSITY]: {
    level: EducationLevel.UNIVERSITY,
    displayName: '대학교육',
    description: '전문성과 연구 역량 개발',
    ageRange: '19-25세',
    characteristics: ['전문 지식', '연구 능력', '네트워킹', '취업 준비'],
    
    theme: {
      primaryColor: '#00B894',
      secondaryColor: '#55EFC4',
      backgroundColor: '#F0FFF0',
      fontSizeScale: 0.95,
      iconSize: 'medium',
      borderRadius: 8
    },
    
    terminology: {
      student: '학생',
      teacher: '교수님',
      class: '강의',
      homework: '과제',
      grade: '학년'
    },
    
    aiPromptModifiers: {
      languageLevel: 'advanced',
      explanationStyle: 'academic',
      exampleTypes: ['전공분야', '연구사례', '취업시장', '학술논문'],
      focusAreas: ['전문지식', '연구방법', '비판적분석', '실무응용']
    },
    
    sessionTypeWeights: {
      'inquiry': 1.5,
      'problem': 1.4,
      'debate': 1.3,
      'discussion': 1.2,
      'creative': 1.0
    }
  },

  [EducationLevel.ADULT]: {
    level: EducationLevel.ADULT,
    displayName: '성인교육',
    description: '실무 중심의 평생학습과 역량 개발',
    ageRange: '25세+',
    characteristics: ['실무 적용', '경험 기반', '목표 지향', '시간 효율'],
    
    theme: {
      primaryColor: '#2D3436',
      secondaryColor: '#636E72',
      backgroundColor: '#FAFAFA',
      fontSizeScale: 0.9,
      iconSize: 'small',
      borderRadius: 6
    },
    
    terminology: {
      student: '참여자',
      teacher: '진행자',
      class: '세션',
      homework: '실습 과제',
      grade: '수준'
    },
    
    aiPromptModifiers: {
      languageLevel: 'professional',
      explanationStyle: 'business',
      exampleTypes: ['업무사례', '산업동향', '실무경험', '성과측정'],
      focusAreas: ['실무적용', '성과향상', '효율성', '혁신']
    },
    
    sessionTypeWeights: {
      'problem': 1.5,
      'inquiry': 1.4,
      'discussion': 1.3,
      'debate': 1.2,
      'creative': 1.1
    }
  }
};

// 성인 학습자 세부 분류 (2024 트렌드 반영)
export const ADULT_LEARNER_CONFIGS = {
  [AdultLearnerType.PROFESSIONAL]: {
    displayName: '직장인 교육',
    description: '업무 역량 강화 및 리더십 개발',
    focusAreas: ['리더십', '커뮤니케이션', '프로젝트관리', '팀워크'],
    sessionDuration: '1-2시간',
    preferredFormats: ['워크샵', '세미나', '사례연구']
  },
  
  [AdultLearnerType.RESKILLING]: {
    displayName: '재숙련 교육', 
    description: '새로운 분야로의 전환을 위한 기술 습득',
    focusAreas: ['신기술', '디지털역량', '산업전환', '적응력'],
    sessionDuration: '2-4시간',
    preferredFormats: ['집중교육', '실습중심', '멘토링']
  },
  
  [AdultLearnerType.UPSKILLING]: {
    displayName: '역량 강화',
    description: '현재 업무 영역에서의 전문성 심화',
    focusAreas: ['전문지식', '기술향상', '인증취득', '경쟁력'],
    sessionDuration: '1-3시간',
    preferredFormats: ['전문강의', '실습', '동료학습']
  },
  
  [AdultLearnerType.DEGREE_COMPLETION]: {
    displayName: '학위 완성',
    description: '중단된 학업의 완성 및 학위 취득',
    focusAreas: ['학술역량', '연구방법', '체계적학습', '목표달성'],
    sessionDuration: '2-3시간',
    preferredFormats: ['정규강의', '온라인학습', '집중과정']
  },
  
  [AdultLearnerType.LIFELONG_LEARNING]: {
    displayName: '평생학습',
    description: '개인적 성장과 지적 호기심 충족',
    focusAreas: ['교양', '취미', '자기계발', '인문학'],
    sessionDuration: '1-2시간',
    preferredFormats: ['토론', '체험학습', '문화활동']
  }
};

// 유틸리티 함수들
export function getEducationLevelConfig(level: EducationLevel): EducationLevelConfig {
  return EDUCATION_LEVEL_CONFIGS[level];
}

export function getEducationLevelLabel(level: EducationLevel): string {
  return EDUCATION_LEVEL_CONFIGS[level].displayName;
}

export function getTerminology(level: EducationLevel, term: keyof EducationLevelConfig['terminology']): string {
  return EDUCATION_LEVEL_CONFIGS[level].terminology[term];
}

export function getAIPromptModifiers(level: EducationLevel) {
  return EDUCATION_LEVEL_CONFIGS[level].aiPromptModifiers;
}

export function getThemeConfig(level: EducationLevel) {
  return EDUCATION_LEVEL_CONFIGS[level].theme;
}

// 2024년 성인 학습 트렌드에 따른 추천 세션 타입
export function getRecommendedSessionTypes(level: EducationLevel): string[] {
  const weights = EDUCATION_LEVEL_CONFIGS[level].sessionTypeWeights;
  return Object.entries(weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);
}