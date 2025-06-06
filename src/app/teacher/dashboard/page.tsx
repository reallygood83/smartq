'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import SessionList from '@/components/teacher/SessionList'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TeacherDashboardPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                교사 대시보드
              </h1>
              <p className="text-gray-600">
                안녕하세요, {user.displayName || user.email}님! 
                SmartQ로 스마트한 교육을 시작해보세요.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/teacher/session/create">
                <Button>
                  + 새 세션 만들기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                API 키 설정
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              AI 기능 사용을 위해 Gemini API 키를 설정하세요.
            </p>
            <Link href="/teacher/settings">
              <Button variant="outline" size="sm">
                설정하기
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                세션 만들기
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              새로운 학습 세션을 만들고 학생들을 초대하세요.
            </p>
            <Link href="/teacher/session/create">
              <Button variant="outline" size="sm">
                만들기
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">3</span>
                </div>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                AI 분석 확인
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              학생 질문들을 AI가 분석한 결과를 확인하세요.
            </p>
            <Button variant="outline" size="sm" disabled>
              세션 필요
            </Button>
          </Card>
        </div>

        {/* 세션 목록 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              내 세션 목록
            </h2>
            <Link href="/teacher/session/create">
              <Button variant="outline" size="sm">
                + 새 세션
              </Button>
            </Link>
          </div>
          
          <SessionList />
        </Card>

        {/* 사용 가이드 링크 */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            SmartQ 사용법이 궁금하신가요?
          </p>
          <Link 
            href="/guide" 
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            사용 가이드 보기 →
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}