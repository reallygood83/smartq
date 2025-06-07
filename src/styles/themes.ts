/**
 * SmartQ 레벨별 테마 시스템
 * 교육 레벨에 따른 동적 UI 스타일링
 */

import { EducationLevel, AdultLearnerType } from '@/types/education'

// 기본 테마 인터페이스
export interface Theme {
  // 색상 시스템
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      light: string
    }
    status: {
      success: string
      warning: string
      error: string
      info: string
    }
    border: string
    shadow: string
  }
  
  // 타이포그래피
  typography: {
    fontFamily: {
      primary: string
      secondary: string
      mono: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
    letterSpacing: {
      tight: string
      normal: string
      wide: string
    }
  }
  
  // 간격 시스템
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    component: {
      padding: string
      margin: string
      gap: string
    }
  }
  
  // 경계선 및 둥근 모서리
  borders: {
    radius: {
      sm: string
      md: string
      lg: string
      xl: string
      full: string
    }
    width: {
      thin: string
      normal: string
      thick: string
    }
  }
  
  // 그림자
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  // 애니메이션
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      linear: string
      easeIn: string
      easeOut: string
      easeInOut: string
      bounce: string
    }
  }
  
  // 레이아웃
  layout: {
    container: {
      maxWidth: string
      padding: string
    }
    header: {
      height: string
    }
    sidebar: {
      width: string
    }
  }
}

// 초등학교 테마 - 밝고 친근한 디자인
export const elementaryTheme: Theme = {
  colors: {
    primary: '#FF6B6B', // 밝은 빨강
    primaryLight: '#FFB3B3',
    primaryDark: '#E55555',
    secondary: '#4ECDC4', // 민트
    accent: '#FFE66D', // 노랑
    background: '#FFF9F9',
    surface: '#FFFFFF',
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
      light: '#718096'
    },
    status: {
      success: '#48BB78',
      warning: '#ED8936',
      error: '#F56565',
      info: '#4299E1'
    },
    border: 'rgba(255, 107, 107, 0.15)',
    shadow: 'rgba(255, 107, 107, 0.1)'
  },
  typography: {
    fontFamily: {
      primary: "'Comic Neue', 'Noto Sans KR', sans-serif",
      secondary: "'Nunito', 'Noto Sans KR', sans-serif",
      mono: "'JetBrains Mono', monospace"
    },
    fontSize: {
      xs: '0.875rem',
      sm: '1rem',
      base: '1.125rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '1.875rem',
      '3xl': '2.25rem',
      '4xl': '3rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    component: {
      padding: '1.5rem',
      margin: '1rem',
      gap: '1rem'
    }
  },
  borders: {
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '50%'
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px'
    }
  },
  shadows: {
    sm: '0 1px 3px rgba(255, 107, 107, 0.08)',
    md: '0 4px 8px rgba(255, 107, 107, 0.12)',
    lg: '0 8px 16px rgba(255, 107, 107, 0.15)',
    xl: '0 12px 24px rgba(255, 107, 107, 0.2)'
  },
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  layout: {
    container: {
      maxWidth: '1200px',
      padding: '1.5rem'
    },
    header: {
      height: '4rem'
    },
    sidebar: {
      width: '16rem'
    }
  }
}

// 중학교 테마 - 균형잡힌 활기찬 디자인
export const middleTheme: Theme = {
  colors: {
    primary: '#667EEA', // 보라-파랑
    primaryLight: '#A5B4FC',
    primaryDark: '#5A67D8',
    secondary: '#F093FB', // 핑크
    accent: '#4FD1C7', // 청록
    background: '#F7FAFC',
    surface: '#FFFFFF',
    text: {
      primary: '#1A202C',
      secondary: '#2D3748',
      light: '#4A5568'
    },
    status: {
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E',
      info: '#3182CE'
    },
    border: '#CBD5E0',
    shadow: 'rgba(102, 126, 234, 0.1)'
  },
  typography: {
    fontFamily: {
      primary: "'Inter', 'Noto Sans KR', sans-serif",
      secondary: "'Poppins', 'Noto Sans KR', sans-serif",
      mono: "'JetBrains Mono', monospace"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.5,
      relaxed: 1.7
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.375rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '2.5rem',
    component: {
      padding: '1.25rem',
      margin: '0.75rem',
      gap: '0.75rem'
    }
  },
  borders: {
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '50%'
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px'
    }
  },
  shadows: {
    sm: '0 1px 3px rgba(102, 126, 234, 0.1)',
    md: '0 4px 6px rgba(102, 126, 234, 0.1)',
    lg: '0 10px 15px rgba(102, 126, 234, 0.1)',
    xl: '0 20px 25px rgba(102, 126, 234, 0.1)'
  },
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.25s',
      slow: '0.4s'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  layout: {
    container: {
      maxWidth: '1280px',
      padding: '1rem'
    },
    header: {
      height: '3.5rem'
    },
    sidebar: {
      width: '14rem'
    }
  }
}

