'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { EducationLevel, EducationLevelConfig, getEducationLevelConfig, AdultLearnerType } from '@/types/education'
import { 
  getTerminology as getSmartTerminology, 
  getToneSettings, 
  adaptSentenceForLevel, 
  generateEncouragement, 
  generateQuestionPrompt, 
  enhancePromptWithTone, 
  getContextualTerms, 
  adjustTextComplexity,
  type TerminologyMapping,
  type ToneSettings
} from '@/lib/terminology'
import { 
  getThemeForLevel, 
  applyThemeToDocument, 
  type Theme 
} from '@/styles/themes'

interface EducationLevelContextType {
  currentLevel: EducationLevel
  levelConfig: EducationLevelConfig
  adultLearnerType?: AdultLearnerType
  setEducationLevel: (level: EducationLevel) => void
  setAdultLearnerType: (type: AdultLearnerType) => void
  isLoading: boolean
  
  // 기본 헬퍼 함수들
  getTerminology: (term: keyof EducationLevelConfig['terminology']) => string
  getTheme: () => EducationLevelConfig['theme']
  getAIModifiers: () => EducationLevelConfig['aiPromptModifiers']
  
  // 향상된 테마 시스템
  getFullTheme: () => Theme
  getCurrentTheme: () => Theme
  
  // 스마트 용어 변환 함수들
  getSmartTerm: (term: keyof TerminologyMapping) => string
  getTone: () => ToneSettings
  adaptText: (text: string) => string
  getEncouragement: () => string
  getQuestionPrompt: () => string
  enhanceAIPrompt: (prompt: string) => string
  getContextTerms: (context: 'session' | 'question' | 'feedback' | 'evaluation') => Record<string, string>
  adjustComplexity: (text: string) => string
}

const EducationLevelContext = createContext<EducationLevelContextType | undefined>(undefined)

interface EducationLevelProviderProps {
  children: ReactNode
  defaultLevel?: EducationLevel
}

