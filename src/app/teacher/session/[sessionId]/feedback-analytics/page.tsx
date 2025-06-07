'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import FeedbackHistoryDashboard from '@/components/feedback/FeedbackHistoryDashboard'
import { getStoredApiKey } from '@/lib/encryption'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Session } from '@/lib/utils'
import Link from 'next/link'

interface Participant {
  userId: string
  userName: string
  role: 'mentor' | 'mentee'
  feedbackCount: number
  averageQuality: number
  lastActivity: number
}

export default function FeedbackAnalyticsPage() {
  const { user, loading } = useAuth()
  const { sessionId } = useParams()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)
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
        loadParticipants(sessionId)
      }
      setSessionLoading(false)
    })

    return () => unsubscribeSession()
  }, [sessionId])

  const loadParticipants = (sessionId: string) => {
    // 멘토링 참여자 로드
    const mentorshipRef = ref(database, `mentorshipProfiles/${sessionId}`)
    onValue(mentorshipRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const profiles = Object.values(data) as any[]
        const participantList: Participant[] = []

        profiles.forEach(profile => {
          participantList.push({
            userId: profile.userId,
            userName: profile.userName || profile.userId,
            role: profile.role,
            feedbackCount: 0,
            averageQuality: 0,
            lastActivity: profile.lastActivity || Date.now()
          })
        })

        // 피드백 통계 로드
        const feedbackRef = ref(database, `feedbackResponses/${sessionId}`)
        onValue(feedbackRef, (feedbackSnapshot) => {
          const feedbackData = feedbackSnapshot.val()
          if (feedbackData) {
            const feedbacks = Object.values(feedbackData) as any[]
            
            // 각 참여자의 피드백 통계 계산
            participantList.forEach(participant => {
              const userFeedbacks = feedbacks.filter(f => 
                f.reviewerId === participant.userId || f.requesterId === participant.userId
              )
              
              participant.feedbackCount = userFeedbacks.length
              
              // 분석된 피드백의 평균 품질 계산
              const analysisRef = ref(database, `feedbackAnalyses/${sessionId}/individual`)
              onValue(analysisRef, (analysisSnapshot) => {
                const analysisData = analysisSnapshot.val()
                if (analysisData) {
                  const userAnalyses = Object.values(analysisData).filter((analysis: any) => 
                    userFeedbacks.some(f => f.responseId === analysis.feedbackId)
                  ) as any[]
                  
                  if (userAnalyses.length > 0) {
                    const totalQuality = userAnalyses.reduce((sum, analysis) => 
                      sum + (analysis.qualityScore?.overall || 0), 0
                    )
                    participant.averageQuality = Math.round(totalQuality / userAnalyses.length)
                  }
                }
              })
            })
          }
          
          setParticipants(participantList)
        })
      }
    })
  }

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
            <span>피드백 분석</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 피드백 성장 분석</h1>
              <p className="text-gray-600">{session.title} - 참여자별 피드백 성장 추적</p>
            </div>
            <Link href={`/teacher/session/${sessionId}`}>
              <Button variant="outline">
                세션으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* 참여자 목록 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 참여자 목록</h2>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              멘토링 참여자가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedParticipant === participant.userId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedParticipant(participant.userId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{participant.userName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participant.role === 'mentor' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {participant.role === 'mentor' ? '멘토' : '멘티'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">피드백 수:</span>
                      <span className="font-medium">{participant.feedbackCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균 품질:</span>
                      <span className="font-medium">
                        {participant.averageQuality > 0 ? `${participant.averageQuality}점` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">최근 활동:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(participant.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 선택된 참여자의 성장 추적 */}
        {selectedParticipant ? (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {participants.find(p => p.userId === selectedParticipant)?.userName}님의 성장 추적
              </h2>
              <p className="text-gray-600">
                개별 참여자의 피드백 품질 향상 과정을 분석합니다
              </p>
            </div>
            
            <FeedbackHistoryDashboard 
              userId={selectedParticipant}
              userType="all"
              userApiKey={getStoredApiKey() || ''}
            />
          </div>
        ) : (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                참여자를 선택하세요
              </h3>
              <p className="text-gray-600">
                위의 참여자 목록에서 분석하고 싶은 참여자를 클릭하세요.
              </p>
            </div>
          </Card>
        )}

        {/* 전체 세션 요약 */}
        {participants.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 세션 전체 요약</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
                <div className="text-sm text-blue-800">총 참여자 수</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {participants.filter(p => p.role === 'mentor').length}
                </div>
                <div className="text-sm text-green-800">멘토 수</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {participants.filter(p => p.role === 'mentee').length}
                </div>
                <div className="text-sm text-purple-800">멘티 수</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(participants.reduce((sum, p) => sum + p.averageQuality, 0) / participants.length) || 0}
                </div>
                <div className="text-sm text-orange-800">평균 피드백 품질</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}