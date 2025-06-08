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
import { database } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'
import { Session } from '@/lib/utils'

export default function TeacherDashboardPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [latestSessionWithAnalysis, setLatestSessionWithAnalysis] = useState<Session | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 세션 목록 로드
  useEffect(() => {
    if (!user) return

    const sessionsRef = ref(database, 'sessions')
    const userSessionsQuery = query(sessionsRef, orderByChild('teacherId'), equalTo(user.uid))

    const unsubscribe = onValue(userSessionsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const sessionsList = Object.values(data) as Session[]
        // 최신순으로 정렬
        sessionsList.sort((a, b) => b.createdAt - a.createdAt)
        setSessions(sessionsList)
        
        // AI 분석 결과가 있는 가장 최근 세션 찾기
        const sessionWithAnalysis = sessionsList.find(session => session.aiAnalysisResult)
        setLatestSessionWithAnalysis(sessionWithAnalysis || null)
      } else {
        setSessions([])
        setLatestSessionWithAnalysis(null)
      }
      setSessionsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

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
            {sessionsLoading ? (
              <Button variant="outline" size="sm" disabled>
                로딩 중...
              </Button>
            ) : sessions.length > 0 ? (
              latestSessionWithAnalysis ? (
                <Link href={`/teacher/session/${latestSessionWithAnalysis.sessionId}`}>
                  <Button variant="outline" size="sm">
                    최근 분석 보기
                  </Button>
                </Link>
              ) : (
                <Link href={`/teacher/session/${sessions[0].sessionId}`}>
                  <Button variant="outline" size="sm">
                    세션 관리
                  </Button>
                </Link>
              )
            ) : (
              <Button variant="outline" size="sm" disabled>
                세션 필요
              </Button>
            )}
          </Card>
        </div>

        {/* 멘토-멘티 매칭 시스템 */}
        {sessions.some(session => session.isAdultEducation) && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  멘토-멘티 매칭 관리
                </h3>
              </div>
              <p className="text-gray-600 text-sm ml-13">
                성인 교육 세션에서 활성화된 멘토링 프로그램을 관리하세요.
              </p>
            </div>

            {/* 성인 교육 세션 목록 */}
            <div className="space-y-3">
              {sessions
                .filter(session => session.isAdultEducation)
                .map(session => (
                  <div key={session.sessionId} className="bg-white p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          세션 코드: <span className="font-mono font-bold">{session.accessCode}</span>
                        </p>
                      </div>
                      <Link href={`/teacher/mentorship/${session.sessionId}`}>
                        <Button size="sm">
                          매칭 관리
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* 교사가 할 수 있는 기능 설명 */}
            <div className="mt-6 p-4 bg-purple-100 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">📋 교사 권한으로 가능한 작업</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-purple-800">
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>참여자 프로필 조회 및 매칭 현황 확인</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>AI 매칭 알고리즘 실행 및 조정</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>매칭 품질 분석 및 개선 권고사항 확인</span>
                </div>
              </div>
            </div>
          </Card>
        )}

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