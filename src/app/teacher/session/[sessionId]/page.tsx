'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import SessionManager from '@/components/teacher/SessionManager'
import AnalysisHistoryDashboard from '@/components/teacher/AnalysisHistoryDashboard'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SessionManagePage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'manage' | 'analysis'>('manage')

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

  if (!sessionId || typeof sessionId !== 'string') {
    redirect('/teacher/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'manage'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🎯 세션 관리
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📊 분석 기록
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        {activeTab === 'manage' && (
          <SessionManager sessionId={sessionId} />
        )}

        {activeTab === 'analysis' && (
          <AnalysisHistoryDashboard sessionId={sessionId} />
        )}
      </div>
    </div>
  )
}