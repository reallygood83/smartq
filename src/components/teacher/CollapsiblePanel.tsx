'use client'

import { useState, ReactNode } from 'react'
import { Card } from '@/components/common/Card'
import { motion, AnimatePresence } from 'framer-motion'

interface CollapsiblePanelProps {
  title: string
  icon?: string
  badge?: string | number
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
  headerActions?: ReactNode
}

export default function CollapsiblePanel({
  title,
  icon,
  badge,
  children,
  defaultExpanded = false,
  className = '',
  headerActions
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div
        className="p-4 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {badge !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {headerActions && (
              <div onClick={(e) => e.stopPropagation()}>
                {headerActions}
              </div>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}