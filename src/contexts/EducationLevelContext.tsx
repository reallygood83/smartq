'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { EducationLevel, EducationLevelConfig, getEducationLevelConfig, AdultLearnerType } from '@/types/education'

interface EducationLevelContextType {
  currentLevel: EducationLevel
  levelConfig: EducationLevelConfig
  adultLearnerType?: AdultLearnerType
  setEducationLevel: (level: EducationLevel) => void
  setAdultLearnerType: (type: AdultLearnerType) => void
  isLoading: boolean
  
  // 헬퍼 함수들
  getTerminology: (term: keyof EducationLevelConfig['terminology']) => string
  getTheme: () => EducationLevelConfig['theme']
  getAIModifiers: () => EducationLevelConfig['aiPromptModifiers']
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

  // 헬퍼 함수들
  const getTerminology = (term: keyof EducationLevelConfig['terminology']): string => {
    return levelConfig.terminology[term]
  }

  const getTheme = (): EducationLevelConfig['theme'] => {
    return levelConfig.theme
  }

  const getAIModifiers = (): EducationLevelConfig['aiPromptModifiers'] => {
    return levelConfig.aiPromptModifiers
  }

  const contextValue: EducationLevelContextType = {
    currentLevel,
    levelConfig,
    adultLearnerType,
    setEducationLevel: handleSetEducationLevel,
    setAdultLearnerType: handleSetAdultLearnerType,
    isLoading,
    getTerminology,
    getTheme,
    getAIModifiers
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

// CSS 변수 동적 설정을 위한 훅
export function useThemeVariables() {
  const { getTheme, currentLevel } = useEducationLevel()
  
  useEffect(() => {
    const theme = getTheme()
    const root = document.documentElement
    
    // CSS 커스텀 속성 동적 설정
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