'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEducationLevel } from '@/contexts/EducationLevelContext'
import { Header } from '@/components/common/Header'
import CreateSessionForm from '@/components/teacher/CreateSessionForm'
import AdultSessionForm from '@/components/teacher/AdultSessionForm'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CreateSessionPage() {
  const { user, loading } = useAuth()
  const { currentLevel } = useEducationLevel()
  const [mounted, setMounted] = useState(false)
  
  // 성인 교육 레벨인지 확인
  const isAdultEducation = currentLevel === 'adult' || currentLevel === 'university'

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
      
      {isAdultEducation ? (
        <AdultSessionForm />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 세션 만들기</h1>
            <p className="text-gray-600">
              학생들과 함께할 새로운 학습 세션을 만들어보세요.
            </p>
          </div>

          <CreateSessionForm />
        </div>
      )}
    </div>
  )
}