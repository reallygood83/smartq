'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import MentorProfileForm from '@/components/mentorship/MentorProfileForm'
import MenteeProfileForm from '@/components/mentorship/MenteeProfileForm'
import MatchingDashboard from '@/components/mentorship/MatchingDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function MentorshipPage() {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<'dashboard' | 'mentor' | 'mentee'>('dashboard')

  if (!sessionId || typeof sessionId !== 'string') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">잘못된 접근</h2>
            <p className="text-gray-600">유효하지 않은 세션 ID입니다.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤝 멘토-멘티 매칭 시스템
          </h1>
          <p className="text-gray-600 mb-6">
            AI 기반 알고리즘으로 최적의 멘토-멘티 매칭을 제공합니다.
            전문성, 경험 수준, 시간 가용성, 소통 스타일을 종합적으로 고려합니다.
          </p>
          
          {/* 네비게이션 버튼 */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setActiveView('dashboard')}
              variant={activeView === 'dashboard' ? 'default' : 'outline'}
            >
              📊 매칭 대시보드
            </Button>
            <Button
              onClick={() => setActiveView('mentor')}
              variant={activeView === 'mentor' ? 'default' : 'outline'}
            >
              🎯 멘토로 참여하기
            </Button>
            <Button
              onClick={() => setActiveView('mentee')}
              variant={activeView === 'mentee' ? 'default' : 'outline'}
            >
              🌱 멘티로 참여하기
            </Button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">멘토-멘티 매칭 가이드</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>1단계:</strong> 멘토 또는 멘티로 프로필을 작성하세요.</p>
                <p><strong>2단계:</strong> AI가 최적의 매칭 파트너를 찾아줍니다.</p>
                <p><strong>3단계:</strong> 매칭 제안을 검토하고 승인/거절하세요.</p>
                <p><strong>4단계:</strong> 승인된 매칭으로 멘토링을 시작하세요.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {activeView === 'dashboard' && (
            <MatchingDashboard sessionId={sessionId} />
          )}
          
          {activeView === 'mentor' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 멘토 프로필 설정</h2>
                <p className="text-gray-600">
                  후배 개발자들에게 경험과 지식을 전수하고 성장을 도와주세요.
                  자신의 전문 분야와 멘토링 스타일을 설정하면 적합한 멘티와 매칭해드립니다.
                </p>
              </div>
              <MentorProfileForm 
                sessionId={sessionId}
                onSave={() => {
                  setActiveView('dashboard')
                  alert('멘토 프로필이 저장되었습니다! 대시보드에서 매칭 결과를 확인하세요.')
                }}
              />
            </div>
          )}
          
          {activeView === 'mentee' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🌱 멘티 프로필 설정</h2>
                <p className="text-gray-600">
                  전문가의 조언과 가이드를 받아 더 빠르게 성장하세요.
                  학습 목표와 관심 분야를 설정하면 최적의 멘토와 매칭해드립니다.
                </p>
              </div>
              <MenteeProfileForm 
                sessionId={sessionId}
                onSave={() => {
                  setActiveView('dashboard')
                  alert('멘티 프로필이 저장되었습니다! 대시보드에서 매칭 결과를 확인하세요.')
                }}
              />
            </div>
          )}
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 기반 매칭</h3>
              <p className="text-sm text-gray-600">
                머신러닝 알고리즘이 성격, 경험, 목표를 분석하여 최적의 매칭을 제공합니다.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">성장 추적</h3>
              <p className="text-sm text-gray-600">
                멘토링 과정과 성과를 체계적으로 관리하고 지속적인 발전을 도모합니다.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">네트워킹</h3>
              <p className="text-sm text-gray-600">
                전문가 네트워크를 구축하고 업계 인사이트를 공유하는 플랫폼입니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}