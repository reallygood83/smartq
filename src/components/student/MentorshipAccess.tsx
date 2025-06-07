'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MentorProfile, MenteeProfile, MentorshipMatch } from '@/types/mentorship'
import { database } from '@/lib/firebase'
import { ref, get, onValue } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

interface MentorshipAccessProps {
  sessionId: string
}

export default function MentorshipAccess({ sessionId }: MentorshipAccessProps) {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<MentorProfile | MenteeProfile | null>(null)
  const [userMatches, setUserMatches] = useState<MentorshipMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [profileType, setProfileType] = useState<'mentor' | 'mentee' | null>(null)

  useEffect(() => {
    if (!user || !sessionId) return

    const loadUserData = async () => {
      try {
        // 멘토 프로필 확인
        const mentorRef = ref(database, `mentorProfiles/${sessionId}/${user.uid}`)
        const mentorSnapshot = await get(mentorRef)
        
        if (mentorSnapshot.exists()) {
          setUserProfile(mentorSnapshot.val())
          setProfileType('mentor')
          
          // 멘토의 매칭 로드
          const matchesRef = ref(database, `mentorshipMatches/${sessionId}`)
          onValue(matchesRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
              const matches = Object.values(data) as MentorshipMatch[]
              const userMatches = matches.filter(match => match.mentorId === user.uid)
              setUserMatches(userMatches)
            }
          })
        } else {
          // 멘티 프로필 확인
          const menteeRef = ref(database, `menteeProfiles/${sessionId}/${user.uid}`)
          const menteeSnapshot = await get(menteeRef)
          
          if (menteeSnapshot.exists()) {
            setUserProfile(menteeSnapshot.val())
            setProfileType('mentee')
            
            // 멘티의 매칭 로드
            const matchesRef = ref(database, `mentorshipMatches/${sessionId}`)
            onValue(matchesRef, (snapshot) => {
              const data = snapshot.val()
              if (data) {
                const matches = Object.values(data) as MentorshipMatch[]
                const userMatches = matches.filter(match => match.menteeId === user.uid)
                setUserMatches(userMatches)
              }
            })
          }
        }
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, sessionId])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">멘토링 정보를 불러오는 중...</div>
      </Card>
    )
  }

  // 프로필이 없는 경우
  if (!userProfile) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">멘토-멘티 매칭 참여하기</h3>
          <p className="text-blue-800 mb-4 text-sm">
            전문가와의 1:1 멘토링으로 더 빠른 성장을 경험하세요!
          </p>
          <div className="space-y-2">
            <Link href={`/student/mentorship/${sessionId}?type=mentor`}>
              <Button className="w-full mb-2">
                🎯 멘토로 참여하기
              </Button>
            </Link>
            <Link href={`/student/mentorship/${sessionId}?type=mentee`}>
              <Button variant="outline" className="w-full">
                🌱 멘티로 참여하기
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // 프로필은 있지만 매칭이 없는 경우
  if (userMatches.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {profileType === 'mentor' ? '🎯 멘토' : '🌱 멘티'} 매칭 대기 중
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            최적의 {profileType === 'mentor' ? '멘티' : '멘토'}를 찾고 있습니다. 조금만 기다려주세요!
          </p>
          <Link href={`/student/mentorship/${sessionId}?type=${profileType}`}>
            <Button variant="outline" size="sm">
              프로필 수정하기
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  // 활성 매칭이 있는 경우
  const activeMatches = userMatches.filter(match => match.status === 'accepted' || match.status === 'active')
  const pendingMatches = userMatches.filter(match => match.status === 'pending')

  return (
    <div className="space-y-4">
      {/* 활성 매칭 */}
      {activeMatches.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🤝 나의 {profileType === 'mentor' ? '멘티' : '멘토'}
          </h3>
          <div className="space-y-3">
            {activeMatches.map((match) => (
              <div key={match.matchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">{profileType === 'mentor' ? '🌱' : '🎯'}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {profileType === 'mentor' ? '멘티' : '멘토'} 매칭
                      </div>
                      <div className="text-sm text-gray-600">
                        호환성: {(match.compatibilityScore * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-x-2">
                  <Link href={`/student/mentorship/${sessionId}/chat/${match.matchId}`}>
                    <Button size="sm">
                      💬 대화하기
                    </Button>
                  </Link>
                  <Link href={`/student/mentorship/${sessionId}/feedback/${match.matchId}`}>
                    <Button size="sm" variant="outline">
                      📝 피드백
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 대기 중인 매칭 */}
      {pendingMatches.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⏳ 매칭 제안 ({pendingMatches.length}개)
          </h3>
          <div className="space-y-3">
            {pendingMatches.map((match) => (
              <div key={match.matchId} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        새로운 {profileType === 'mentor' ? '멘티' : '멘토'} 매칭 제안
                      </div>
                      <div className="text-sm text-gray-600">
                        호환성: {(match.compatibilityScore * 100).toFixed(1)}% • 검토 필요
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-x-2">
                  <Link href={`/student/mentorship/${sessionId}/match/${match.matchId}`}>
                    <Button size="sm">
                      자세히 보기
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 내 프로필 요약 */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">
              {profileType === 'mentor' ? '🎯 멘토' : '🌱 멘티'} 프로필
            </h4>
            <p className="text-sm text-gray-600">{userProfile.name}</p>
          </div>
          <Link href={`/student/mentorship/${sessionId}?type=${profileType}`}>
            <Button size="sm" variant="outline">
              수정하기
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}