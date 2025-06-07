'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  MentorProfile, 
  MenteeProfile, 
  MentorshipMatch, 
  MentorshipAnalytics 
} from '@/types/mentorship'
import { 
  findBestMatches, 
  analyzeMatchingQuality, 
  recommendMentorsForMentee 
} from '@/lib/mentorshipMatching'
import { database } from '@/lib/firebase'
import { ref, get, set, onValue } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

interface MatchingDashboardProps {
  sessionId: string
}

export default function MatchingDashboard({ sessionId }: MatchingDashboardProps) {
  const { user } = useAuth()
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [mentees, setMentees] = useState<MenteeProfile[]>([])
  const [matches, setMatches] = useState<MentorshipMatch[]>([])
  const [analytics, setAnalytics] = useState<MentorshipAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'mentors' | 'mentees' | 'matches' | 'analytics'>('overview')

  // 데이터 로드
  useEffect(() => {
    if (!sessionId) return

    const loadData = () => {
      // 멘토 프로필 로드
      const mentorsRef = ref(database, `mentorProfiles/${sessionId}`)
      onValue(mentorsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const mentorsList = Object.values(data) as MentorProfile[]
          setMentors(mentorsList.filter(m => m.availability.isAvailable))
        } else {
          setMentors([])
        }
      })

      // 멘티 프로필 로드
      const menteesRef = ref(database, `menteeProfiles/${sessionId}`)
      onValue(menteesRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const menteesList = Object.values(data) as MenteeProfile[]
          setMentees(menteesList.filter(m => m.availability.isAvailable))
        } else {
          setMentees([])
        }
      })

      // 매칭 결과 로드
      const matchesRef = ref(database, `mentorshipMatches/${sessionId}`)
      onValue(matchesRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const matchesList = Object.values(data) as MentorshipMatch[]
          setMatches(matchesList)
        } else {
          setMatches([])
        }
      })
    }

    loadData()
  }, [sessionId])

  // 자동 매칭 실행
  const runMatching = async () => {
    if (mentors.length === 0 || mentees.length === 0) {
      alert('매칭을 위해서는 최소 1명의 멘토와 1명의 멘티가 필요합니다.')
      return
    }

    setLoading(true)
    
    try {
      // 매칭 알고리즘 실행
      const newMatches = findBestMatches(mentors, mentees)
      
      if (newMatches.length === 0) {
        alert('현재 설정으로는 적합한 매칭을 찾을 수 없습니다. 매칭 기준을 조정해보세요.')
        return
      }

      // Firebase에 저장
      const matchesRef = ref(database, `mentorshipMatches/${sessionId}`)
      const matchesData: { [key: string]: MentorshipMatch } = {}
      
      newMatches.forEach(match => {
        matchesData[match.matchId] = match
      })
      
      await set(matchesRef, matchesData)
      
      // 분석 결과 생성 및 저장
      const qualityAnalysis = analyzeMatchingQuality(newMatches)
      const analyticsData: MentorshipAnalytics = {
        sessionId,
        totalMatches: newMatches.length,
        activeMatches: newMatches.filter(m => m.status === 'active').length,
        completedMatches: newMatches.filter(m => m.status === 'completed').length,
        averageCompatibilityScore: qualityAnalysis.averageCompatibility,
        successRate: 0, // 초기값
        averageSessionDuration: 0, // 초기값
        topExpertiseAreas: calculateTopExpertiseAreas(mentors),
        participationRate: {
          mentors: mentors.length,
          mentees: mentees.length
        },
        satisfactionScores: {
          overall: 0, // 피드백 수집 후 계산
          mentorSatisfaction: 0,
          menteeSatisfaction: 0
        },
        improvementAreas: qualityAnalysis.recommendations,
        recommendations: qualityAnalysis.recommendations,
        generatedAt: Date.now()
      }
      
      const analyticsRef = ref(database, `mentorshipAnalytics/${sessionId}`)
      await set(analyticsRef, analyticsData)
      setAnalytics(analyticsData)
      
      alert(`${newMatches.length}개의 매칭이 성공적으로 생성되었습니다!`)
    } catch (error) {
      console.error('매칭 생성 오류:', error)
      alert('매칭 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 매칭 승인/거절
  const updateMatchStatus = async (matchId: string, status: 'accepted' | 'declined') => {
    try {
      const matchRef = ref(database, `mentorshipMatches/${sessionId}/${matchId}`)
      const snapshot = await get(matchRef)
      
      if (snapshot.exists()) {
        const match = snapshot.val() as MentorshipMatch
        const updatedMatch = {
          ...match,
          status,
          acceptedAt: status === 'accepted' ? Date.now() : undefined
        }
        
        await set(matchRef, updatedMatch)
        alert(`매칭이 ${status === 'accepted' ? '승인' : '거절'}되었습니다.`)
      }
    } catch (error) {
      console.error('매칭 상태 업데이트 오류:', error)
      alert('매칭 상태 업데이트에 실패했습니다.')
    }
  }

  const calculateTopExpertiseAreas = (mentors: MentorProfile[]) => {
    const areaCount: { [key: string]: number } = {}
    
    mentors.forEach(mentor => {
      mentor.expertiseAreas.forEach(area => {
        areaCount[area] = (areaCount[area] || 0) + 1
      })
    })
    
    return Object.entries(areaCount)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMatchStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중'
      case 'accepted': return '승인됨'
      case 'declined': return '거절됨'
      case 'active': return '진행 중'
      case 'completed': return '완료됨'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: '📊' },
            { id: 'mentors', label: '멘토', icon: '🎯' },
            { id: 'mentees', label: '멘티', icon: '🌱' },
            { id: 'matches', label: '매칭', icon: '🤝' },
            { id: 'analytics', label: '분석', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">멘토</h3>
                <p className="text-3xl font-bold text-blue-600">{mentors.length}명</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">멘티</h3>
                <p className="text-3xl font-bold text-green-600">{mentees.length}명</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">매칭</h3>
                <p className="text-3xl font-bold text-purple-600">{matches.length}개</p>
              </div>
            </div>
          </Card>

          <div className="md:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🚀 매칭 시작하기</h3>
                <Button
                  onClick={runMatching}
                  disabled={loading || mentors.length === 0 || mentees.length === 0}
                  className="px-6"
                >
                  {loading ? '매칭 중...' : '자동 매칭 실행'}
                </Button>
              </div>
              <p className="text-gray-600">
                AI 기반 알고리즘으로 멘토와 멘티 간의 최적 매칭을 자동으로 생성합니다.
                전문성, 시간 가용성, 소통 스타일 등을 종합적으로 고려합니다.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 멘토 탭 */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">등록된 멘토 ({mentors.length}명)</h3>
          </div>
          
          {mentors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">아직 등록된 멘토가 없습니다.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <Card key={mentor.userId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{mentor.name}</h4>
                      <p className="text-sm text-gray-600">{mentor.jobTitle} • {mentor.industry}</p>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertiseAreas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {area}
                            </span>
                          ))}
                          {mentor.expertiseAreas.length > 3 && (
                            <span className="text-xs text-gray-500">+{mentor.expertiseAreas.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        mentor.experienceLevel === 'expert' ? 'bg-purple-100 text-purple-800' :
                        mentor.experienceLevel === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        mentor.experienceLevel === 'intermediate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mentor.experienceLevel === 'expert' ? '전문가' :
                         mentor.experienceLevel === 'advanced' ? '고급' :
                         mentor.experienceLevel === 'intermediate' ? '중급' : '초급'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">최대 {mentor.mentoringPreferences.maxMentees}명</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 멘티 탭 */}
      {activeTab === 'mentees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">등록된 멘티 ({mentees.length}명)</h3>
          </div>
          
          {mentees.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">아직 등록된 멘티가 없습니다.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentees.map((mentee) => (
                <Card key={mentee.userId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{mentee.name}</h4>
                      <p className="text-sm text-gray-600">{mentee.industry}</p>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {mentee.interestedAreas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                            >
                              {area}
                            </span>
                          ))}
                          {mentee.interestedAreas.length > 3 && (
                            <span className="text-xs text-gray-500">+{mentee.interestedAreas.length - 3}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        목표: {mentee.learningGoals.slice(0, 2).join(', ')}
                        {mentee.learningGoals.length > 2 && '...'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        mentee.currentLevel === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        mentee.currentLevel === 'intermediate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mentee.currentLevel === 'advanced' ? '고급' :
                         mentee.currentLevel === 'intermediate' ? '중급' : '초급'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 매칭 탭 */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">매칭 결과 ({matches.length}개)</h3>
            {matches.length > 0 && (
              <div className="text-sm text-gray-600">
                평균 호환성: {(matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length * 100).toFixed(1)}%
              </div>
            )}
          </div>
          
          {matches.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">아직 생성된 매칭이 없습니다.</p>
              <Button 
                onClick={runMatching}
                disabled={mentors.length === 0 || mentees.length === 0}
                className="mt-4"
              >
                매칭 생성하기
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const mentor = mentors.find(m => m.userId === match.mentorId)
                const mentee = mentees.find(m => m.userId === match.menteeId)
                
                return (
                  <Card key={match.matchId} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{mentor?.name}</div>
                            <div className="text-xs text-gray-500">멘토</div>
                          </div>
                          <div className="text-2xl">↔️</div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{mentee?.name}</div>
                            <div className="text-xs text-gray-500">멘티</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">전문성 일치:</span>
                            <div className="font-medium">{(match.matchingFactors.expertiseAlignment * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">시간 일치:</span>
                            <div className="font-medium">{(match.matchingFactors.availabilityAlignment * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">소통 스타일:</span>
                            <div className="font-medium">{(match.matchingFactors.communicationStyleMatch * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">산업 일치:</span>
                            <div className="font-medium">{(match.matchingFactors.industryAlignment * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">경험 격차:</span>
                            <div className="font-medium">{(match.matchingFactors.experienceLevelGap * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold text-blue-600">
                          {(match.compatibilityScore * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match.status)}`}>
                            {getMatchStatusLabel(match.status)}
                          </span>
                        </div>
                        
                        {match.status === 'pending' && (user?.uid === match.mentorId || user?.uid === match.menteeId) && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => updateMatchStatus(match.matchId, 'accepted')}
                              className="text-xs"
                            >
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMatchStatus(match.matchId, 'declined')}
                              className="text-xs"
                            >
                              거절
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 분석 탭 */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalMatches}</div>
                  <div className="text-sm text-gray-600">전체 매칭</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.activeMatches}</div>
                  <div className="text-sm text-gray-600">활성 매칭</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(analytics.averageCompatibilityScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">평균 호환성</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.participationRate.mentors + analytics.participationRate.mentees}</div>
                  <div className="text-sm text-gray-600">총 참여자</div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 전문 분야</h3>
                <div className="space-y-2">
                  {analytics.topExpertiseAreas.map((area, index) => (
                    <div key={area.area} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">#{index + 1} {area.area}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(area.count / Math.max(...analytics.topExpertiseAreas.map(a => a.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{area.count}명</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {analytics.recommendations.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">개선 권장사항</h3>
                  <ul className="space-y-2">
                    {analytics.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">분석 데이터가 없습니다. 먼저 매칭을 실행해주세요.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}