export function EducationLevelProvider({ 
  children, 
  defaultLevel = EducationLevel.ELEMENTARY 
}: EducationLevelProviderProps) {
  const [currentLevel, setCurrentLevel] = useState<EducationLevel>(defaultLevel)
  const [adultLearnerType, setAdultLearnerType] = useState<AdultLearnerType>()
  const [isLoading, setIsLoading] = useState(true)
  const [levelConfig, setLevelConfig] = useState<EducationLevelConfig>(
    getEducationLevelConfig(defaultLevel)
  )

  // localStorage에서 저장된 교육 레벨 불러오기
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('smartq_education_level') as EducationLevel
      const savedAdultType = localStorage.getItem('smartq_adult_learner_type') as AdultLearnerType
      
      if (savedLevel && Object.values(EducationLevel).includes(savedLevel)) {
        setCurrentLevel(savedLevel)
        setLevelConfig(getEducationLevelConfig(savedLevel))
      }
      
      if (savedAdultType && Object.values(AdultLearnerType).includes(savedAdultType)) {
        setAdultLearnerType(savedAdultType)
      }
    } catch (error) {
      console.error('교육 레벨 복원 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 교육 레벨 변경 시 설정 업데이트 및 저장
  const handleSetEducationLevel = (level: EducationLevel) => {
    setCurrentLevel(level)
    setLevelConfig(getEducationLevelConfig(level))
    
    try {
      localStorage.setItem('smartq_education_level', level)
      
      // 성인 교육이 아닌 경우 성인 학습자 타입 초기화
      if (level !== EducationLevel.ADULT) {
        setAdultLearnerType(undefined)
        localStorage.removeItem('smartq_adult_learner_type')
      }
    } catch (error) {
      console.error('교육 레벨 저장 오류:', error)
    }
  }

  // 성인 학습자 타입 변경 시 저장
  const handleSetAdultLearnerType = (type: AdultLearnerType) => {
    setAdultLearnerType(type)
    
    try {
      localStorage.setItem('smartq_adult_learner_type', type)
    } catch (error) {
      console.error('성인 학습자 타입 저장 오류:', error)
    }
  }

  // 기본 헬퍼 함수들
  const getTerminology = (term: keyof EducationLevelConfig['terminology']): string => {
    return levelConfig.terminology[term]
  }

  const getTheme = (): EducationLevelConfig['theme'] => {
    return levelConfig.theme
  }

  const getAIModifiers = (): EducationLevelConfig['aiPromptModifiers'] => {
    return levelConfig.aiPromptModifiers
  }

  // 스마트 용어 변환 함수들
  const getSmartTerm = (term: keyof TerminologyMapping): string => {
    return getSmartTerminology(term, currentLevel, adultLearnerType)
  }

  const getTone = (): ToneSettings => {
    return getToneSettings(currentLevel)
  }

  const adaptText = (text: string): string => {
    return adaptSentenceForLevel(text, currentLevel, adultLearnerType)
  }

  const getEncouragement = (): string => {
    return generateEncouragement(currentLevel)
  }

  const getQuestionPrompt = (): string => {
    return generateQuestionPrompt(currentLevel)
  }

  const enhanceAIPrompt = (prompt: string): string => {
    return enhancePromptWithTone(prompt, currentLevel, adultLearnerType)
  }

  const getContextTerms = (context: 'session' | 'question' | 'feedback' | 'evaluation'): Record<string, string> => {
    return getContextualTerms(context, currentLevel, adultLearnerType)
  }

  const adjustComplexity = (text: string): string => {
    return adjustTextComplexity(text, currentLevel)
  }

  // 향상된 테마 함수들
  const getFullTheme = (): Theme => {
    return getThemeForLevel(currentLevel, adultLearnerType)
  }

  const getCurrentTheme = (): Theme => {
    return getThemeForLevel(currentLevel, adultLearnerType)
  }

  const contextValue: EducationLevelContextType = {
    currentLevel,
    levelConfig,
    adultLearnerType,
    setEducationLevel: handleSetEducationLevel,
    setAdultLearnerType: handleSetAdultLearnerType,
    isLoading,
    // 기본 함수들
    getTerminology,
    getTheme,
    getAIModifiers,
    // 향상된 테마 함수들
    getFullTheme,
    getCurrentTheme,
    // 스마트 용어 변환 함수들
    getSmartTerm,
    getTone,
    adaptText,
    getEncouragement,
    getQuestionPrompt,
    enhanceAIPrompt,
    getContextTerms,
    adjustComplexity
  }

  return (
    <EducationLevelContext.Provider value={contextValue}>
      {children}
    </EducationLevelContext.Provider>
  )
}

// 커스텀 훅
export function useEducationLevel() {
  const context = useContext(EducationLevelContext)
  
  if (context === undefined) {
    throw new Error('useEducationLevel은 EducationLevelProvider 내에서 사용되어야 합니다')
  }
  
  return context
}

// CSS 변수 동적 설정을 위한 훅 (기존 방식 - 호환성 유지)
export function useThemeVariables() {
  const { getTheme, currentLevel } = useEducationLevel()
  
  useEffect(() => {
    const theme = getTheme()
    const root = document.documentElement
    
    // CSS 커스텀 속성 동적 설정 (기존 방식)
    root.style.setProperty('--smartq-primary-color', theme.primaryColor)
    root.style.setProperty('--smartq-secondary-color', theme.secondaryColor)
    root.style.setProperty('--smartq-background-color', theme.backgroundColor)
    root.style.setProperty('--smartq-font-scale', theme.fontSizeScale.toString())
    root.style.setProperty('--smartq-border-radius', `${theme.borderRadius}px`)
    
    // 아이콘 크기 설정
    const iconSizeMap = {
      small: '16px',
      medium: '20px', 
      large: '24px'
    }
    root.style.setProperty('--smartq-icon-size', iconSizeMap[theme.iconSize])
    
    // 레벨별 body 클래스 추가 (추가 스타일링용)
    document.body.className = document.body.className.replace(/smartq-level-\w+/g, '')
    document.body.classList.add(`smartq-level-${currentLevel}`)
    
  }, [currentLevel, getTheme])
}

// 향상된 테마 시스템을 위한 훅
export function useFullTheme() {
  const { getCurrentTheme, currentLevel, adultLearnerType } = useEducationLevel()
  
  useEffect(() => {
    const fullTheme = getCurrentTheme()
    applyThemeToDocument(fullTheme)
    
    // 레벨별 body 클래스 추가
    document.body.className = document.body.className.replace(/smartq-level-\w+/g, '')
    document.body.classList.add(`smartq-level-${currentLevel}`)
    
    // 성인 학습자 타입별 클래스 추가
    if (currentLevel === EducationLevel.ADULT && adultLearnerType) {
      document.body.classList.add(`smartq-adult-${adultLearnerType}`)
    } else {
      // 성인 타입 클래스 제거
      document.body.className = document.body.className.replace(/smartq-adult-\w+/g, '')
    }
    
  }, [getCurrentTheme, currentLevel, adultLearnerType])
  
  return getCurrentTheme()
}

// 레벨별 권한 확인 훅
export function useLevelPermissions() {
  const { currentLevel, adultLearnerType } = useEducationLevel()
  
  return {
    canCreateAdvancedSessions: currentLevel === EducationLevel.ADULT || currentLevel === EducationLevel.UNIVERSITY,
    canAccessAnalytics: currentLevel === EducationLevel.ADULT,
    canExportReports: currentLevel === EducationLevel.ADULT || currentLevel === EducationLevel.UNIVERSITY,
    canManageParticipants: currentLevel === EducationLevel.ADULT,
    hasNetworkingFeatures: currentLevel === EducationLevel.ADULT && adultLearnerType === AdultLearnerType.PROFESSIONAL,
    maxSessionDuration: currentLevel === EducationLevel.ELEMENTARY ? 45 : 
                      currentLevel === EducationLevel.MIDDLE ? 60 :
                      currentLevel === EducationLevel.HIGH ? 90 :
                      180, // 분 단위
    maxParticipants: currentLevel === EducationLevel.ELEMENTARY ? 25 :
                    currentLevel === EducationLevel.MIDDLE ? 30 :
                    currentLevel === EducationLevel.HIGH ? 35 :
                    currentLevel === EducationLevel.UNIVERSITY ? 100 :
                    500 // 성인 교육
  }
}

// 레벨에 맞는 UI 컴포넌트 선택 훅
export function useLevelAdaptiveComponents() {
  const { currentLevel } = useEducationLevel()
  
  return {
    ButtonSize: currentLevel === EducationLevel.ELEMENTARY ? 'lg' : 
               currentLevel === EducationLevel.ADULT ? 'sm' : 'md',
    CardPadding: currentLevel === EducationLevel.ELEMENTARY ? 'p-6' :
                currentLevel === EducationLevel.ADULT ? 'p-4' : 'p-5',
    FontSize: currentLevel === EducationLevel.ELEMENTARY ? 'text-lg' :
             currentLevel === EducationLevel.ADULT ? 'text-sm' : 'text-base',
    Animation: currentLevel === EducationLevel.ELEMENTARY ? 'bounce' :
              currentLevel === EducationLevel.ADULT ? 'none' : 'fade'
  }
}

// 스마트 용어 변환 전용 훅
export function useSmartTerminology() {
  const { 
    getSmartTerm, 
    getTone, 
    adaptText, 
    getEncouragement, 
    getQuestionPrompt, 
    enhanceAIPrompt, 
    getContextTerms, 
    adjustComplexity,
    currentLevel,
    adultLearnerType
  } = useEducationLevel()
  
  return {
    // 기본 용어 변환
    term: getSmartTerm,
    tone: getTone(),
    
    // 텍스트 변환
    adapt: adaptText,
    adjustComplexity,
    
    // 동적 생성
    encouragement: getEncouragement,
    questionPrompt: getQuestionPrompt,
    
    // AI 프롬프트 강화
    enhancePrompt: enhanceAIPrompt,
    
    // 컨텍스트별 용어
    sessionTerms: getContextTerms('session'),
    questionTerms: getContextTerms('question'),
    feedbackTerms: getContextTerms('feedback'),
    evaluationTerms: getContextTerms('evaluation'),
    
    // 메타 정보
    currentLevel,
    adultLearnerType,
    
    // 유틸리티 함수들
    getContextTerms,
    isElementary: currentLevel === EducationLevel.ELEMENTARY,
    isAdult: currentLevel === EducationLevel.ADULT,
    isProfessional: currentLevel === EducationLevel.ADULT && adultLearnerType === AdultLearnerType.PROFESSIONAL
  }
}

// 레벨별 메시지 생성 훅
export function useLevelMessages() {
  const { getEncouragement, getQuestionPrompt, adaptText, currentLevel } = useEducationLevel()
  
  return {
    // 표준 메시지들
    welcomeMessage: adaptText(`SmartQ에 오신 것을 환영합니다!`),
    sessionStartMessage: adaptText(`새로운 학습 세션을 시작해보세요.`),
    questionPromptMessage: getQuestionPrompt(),
    encouragementMessage: getEncouragement(),
    
    // 동적 메시지 생성
    createWelcome: (name?: string) => adaptText(
      name ? `${name}님, SmartQ에 오신 것을 환영합니다!` : `SmartQ에 오신 것을 환영합니다!`
    ),
    createSuccess: (action: string) => adaptText(`${action}을(를) 성공적으로 완료했습니다! ${getEncouragement()}`),
    createError: (error: string) => adaptText(`문제가 발생했습니다: ${error}. 다시 시도해보세요.`),
    
    // 레벨 정보
    currentLevel
  }
}