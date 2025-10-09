'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'
import { useState } from 'react'

function Header() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold mr-3 rounded-md text-lg">
                Q
              </div>
              <span className="text-xl font-bold text-gray-900">
                SmartQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              홈
            </Link>
            {user && (
              <>
                <Link 
                  href="/teacher/dashboard" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  대시보드
                </Link>
                <Link 
                  href="/teacher/settings" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center space-x-1"
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
                  <span className="ml-2 font-medium hidden md:block text-gray-900">
                    {user.displayName}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm border-b border-gray-200 text-gray-600">
                      {user.email}
                    </div>
                    <Link 
                      href="/teacher/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="default">로그인</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-white">
            <Link 
              href="/" 
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md"
            >
              홈
            </Link>
            {user && (
              <>
                <Link 
                  href="/teacher/dashboard" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  대시보드
                </Link>
                <Link 
                  href="/teacher/settings" 
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 flex items-center space-x-2 rounded-md"
                >
                  <span>⚙️</span>
                  <span>설정</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md"
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