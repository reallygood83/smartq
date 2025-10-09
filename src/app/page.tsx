'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import LevelSelector from '@/components/common/LevelSelector'
import { getSessionTypeIcon, getSessionTypeLabel, getSessionTypeDescription, getRecommendedSessionTypes } from '@/lib/utils'
import { SessionType } from '@/lib/utils'
import { useEducationLevel, useSmartTerminology, useLevelMessages } from '@/contexts/EducationLevelContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const { levelConfig, currentLevel, getCurrentTheme } = useEducationLevel()
  const { term, adapt } = useSmartTerminology()
  const { resolvedTheme } = useTheme()
  const theme = getCurrentTheme()

  const isAdultEducation = currentLevel === 'adult' || currentLevel === 'university'
  const recommendedTypes = getRecommendedSessionTypes(isAdultEducation)

  const sessionTypes = recommendedTypes.map(type => ({
    type,
    description: getSessionTypeDescription(type)
  }))

  return (
    <>
      <Header />

      {/* Hero Section - Enhanced with gradient and modern design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Logo with animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div
                  className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300"
                >
                  Q
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
              Smart<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Q</span>
            </h1>

            <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {adapt('AI로 질문을 분석하고')}
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                {adapt('최적의 학습 활동을 추천합니다')}
              </span>
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Gemini AI 기반 실시간 질문 분석 · 다교과 통합 지원 · 맞춤형 활동 추천
            </p>

            {/* Level Selector Badge */}
            <button
              onClick={() => setShowLevelSelector(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mb-10 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-2xl">{levelConfig.displayName === '초등교육' ? '🎨' : levelConfig.displayName === '중등교육' ? '📚' : levelConfig.displayName === '고등교육' ? '🎓' : levelConfig.displayName === '대학교육' ? '🏛️' : '💼'}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{levelConfig.displayName}</span>
              <Badge variant="secondary">{levelConfig.ageRange}</Badge>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/teacher/dashboard">
                <Button size="lg" className="px-10 py-6 text-lg shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  🍎 {term('instructor')}용 시작하기
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-6 text-lg shadow-lg hover:shadow-xl border-2"
                onClick={() => document.getElementById('student-access')?.scrollIntoView({ behavior: 'smooth' })}
              >
                📚 {term('participant')} 참여하기
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                무료 사용 가능
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                실시간 협업
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Gemini AI 지원
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">핵심 기능</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              SmartQ가 특별한 이유
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              교사와 강사의 수업을 더욱 효과적으로 만드는 AI 기반 학습 도구
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: AI Analysis */}
            <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">AI 기반 스마트 분석</CardTitle>
                <CardDescription className="text-base">
                  Gemini 2.5 Flash를 활용한 실시간 질문 분석 및 클러스터링
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    유사 질문 자동 그룹화
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    핵심 개념 자동 추출
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    맞춤형 활동 추천
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2: Multi-Subject */}
            <Card className="border-2 hover:border-green-500 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">다교과 통합 지원</CardTitle>
                <CardDescription className="text-base">
                  모든 교과목과 학습 영역에서 활용 가능
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    국어·수학·과학·사회 등
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    융합 교육 활동 지원
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    교과 연계 추천
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3: Real-time Collaboration */}
            <Card className="border-2 hover:border-purple-500 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">실시간 협업</CardTitle>
                <CardDescription className="text-base">
                  교사와 학생이 함께 만들어가는 수업
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    즉시 질문 수집
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    익명 참여 옵션
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    질문 좋아요 기능
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Session Types Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">다양한 학습 활동</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {adapt(`모든 ${term('learning')} ${term('activity')}을 지원합니다`)}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              토론, 탐구, 문제해결부터 창작 활동까지
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionTypes.map((session, index) => (
              <Card
                key={session.type}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-500"
              >
                <CardHeader>
                  <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {getSessionTypeIcon(session.type)}
                  </div>
                  <CardTitle className="text-xl">
                    {getSessionTypeLabel(session.type)}
                  </CardTitle>
                  <CardDescription>
                    {session.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Access Section */}
      <section id="student-access" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="text-6xl">📚</div>
              <CardTitle className="text-3xl">세션 코드로 참여하기</CardTitle>
              <CardDescription className="text-lg">
                선생님이 제공한 6자리 세션 코드를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="sessionCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  세션 코드 (6자리)
                </label>
                <input
                  type="text"
                  id="sessionCode"
                  className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl font-mono uppercase tracking-widest focus:ring-4 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all"
                  placeholder="ABC123"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>

              <Link href={sessionCode ? `/student/session/${sessionCode}` : '#'}>
                <Button
                  className="w-full py-6 text-lg"
                  size="lg"
                  disabled={sessionCode.length !== 6}
                >
                  {sessionCode.length === 6 ? '세션 참여하기 →' : '6자리 코드를 입력하세요'}
                </Button>
              </Link>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                💡 세션 코드는 대소문자를 구분하지 않습니다
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">사용 방법</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              3단계로 시작하세요
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">세션 생성</h3>
              <p className="text-gray-600 dark:text-gray-300">
                교과목과 학습 주제를 선택하고<br />새로운 세션을 만듭니다
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">질문 수집</h3>
              <p className="text-gray-600 dark:text-gray-300">
                학생들이 세션 코드로 참여하여<br />자유롭게 질문을 제출합니다
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI 분석</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI가 질문을 분석하고<br />최적의 학습 활동을 추천합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">자주 묻는 질문</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              궁금한 점이 있으신가요?
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                SmartQ는 무료인가요?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base pt-4">
                네! SmartQ는 완전 무료로 사용하실 수 있습니다. 개인 Gemini API 키만 있으면 모든 기능을 제한 없이 이용할 수 있습니다.
                Google AI Studio에서 무료로 API 키를 발급받을 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Gemini API 키는 어떻게 발급받나요?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base pt-4">
                Google AI Studio(ai.google.dev)에 접속하여 무료로 API 키를 발급받을 수 있습니다.
                자세한 방법은 사용 가이드를 참고하세요. API 키는 브라우저에 안전하게 저장되며 서버로 전송되지 않습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                학생 수에 제한이 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base pt-4">
                학생 수 제한은 없습니다. Firebase Realtime Database를 사용하여 실시간 데이터 동기화를 제공하므로,
                수백 명의 학생이 동시에 참여해도 원활하게 작동합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                어떤 교과목에서 사용할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base pt-4">
                국어, 수학, 과학, 사회, 영어 등 모든 교과목에서 사용 가능합니다. 또한 토론, 탐구, 문제해결, 창작 등
                다양한 학습 활동 유형을 지원하여 융합 교육에도 활용하실 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                학생 개인정보는 안전한가요?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base pt-4">
                학생들은 익명으로 참여할 수 있으며, 세션 코드만으로 접속이 가능합니다.
                개인정보를 수집하지 않으며, 모든 데이터는 안전하게 암호화되어 관리됩니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            AI가 분석하고 추천하는 맞춤형 학습 활동으로<br />
            수업을 더욱 효과적으로 만들어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg" variant="secondary" className="px-10 py-6 text-lg shadow-xl hover:shadow-2xl">
                교사용 대시보드 시작하기
              </Button>
            </Link>
            <Link href="/guide">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-xl hover:shadow-2xl">
                📖 완전 사용 가이드 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
