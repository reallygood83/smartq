'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import LevelSelector from '@/components/common/LevelSelector'
import { getSessionTypeIcon, getSessionTypeLabel, getSessionTypeDescription, getRecommendedSessionTypes } from '@/lib/utils'
import { SessionType } from '@/lib/utils'
import { useEducationLevel, useSmartTerminology, useLevelMessages } from '@/contexts/EducationLevelContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const { levelConfig, currentLevel, getTerminology, getTheme, getCurrentTheme } = useEducationLevel()
  const { term, adapt, encouragement, sessionTerms } = useSmartTerminology()
  const { welcomeMessage, sessionStartMessage } = useLevelMessages()
  const { resolvedTheme } = useTheme()
  const theme = getCurrentTheme()

  // 교육 레벨에 따라 세션 타입 동적 선택
  const isAdultEducation = currentLevel === 'adult' || currentLevel === 'university'
  const recommendedTypes = getRecommendedSessionTypes(isAdultEducation)
  
  const sessionTypes = recommendedTypes.map(type => ({
    type,
    description: getSessionTypeDescription(type)
  }))

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div 
              className="text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Q
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Smart<span className="text-blue-600 dark:text-blue-400">Q</span>
          </h1>
          
          {/* 다크모드 상태 표시 (개발용 - 나중에 제거 가능) */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            현재 모드: <span className="font-semibold text-blue-600 dark:text-blue-400">
              {resolvedTheme === 'dark' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
            </span>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-2">
            {adapt('모든 질문이 스마트한 학습이 되는 곳')}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {adapt(`AI 기반 다교과 ${term('question')} 분석 및 ${term('activity')} 추천 서비스`)}
          </p>
          <button
            onClick={() => setShowLevelSelector(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <span className="text-lg">{levelConfig.displayName === '초등교육' ? '🎨' : levelConfig.displayName === '중등교육' ? '📚' : levelConfig.displayName === '고등교육' ? '🎓' : levelConfig.displayName === '대학교육' ? '🏛️' : '💼'}</span>
            <span>{levelConfig.displayName} • {levelConfig.ageRange}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-8">
            {levelConfig.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg" className="px-8 py-4 text-lg">
                {currentLevel === 'adult' ? `💼 ${term('instructor')}용 시작하기` : `🍎 ${term('instructor')}용 시작하기`}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => document.getElementById('student-access')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {currentLevel === 'adult' ? `🎯 ${term('class')} 참여하기` : `📚 ${term('participant')} ${term('class')} 참여`}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {adapt(`다양한 ${term('learning')} ${term('activity')}을(를) 지원합니다`)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionTypes.map((session, index) => (
              <Card 
                key={session.type} 
                hover={true}
                className="transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="text-center">
                  <div 
                    className="mb-4 transition-transform duration-300 hover:scale-110"
                    style={{ fontSize: '2.5rem' }}
                  >
                    {getSessionTypeIcon(session.type)}
                  </div>
                  <h3 
                    className="font-semibold mb-2"
                    style={{ 
                      fontSize: theme.typography.fontSize.lg,
                      color: theme.colors.text.primary
                    }}
                  >
                    {getSessionTypeLabel(session.type)}
                  </h3>
                  <p 
                    style={{ 
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  세션 코드로 참여하기
                </h2>
                <p className="text-gray-700 dark:text-gray-200 mb-6">
                  {getTerminology('teacher')}이 제공한 6자리 세션 코드를 입력하여 학습 활동에 참여하세요
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      세션 코드 (6자리)
                    </label>
                    <input
                      type="text"
                      id="sessionCode"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            SmartQ의 특별함
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{adapt('AI 기반 스마트 분석')}</h3>
              <p className="text-gray-700 dark:text-gray-200">
                {adapt(`Gemini AI가 ${term('participant')} ${term('question')}을(를) 분석하여 맞춤형 ${term('learning')} ${term('activity')}을(를) 제안합니다`)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">다교과 통합 지원</h3>
              <p className="text-gray-700 dark:text-gray-200">
                국어, 수학, 과학, 사회 등 모든 교과목에서 활용 가능한 유연한 플랫폼
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">실시간 협업</h3>
              <p className="text-gray-700 dark:text-gray-200">
                {getTerminology('teacher')}와 {getTerminology('student')}이 실시간으로 소통하며 함께 만들어가는 {getTerminology('class')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 dark:bg-slate-800 rounded-2xl p-12 border dark:border-slate-600">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            지금 시작해보세요!
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-8">
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

      {/* Level Selector Modal */}
      <LevelSelector 
        showModal={showLevelSelector}
        onClose={() => setShowLevelSelector(false)}
        allowLevelChange={true}
      />
    </>
  )
}