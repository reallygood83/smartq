'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ApiKeySettings } from '@/components/teacher/ApiKeySettings'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TeacherSettingsPage() {
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">SmartQ 서비스 이용을 위한 설정을 관리하세요.</p>
        </div>

        <div className="space-y-6">
          {/* API 키 설정 */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                AI 분석 설정
              </h2>
              <p className="text-gray-600">
                질문 분석 및 교육 활동 추천을 위한 Gemini API 키를 설정하세요.
              </p>
            </div>
            
            <ApiKeySettings />
          </Card>

          {/* 프로필 설정 */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                프로필 정보
              </h2>
              <p className="text-gray-600">
                교사 프로필 정보를 관리하세요.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={user?.displayName || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </Card>

          {/* 계정 관리 */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                계정 관리
              </h2>
              <p className="text-gray-600">
                계정 관련 설정을 관리하세요.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/teacher/dashboard'}
              >
                대시보드로 돌아가기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}