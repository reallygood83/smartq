'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import LevelSelector from '@/components/common/LevelSelector'
import { getSessionTypeIcon, getSessionTypeLabel } from '@/lib/utils'
import { SessionType } from '@/lib/utils'
import { useEducationLevel } from '@/contexts/EducationLevelContext'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const { levelConfig, currentLevel, getTerminology, getTheme } = useEducationLevel()

  const sessionTypes = [
    {
      type: SessionType.GENERAL,
      description: '자유로운 질문과 답변으로 시작하는 기본 활동'
    },
    {
      type: SessionType.DEBATE,
      description: '토론 주제를 발굴하고 다양한 관점 탐색'
    },
    {
      type: SessionType.INQUIRY,
      description: '과학적 탐구와 실험 설계 활동'
    },
    {
      type: SessionType.PROBLEM,
      description: '수학적 사고와 논리적 문제 해결'
    },
    {
      type: SessionType.CREATIVE,
      description: '창의적 표현과 상상력 발휘 활동'
    },
    {
      type: SessionType.DISCUSSION,
      description: '협력적 토의와 의견 공유'
    }
  ]

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold">
              Q
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Smart<span className="text-blue-600">Q</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            모든 질문이 스마트한 학습이 되는 곳
          </p>
          <p className="text-lg text-gray-500 mb-2">
            AI 기반 다교과 질문 분석 및 활동 추천 서비스
          </p>
          <div 
            className="inline-block px-4 py-2 rounded-full text-white font-medium"
            style={{ backgroundColor: getTheme().primaryColor }}
          >
            {levelConfig.displayName} • {levelConfig.ageRange}
          </div>
          <p className="text-sm text-gray-500 mt-2 mb-8">
            {levelConfig.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg" className="px-8 py-4 text-lg">
                {currentLevel === 'adult' ? `💼 ${getTerminology('teacher')}용 시작하기` : `🍎 ${getTerminology('teacher')}용 시작하기`}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => document.getElementById('student-access')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {currentLevel === 'adult' ? `🎯 세션 참여하기` : `📚 ${getTerminology('student')} 세션 참여`}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            다양한 학습 활동을 지원합니다
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionTypes.map((session) => (
              <Card key={session.type} className="hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {getSessionTypeIcon(session.type)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getSessionTypeLabel(session.type)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {session.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Access Section */}
        <div id="student-access" className="mb-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  세션 코드로 참여하기
                </h2>
                <p className="text-gray-600 mb-6">
                  {getTerminology('teacher')}이 제공한 6자리 세션 코드를 입력하여 학습 활동에 참여하세요
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-2">
                      세션 코드 (6자리)
                    </label>
                    <input
                      type="text"
                      id="sessionCode"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: ABC123"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  
                  <Link href={sessionCode ? `/student/session/${sessionCode}` : '#'}>
                    <Button 
                      fullWidth 
                      size="lg" 
                      disabled={sessionCode.length !== 6}
                      className="py-3"
                    >
                      세션 참여하기
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            SmartQ의 특별함
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI 기반 스마트 분석</h3>
              <p className="text-gray-600">
                Gemini AI가 {getTerminology('student')} 질문을 분석하여 맞춤형 학습 활동을 제안합니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">다교과 통합 지원</h3>
              <p className="text-gray-600">
                국어, 수학, 과학, 사회 등 모든 교과목에서 활용 가능한 유연한 플랫폼
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">실시간 협업</h3>
              <p className="text-gray-600">
                {getTerminology('teacher')}와 {getTerminology('student')}이 실시간으로 소통하며 함께 만들어가는 {getTerminology('class')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 시작해보세요!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            무료로 사용할 수 있으며, 개인 Gemini API 키만 있으면 모든 기능을 이용하실 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg" className="px-8 py-4">
                {getTerminology('teacher')}용 대시보드
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 py-4">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  )
}