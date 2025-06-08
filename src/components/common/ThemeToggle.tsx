'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)

  const themes = [
    { value: 'light', label: '라이트 모드', icon: '☀️' },
    { value: 'dark', label: '다크 모드', icon: '🌙' },
    { value: 'system', label: '시스템 설정', icon: '💻' }
  ] as const

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative">
      {/* 간단한 토글 버튼 (모바일용) */}
      <button
        onClick={toggleTheme}
        className="md:hidden p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="테마 토글"
      >
        <span className="text-lg">
          {theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '💻'}
        </span>
      </button>

      {/* 드롭다운 버튼 (데스크톱용) */}
      <div className="hidden md:block">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg">{currentTheme.icon}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentTheme.label}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 드롭다운 메뉴 */}
        {showDropdown && (
          <>
            {/* 오버레이 */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* 드롭다운 내용 */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20">
              <div className="py-1">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value)
                      setShowDropdown(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      theme === themeOption.value 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className="text-lg">{themeOption.icon}</span>
                    <span className="text-sm font-medium">{themeOption.label}</span>
                    {theme === themeOption.value && (
                      <span className="ml-auto">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}