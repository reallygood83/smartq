'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user) {
      redirect('/teacher/dashboard')
    }
  }, [user, loading, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">로딩 중...</div>
      </div>
    )
  }

  if (loading || user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">로딩 중...</div>
      </div>
    )
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('로그인 오류:', error)
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              교사 로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
              SmartQ 서비스를 이용하기 위해 로그인하세요
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Google 계정으로 시작하기
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-200 mb-6">
                  교사 인증을 위해 Google 계정을 사용합니다
                </p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center space-x-3 py-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>
                  {isSigningIn ? '로그인 중...' : 'Google로 로그인'}
                </span>
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-200">
                  계속 진행하면{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    이용약관
                  </Link>
                  {' '}및{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    개인정보처리방침
                  </Link>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}