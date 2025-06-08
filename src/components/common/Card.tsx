'use client'

import { useFullTheme, useLevelAdaptiveComponents } from '@/contexts/EducationLevelContext'
import { forwardRef } from 'react'

interface CardProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ 
  children, 
  title, 
  className = '',
  padding = true,
  style = {},
  hover = false,
  onClick
}, ref) {
  const theme = useFullTheme()
  const { CardPadding, FontSize } = useLevelAdaptiveComponents()
  
  const dynamicPadding = padding ? theme.spacing.component.padding : '0'
  
  return (
    <div 
      ref={ref}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 transition-all duration-300 ${hover ? 'hover:scale-105 cursor-pointer' : ''} ${className}`}
      style={{
        borderRadius: theme.borders.radius.lg,
        boxShadow: theme.shadows.md,
        fontFamily: theme.typography.fontFamily.primary,
        ...style
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = theme.shadows.lg
          e.currentTarget.style.borderColor = theme.colors.primary
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = theme.shadows.md
          e.currentTarget.style.borderColor = theme.colors.border
        }
      }}
    >
      {title && (
        <div 
          className="border-b"
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderColor: theme.colors.border
          }}
        >
          {typeof title === 'string' ? (
            <h2 
              className="font-semibold"
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary,
                fontWeight: theme.typography.fontWeight.semibold
              }}
            >
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
      )}
      <div style={{ padding: dynamicPadding }}>
        {children}
      </div>
    </div>
  );
})

export { Card }
export default Card