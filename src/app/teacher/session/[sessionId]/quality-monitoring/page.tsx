'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import QualityMonitoringDashboard from '@/components/teacher/QualityMonitoringDashboard'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'
import Link from 'next/link'

export default function QualityMonitoringPage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!sessionId || typeof sessionId !== 'string') return

    // 세션 정보 로드
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSession(data as Session)
      }
      setSessionLoading(false)
    })

    // 질문 데이터 로드
    const questionsRef = ref(database, `questions/${sessionId}`)
    const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questionsList = Object.values(data) as Question[]
        questionsList.sort((a, b) => b.createdAt - a.createdAt)
        setQuestions(questionsList)
      } else {
        setQuestions([])
      }
    })

    return () => {
      unsubscribeSession()
      unsubscribeQuestions()
    }
  }, [sessionId])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (loading || sessionLoading) {
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              세션을 찾을 수 없습니다
            </h2>
            <Link href="/teacher/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/teacher/dashboard" className="hover:text-gray-700">대시보드</Link>
            <span className="mx-2">›</span>
            <Link href={`/teacher/session/${sessionId}`} className="hover:text-gray-700">
              {session.title}
            </Link>
            <span className="mx-2">›</span>
            <span>세션 품질 분석</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📈 세션 품질 분석</h1>
              <p className="text-gray-600">교수자/학습자 관점의 양방향 세션 평가</p>
            </div>
            <Link href={`/teacher/session/${sessionId}`}>
              <Button variant="outline">
                세션으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* API 키 확인 */}
        {!user || !getStoredApiKey(user.uid) ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                API 키 설정이 필요합니다
              </h3>
              <p className="text-gray-600 mb-6">
                AI 분석 기능을 사용하려면 Gemini API 키가 필요합니다.
              </p>
              <Link href="/teacher/settings">
                <Button>API 키 설정하기</Button>
              </Link>
            </div>
          </Card>
        ) : questions.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                분석할 질문이 없습니다
              </h3>
              <p className="text-gray-600">
                학생들이 질문을 제출하면 분석을 시작할 수 있습니다.
              </p>
            </div>
          </Card>
        ) : (
          /* 실시간 교육 품질 모니터링 */
          <QualityMonitoringDashboard
            questions={questions.map(q => q.text)}
            sessionType={session.sessionType}
            adultLearnerType={session?.adultLearnerType}
            userApiKey={user ? (getStoredApiKey(user.uid) || '') : ''}
            sessionData={{
              title: session.title,
              participantCount: session.participantCount,
              duration: session.duration,
              learningGoals: session.learningGoals,
              industryFocus: session.industryFocus,
              difficultyLevel: session.difficultyLevel
            }}
            realTimeData={{
              activeParticipants: questions.length, // 질문을 제출한 참여자 수로 근사치
              questionSubmissionRate: Math.min(100, (questions.length / parseInt(session?.participantCount?.split('-')[0] || '10')) * 100),
              avgResponseTime: 45, // 기본값
              sessionDuration: Math.floor((Date.now() - session.createdAt) / (1000 * 60)) // 세션 시작부터 현재까지의 시간
            }}
          />
        )}
      </div>
    </div>
  )
}