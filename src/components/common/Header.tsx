'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFullTheme, useLevelAdaptiveComponents } from '@/contexts/EducationLevelContext'
import Button from './Button'
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
        height: theme.layout.header.height,
        boxShadow: theme.shadows.sm,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ 
          maxWidth: theme.layout.container.maxWidth,
          padding: theme.layout.container.padding
        }}
      >
        <div 
          className="flex justify-between items-center"
          style={{ height: theme.layout.header.height }}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div 
                className="text-white flex items-center justify-center font-bold mr-3 transition-all duration-300"
                style={{
                  backgroundColor: theme.colors.primary,
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
                  설정
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
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
                  <span className="ml-2 text-gray-700 font-medium hidden md:block">
                    {user.displayName}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.email}
                    </div>
                    <Link 
                      href="/teacher/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      API 설정
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
              홈
            </Link>
            {user && (
              <>
                <Link href="/teacher/dashboard" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                  대시보드
                </Link>
                <Link href="/teacher/settings" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                  설정
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
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