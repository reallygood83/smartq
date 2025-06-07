'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import ApiKeySettings from '@/components/teacher/ApiKeySettings'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null // useEffect에서 리디렉션 처리
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ 설정</h1>
              <p className="text-gray-600 mt-2">
                SmartQ 서비스 이용을 위한 개인 설정을 관리합니다
              </p>
            </div>
            <Link href="/teacher/dashboard">
              <Button variant="outline">
                ← 대시보드로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* 사용자 정보 카드 */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 계정 정보</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">이메일</label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">사용자 ID</label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">{user.uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">가입일</label>
                  <p className="text-gray-900 mt-1">
                    {user.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString('ko-KR') 
                      : '정보 없음'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">마지막 로그인</label>
                  <p className="text-gray-900 mt-1">
                    {user.metadata?.lastSignInTime 
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ko-KR') 
                      : '정보 없음'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* API 키 설정 - 메인 컴포넌트 */}
        <ApiKeySettings className="mb-8" />

        {/* 빠른 액세스 메뉴 */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 빠른 액세스</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/teacher/session/create">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">➕</span>
                    <div>
                      <h3 className="font-medium text-gray-900">새 세션 만들기</h3>
                      <p className="text-sm text-gray-600">수업 세션을 생성합니다</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/teacher/dashboard">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-medium text-gray-900">대시보드</h3>
                      <p className="text-sm text-gray-600">세션 현황을 확인합니다</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/guide">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <h3 className="font-medium text-gray-900">이용 가이드</h3>
                      <p className="text-sm text-gray-600">사용법을 확인합니다</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Card>

        {/* 서비스 정보 */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ 서비스 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">SmartQ 버전</h3>
                  <p className="text-gray-600 text-sm">v1.0.0 - Beta</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">마지막 업데이트</h3>
                  <p className="text-gray-600 text-sm">2025년 1월</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">지원 교과목</h3>
                  <p className="text-gray-600 text-sm">국어, 수학, 과학, 사회, 영어 등</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">AI 모델</h3>
                  <p className="text-gray-600 text-sm">Google Gemini 1.5</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 지원 및 피드백 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🆘 지원 및 피드백</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">문의 및 지원</h3>
                <p className="text-sm text-blue-800 mb-3">
                  기술적 문제나 사용법에 대한 질문이 있으시면 언제든 연락해주세요.
                </p>
                <div className="flex space-x-3">
                  <a
                    href="mailto:support@smartq.ai"
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    📧 이메일 문의
                  </a>
                  <Link href="/guide">
                    <span className="text-sm text-blue-600 hover:text-blue-500 underline cursor-pointer">
                      📖 사용 가이드
                    </span>
                  </Link>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">서비스 개선 제안</h3>
                <p className="text-sm text-green-800 mb-3">
                  SmartQ를 더 나은 서비스로 만들기 위한 여러분의 의견을 기다립니다.
                </p>
                <a
                  href="mailto:feedback@smartq.ai?subject=SmartQ 개선 제안"
                  className="text-sm text-green-600 hover:text-green-500 underline"
                >
                  💡 개선 제안하기
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}