// 고등학교 테마 - 성숙하고 세련된 디자인
export const highTheme: Theme = {
  colors: {
    primary: '#3B82F6', // 파랑
    primaryLight: '#93C5FD',
    primaryDark: '#1D4ED8',
    secondary: '#8B5CF6', // 보라
    accent: '#06D6A0', // 그린
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: {
      primary: '#0F172A',
      secondary: '#1E293B',
      light: '#475569'
    },
    status: {
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7'
    },
    border: '#CBD5E0',
    shadow: 'rgba(59, 130, 246, 0.1)'
  },
  typography: {
    fontFamily: {
      primary: "'Inter', 'Noto Sans KR', sans-serif",
      secondary: "'Roboto', 'Noto Sans KR', sans-serif",
      mono: "'JetBrains Mono', monospace"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.5,
      relaxed: 1.7
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    component: {
      padding: '1rem',
      margin: '0.5rem',
      gap: '0.5rem'
    }
  },
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '50%'
    },
    width: {
      thin: '1px',
      normal: '1px',
      thick: '2px'
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(59, 130, 246, 0.05)',
    md: '0 4px 6px rgba(59, 130, 246, 0.07)',
    lg: '0 10px 15px rgba(59, 130, 246, 0.1)',
    xl: '0 20px 25px rgba(59, 130, 246, 0.1)'
  },
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  layout: {
    container: {
      maxWidth: '1400px',
      padding: '1rem'
    },
    header: {
      height: '3.5rem'
    },
    sidebar: {
      width: '12rem'
    }
  }
}

