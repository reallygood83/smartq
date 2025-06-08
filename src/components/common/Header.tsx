'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFullTheme, useLevelAdaptiveComponents } from '@/contexts/EducationLevelContext'
import Button from './Button'
import ThemeToggle from './ThemeToggle'
import { useState } from 'react'

function Header() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // 향상된 테마 시스템 적용
  const theme = useFullTheme()
  const { FontSize, CardPadding } = useLevelAdaptiveComponents()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header 
      className="transition-all duration-300"
      style={{ 
        backgroundColor: theme.colors.surface,
        boxShadow: theme.shadows.sm,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ 
          maxWidth: theme.layout.container.maxWidth
        }}
      >
        <div 
          className="flex justify-between items-center"
          style={{ 
            height: theme.layout.header.height,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm
          }}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div 
                className="text-white flex items-center justify-center font-bold mr-3 transition-all duration-300"
                style={{
                  backgroundColor: '#3B82F6', // 브랜드 색상 고정
                  width: theme.layout.header.height === '4rem' ? '2.5rem' : '2rem',
                  height: theme.layout.header.height === '4rem' ? '2.5rem' : '2rem',
                  borderRadius: theme.borders.radius.md,
                  fontSize: theme.typography.fontSize.lg
                }}
              >
                Q
              </div>
              <span 
                className="font-bold transition-all duration-300"
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily.primary
                }}
              >
                SmartQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex"
            style={{ gap: theme.spacing.lg }}
          >
            <Link 
              href="/" 
              className="px-3 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                borderRadius: theme.borders.radius.md
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.primary
                e.currentTarget.style.backgroundColor = theme.colors.background
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.secondary
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              홈
            </Link>
            {user && (
              <>
                <Link 
                  href="/teacher/dashboard" 
                  className="px-3 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    borderRadius: theme.borders.radius.md
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.primary
                    e.currentTarget.style.backgroundColor = theme.colors.background
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.text.secondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  대시보드
                </Link>
                <Link 
                  href="/teacher/settings" 
                  className="px-3 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1"
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    borderRadius: theme.borders.radius.md
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.primary
                    e.currentTarget.style.backgroundColor = theme.colors.background
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.text.secondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span>⚙️</span>
                  <span>설정</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                  />
                  <span 
                    className="ml-2 font-medium hidden md:block"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {user.displayName}
                  </span>
                </button>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-500"
                    style={{ 
                      backgroundColor: theme.colors.surface,
                      boxShadow: theme.shadows.lg
                    }}
                  >
                    <div 
                      className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-500"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {user.email}
                    </div>
                    <Link 
                      href="/teacher/settings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                      style={{ color: theme.colors.text.primary }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>⚙️</span>
                      <span>설정</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      style={{ color: theme.colors.text.primary }}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="primary">로그인</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              style={{ color: theme.colors.text.secondary }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div 
            className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-500"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }}
          >
            <Link 
              href="/" 
              className="block px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              style={{ color: theme.colors.text.secondary }}
            >
              홈
            </Link>
            {user && (
              <>
                <Link 
                  href="/teacher/dashboard" 
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  style={{ color: theme.colors.text.secondary }}
                >
                  대시보드
                </Link>
                <Link 
                  href="/teacher/settings" 
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 rounded-md"
                  style={{ color: theme.colors.text.secondary }}
                >
                  <span>⚙️</span>
                  <span>설정</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  style={{ color: theme.colors.text.secondary }}
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  )
}

export { Header }
export default Header