'use client'

import { useFullTheme, useLevelAdaptiveComponents } from '@/contexts/EducationLevelContext'
import { forwardRef } from 'react'

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  animated = true
}, ref) {
  const theme = useFullTheme()
  const { ButtonSize } = useLevelAdaptiveComponents()
  
  // 레벨별 기본 사이즈 적용 (사용자가 지정하지 않은 경우)
  const effectiveSize = size === 'md' ? (ButtonSize as 'sm' | 'md' | 'lg') : size
  
  // 레벨별 색상 매핑
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: 'white',
          hoverBackgroundColor: theme.colors.primaryDark,
          focusRingColor: theme.colors.primary
        }
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: 'white',
          hoverBackgroundColor: theme.colors.secondary,
          focusRingColor: theme.colors.secondary
        }
      case 'success':
        return {
          backgroundColor: theme.colors.status.success,
          color: 'white',
          hoverBackgroundColor: theme.colors.status.success,
          focusRingColor: theme.colors.status.success
        }
      case 'warning':
        return {
          backgroundColor: theme.colors.status.warning,
          color: 'white',
          hoverBackgroundColor: theme.colors.status.warning,
          focusRingColor: theme.colors.status.warning
        }
      case 'danger':
        return {
          backgroundColor: theme.colors.status.error,
          color: 'white',
          hoverBackgroundColor: theme.colors.status.error,
          focusRingColor: theme.colors.status.error
        }
      case 'outline':
        return {
          backgroundColor: theme.colors.surface,
          color: theme.colors.text.primary,
          hoverBackgroundColor: theme.colors.background,
          focusRingColor: theme.colors.primary,
          border: `${theme.borders.width.thin} solid ${theme.colors.border}`
        }
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: 'white',
          hoverBackgroundColor: theme.colors.primaryDark,
          focusRingColor: theme.colors.primary
        }
    }
  }
  
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm
        }
      case 'lg':
        return {
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          fontSize: theme.typography.fontSize.lg
        }
      default: // 'md'
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.typography.fontSize.base
        }
    }
  }
  
  const variantStyles = getVariantStyles(variant)
  const sizeStyles = getSizeStyles(effectiveSize)
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borders.radius.md,
    fontFamily: theme.typography.fontFamily.primary,
    transition: `all ${theme.animations.duration.normal} ${theme.animations.easing.easeInOut}`,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    border: 'none',
    transformOrigin: 'center',
    ...variantStyles,
    ...sizeStyles,
    ...style
  }
  
  return (
    <button
      ref={ref}
      type={type}
      className={`${animated ? 'hover:scale-105 active:scale-95' : ''} ${className}`.trim()}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyles.hoverBackgroundColor
          if (animated) {
            e.currentTarget.style.boxShadow = theme.shadows.md
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 3px ${variantStyles.focusRingColor}33`
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2" 
          style={{ width: '1rem', height: '1rem' }}
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
})

export { Button }
export default Button