// 대학교 테마 - 학술적이고 전문적인 디자인
export const universityTheme: Theme = {
  colors: {
    primary: '#1F2937', // 어두운 회색
    primaryLight: '#6B7280',
    primaryDark: '#111827',
    secondary: '#3B82F6', // 파랑
    accent: '#F59E0B', // 주황
    background: '#FAFAF9',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#374151',
      light: '#6B7280'
    },
    status: {
      success: '#047857',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0369A1'
    },
    border: '#D1D5DB',
    shadow: 'rgba(31, 41, 55, 0.1)'
  },
  typography: {
    fontFamily: {
      primary: "'Inter', 'Noto Sans KR', sans-serif",
      secondary: "'Source Sans Pro', 'Noto Sans KR', sans-serif",
      mono: "'JetBrains Mono', monospace"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    component: {
      padding: '1rem',
      margin: '0.5rem',
      gap: '0.5rem'
    }
  },
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '50%'
    },
    width: {
      thin: '1px',
      normal: '1px',
      thick: '2px'
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(31, 41, 55, 0.05)',
    md: '0 4px 6px rgba(31, 41, 55, 0.07)',
    lg: '0 10px 15px rgba(31, 41, 55, 0.1)',
    xl: '0 20px 25px rgba(31, 41, 55, 0.1)'
  },
  animations: {
    duration: {
      fast: '0.1s',
      normal: '0.2s',
      slow: '0.3s'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  layout: {
    container: {
      maxWidth: '1500px',
      padding: '1rem'
    },
    header: {
      height: '3rem'
    },
    sidebar: {
      width: '14rem'
    }
  }
}

// 성인 교육 테마 - 전문적이고 비즈니스 적인 디자인
export const adultTheme: Theme = {
  colors: {
    primary: '#0F172A', // 매우 어두운 블루-그레이
    primaryLight: '#475569',
    primaryDark: '#020617',
    secondary: '#0EA5E9', // 하늘색
    accent: '#10B981', // 에메랄드
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: {
      primary: '#0F172A',
      secondary: '#334155',
      light: '#64748B'
    },
    status: {
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7'
    },
    border: '#E2E8F0',
    shadow: 'rgba(15, 23, 42, 0.1)'
  },
  typography: {
    fontFamily: {
      primary: "'Inter', 'Noto Sans KR', sans-serif",
      secondary: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
      mono: "'JetBrains Mono', monospace"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    component: {
      padding: '0.875rem',
      margin: '0.5rem',
      gap: '0.5rem'
    }
  },
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '50%'
    },
    width: {
      thin: '1px',
      normal: '1px',
      thick: '2px'
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 4px 6px rgba(15, 23, 42, 0.07)',
    lg: '0 10px 15px rgba(15, 23, 42, 0.1)',
    xl: '0 20px 25px rgba(15, 23, 42, 0.1)'
  },
  animations: {
    duration: {
      fast: '0.1s',
      normal: '0.15s',
      slow: '0.25s'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  layout: {
    container: {
      maxWidth: '1600px',
      padding: '1rem'
    },
    header: {
      height: '3rem'
    },
    sidebar: {
      width: '16rem'
    }
  }
}

// 성인 학습자 타입별 테마 변형
export const adultLearnerThemes: Record<AdultLearnerType, Partial<Theme>> = {
  [AdultLearnerType.PROFESSIONAL]: {
    colors: {
      primary: '#1E40AF', // 비즈니스 블루
      secondary: '#7C3AED', // 보라
      accent: '#059669' // 그린
    }
  },
  [AdultLearnerType.RESKILLING]: {
    colors: {
      primary: '#DC2626', // 빨강 (변화)
      secondary: '#F59E0B', // 주황
      accent: '#10B981' // 에메랄드
    }
  },
  [AdultLearnerType.UPSKILLING]: {
    colors: {
      primary: '#7C2D12', // 브라운 (성장)
      secondary: '#EA580C', // 주황
      accent: '#0891B2' // 시안
    }
  },
  [AdultLearnerType.DEGREE_COMPLETION]: {
    colors: {
      primary: '#4338CA', // 인디고 (학업)
      secondary: '#7C3AED', // 보라
      accent: '#DB2777' // 핑크
    }
  },
  [AdultLearnerType.LIFELONG_LEARNING]: {
    colors: {
      primary: '#059669', // 에메랄드 (지속성)
      secondary: '#0D9488', // 틸
      accent: '#3B82F6' // 블루
    }
  }
}

// 교육 레벨별 테마 매핑
export const levelThemes: Record<EducationLevel, Theme> = {
  [EducationLevel.ELEMENTARY]: elementaryTheme,
  [EducationLevel.MIDDLE]: middleTheme,
  [EducationLevel.HIGH]: highTheme,
  [EducationLevel.UNIVERSITY]: universityTheme,
  [EducationLevel.ADULT]: adultTheme
}

// 테마 조합 함수
export function getThemeForLevel(
  level: EducationLevel, 
  adultType?: AdultLearnerType
): Theme {
  const baseTheme = levelThemes[level]
  
  // 성인 교육이고 세부 타입이 있는 경우 테마 조합
  if (level === EducationLevel.ADULT && adultType && adultLearnerThemes[adultType]) {
    const adultVariation = adultLearnerThemes[adultType]
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...adultVariation.colors
      }
    }
  }
  
  return baseTheme
}

// CSS 커스텀 속성 생성 함수
export function generateCSSVariables(theme: Theme): Record<string, string> {
  return {
    // 색상
    '--smartq-color-primary': theme.colors.primary,
    '--smartq-color-primary-light': theme.colors.primaryLight,
    '--smartq-color-primary-dark': theme.colors.primaryDark,
    '--smartq-color-secondary': theme.colors.secondary,
    '--smartq-color-accent': theme.colors.accent,
    '--smartq-color-background': theme.colors.background,
    '--smartq-color-surface': theme.colors.surface,
    '--smartq-color-text-primary': theme.colors.text.primary,
    '--smartq-color-text-secondary': theme.colors.text.secondary,
    '--smartq-color-text-light': theme.colors.text.light,
    '--smartq-color-border': theme.colors.border,
    '--smartq-color-shadow': theme.colors.shadow,
    
    // 상태 색상
    '--smartq-color-success': theme.colors.status.success,
    '--smartq-color-warning': theme.colors.status.warning,
    '--smartq-color-error': theme.colors.status.error,
    '--smartq-color-info': theme.colors.status.info,
    
    // 타이포그래피
    '--smartq-font-primary': theme.typography.fontFamily.primary,
    '--smartq-font-secondary': theme.typography.fontFamily.secondary,
    '--smartq-font-mono': theme.typography.fontFamily.mono,
    '--smartq-text-xs': theme.typography.fontSize.xs,
    '--smartq-text-sm': theme.typography.fontSize.sm,
    '--smartq-text-base': theme.typography.fontSize.base,
    '--smartq-text-lg': theme.typography.fontSize.lg,
    '--smartq-text-xl': theme.typography.fontSize.xl,
    '--smartq-text-2xl': theme.typography.fontSize['2xl'],
    '--smartq-text-3xl': theme.typography.fontSize['3xl'],
    '--smartq-text-4xl': theme.typography.fontSize['4xl'],
    
    // 간격
    '--smartq-spacing-xs': theme.spacing.xs,
    '--smartq-spacing-sm': theme.spacing.sm,
    '--smartq-spacing-md': theme.spacing.md,
    '--smartq-spacing-lg': theme.spacing.lg,
    '--smartq-spacing-xl': theme.spacing.xl,
    '--smartq-spacing-2xl': theme.spacing['2xl'],
    '--smartq-spacing-3xl': theme.spacing['3xl'],
    '--smartq-spacing-component-padding': theme.spacing.component.padding,
    '--smartq-spacing-component-margin': theme.spacing.component.margin,
    '--smartq-spacing-component-gap': theme.spacing.component.gap,
    
    // 경계선
    '--smartq-radius-sm': theme.borders.radius.sm,
    '--smartq-radius-md': theme.borders.radius.md,
    '--smartq-radius-lg': theme.borders.radius.lg,
    '--smartq-radius-xl': theme.borders.radius.xl,
    '--smartq-radius-full': theme.borders.radius.full,
    '--smartq-border-thin': theme.borders.width.thin,
    '--smartq-border-normal': theme.borders.width.normal,
    '--smartq-border-thick': theme.borders.width.thick,
    
    // 그림자
    '--smartq-shadow-sm': theme.shadows.sm,
    '--smartq-shadow-md': theme.shadows.md,
    '--smartq-shadow-lg': theme.shadows.lg,
    '--smartq-shadow-xl': theme.shadows.xl,
    
    // 애니메이션
    '--smartq-duration-fast': theme.animations.duration.fast,
    '--smartq-duration-normal': theme.animations.duration.normal,
    '--smartq-duration-slow': theme.animations.duration.slow,
    '--smartq-easing-linear': theme.animations.easing.linear,
    '--smartq-easing-ease-in': theme.animations.easing.easeIn,
    '--smartq-easing-ease-out': theme.animations.easing.easeOut,
    '--smartq-easing-ease-in-out': theme.animations.easing.easeInOut,
    '--smartq-easing-bounce': theme.animations.easing.bounce,
    
    // 레이아웃
    '--smartq-container-max-width': theme.layout.container.maxWidth,
    '--smartq-container-padding': theme.layout.container.padding,
    '--smartq-header-height': theme.layout.header.height,
    '--smartq-sidebar-width': theme.layout.sidebar.width
  }
}

// 테마 적용 함수
export function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement
  const cssVariables = generateCSSVariables(theme)
  
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

// 다크 모드 지원을 위한 테마 변형 (미래 확장용)
export function createDarkVariant(theme: Theme): Theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      background: '#0F172A',
      surface: '#1E293B',
      text: {
        primary: '#F1F5F9',
        secondary: '#CBD5E1',
        light: '#94A3B8'
      },
      border: '#334155'
    }
  }
}