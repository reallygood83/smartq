'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Session } from '@/lib/utils'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export default function SessionList() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

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
      } else {
        setSessions([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">세션 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 생성된 세션이 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          첫 번째 세션을 만들어 학생들과 함께 스마트한 학습을 시작해보세요.
        </p>
        <Link href="/teacher/session/create">
          <Button>
            첫 세션 만들기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {getSessionTypeIcon(session.sessionType)}
                </span>
                <h3 className="text-lg font-medium text-gray-900">
                  {session.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getSessionTypeLabel(session.sessionType)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>접속 코드: <span className="font-mono font-bold text-blue-600">{session.accessCode}</span></span>
                <span>생성일: {new Date(session.createdAt).toLocaleDateString()}</span>
              </div>

              {/* 교과목 태그 */}
              {session.subjects && session.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {session.subjects.map((subject) => (
                    <span
                      key={subject}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(subject)}`}
                    >
                      {getSubjectLabel(subject)}
                    </span>
                  ))}
                </div>
              )}

              {/* 학습 목표 */}
              {session.learningGoals && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">학습 목표:</span> {session.learningGoals}
                </p>
              )}

              {/* 키워드 */}
              {session.keywords && session.keywords.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">키워드:</span> {session.keywords.join(', ')}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Link href={`/teacher/session/${session.sessionId}`}>
                <Button size="sm">
                  세션 관리
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const studentUrl = `${window.location.origin}/student/session/${session.accessCode}`
                  navigator.clipboard.writeText(studentUrl)
                  alert('학생 접속 링크가 클립보드에 복사되었습니다!')
                }}
              >
                링크 복사
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}