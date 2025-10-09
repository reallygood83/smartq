'use client'

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
  return (
    <div 
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ${hover ? 'hover:scale-105 hover:shadow-lg hover:border-blue-500 cursor-pointer' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {title && (
        <div className="border-b border-gray-200 px-6 py-4">
          {typeof title === 'string' ? (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
})

export { Card }
export default Card