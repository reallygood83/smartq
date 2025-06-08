'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MenteeProfile } from '@/types/mentorship'
import { database } from '@/lib/firebase'
import { ref, set, get } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

interface MenteeProfileFormProps {
  sessionId: string
  onSave?: (profile: MenteeProfile) => void
}

export default function MenteeProfileForm({ sessionId, onSave }: MenteeProfileFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<MenteeProfile | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    learningGoals: [] as string[],
    currentLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    interestedAreas: [] as string[],
    industry: '',
    background: '',
    challengesNeeded: [] as string[],
    preferredMentorExperience: 'any' as 'any' | 'intermediate' | 'advanced' | 'expert',
    communicationStyle: 'mixed' as 'formal' | 'casual' | 'mixed',
    feedbackFrequency: 'weekly' as 'daily' | 'weekly' | 'bi-weekly' | 'monthly',
    learningStyle: 'visual' as 'visual' | 'auditory' | 'kinesthetic' | 'reading',
    isAvailable: true,
    timeZone: 'Asia/Seoul',
    preferredDays: [] as string[],
    preferredHours: [] as string[]
  })
  
  const [newLearningGoal, setNewLearningGoal] = useState('')
  const [newInterestedArea, setNewInterestedArea] = useState('')
  const [newChallenge, setNewChallenge] = useState('')

  // 기존 프로필 로드
  useEffect(() => {
    if (!user || !sessionId) return

    const loadProfile = async () => {
      try {
        const profileRef = ref(database, `menteeProfiles/${sessionId}/${user.uid}`)
        const snapshot = await get(profileRef)
        
        if (snapshot.exists()) {
          const profile = snapshot.val() as MenteeProfile
          setExistingProfile(profile)
          setFormData({
            name: profile.name,
            email: profile.email || '',
            learningGoals: profile.learningGoals,
            currentLevel: profile.currentLevel,
            interestedAreas: profile.interestedAreas,
            industry: profile.industry || '',
            background: profile.background || '',
            challengesNeeded: profile.challengesNeeded,
            preferredMentorExperience: profile.mentorshipPreferences.preferredMentorExperience,
            communicationStyle: profile.mentorshipPreferences.communicationStyle,
            feedbackFrequency: profile.mentorshipPreferences.feedbackFrequency,
            learningStyle: profile.mentorshipPreferences.learningStyle,
            isAvailable: profile.availability.isAvailable,
            timeZone: profile.availability.timeZone,
            preferredDays: profile.availability.preferredDays,
            preferredHours: profile.availability.preferredHours
          })
        } else {
          // 기본값 설정
          setFormData(prev => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || ''
          }))
        }
      } catch (error) {
        console.error('프로필 로드 오류:', error)
      }
    }

    loadProfile()
  }, [user, sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    
    try {
      const profile: MenteeProfile = {
        userId: user.uid,
        sessionId,
        name: formData.name,
        email: formData.email,
        learningGoals: formData.learningGoals,
        currentLevel: formData.currentLevel,
        interestedAreas: formData.interestedAreas,
        industry: formData.industry,
        background: formData.background,
        challengesNeeded: formData.challengesNeeded,
        mentorshipPreferences: {
          preferredMentorExperience: formData.preferredMentorExperience,
          communicationStyle: formData.communicationStyle,
          feedbackFrequency: formData.feedbackFrequency,
          learningStyle: formData.learningStyle
        },
        availability: {
          isAvailable: formData.isAvailable,
          timeZone: formData.timeZone,
          preferredDays: formData.preferredDays,
          preferredHours: formData.preferredHours
        },
        createdAt: existingProfile?.createdAt || Date.now(),
        updatedAt: Date.now()
      }

      const profileRef = ref(database, `menteeProfiles/${sessionId}/${user.uid}`)
      await set(profileRef, profile)
      
      alert('멘티 프로필이 저장되었습니다!')
      onSave?.(profile)
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      alert('프로필 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addLearningGoal = () => {
    if (newLearningGoal.trim() && !formData.learningGoals.includes(newLearningGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        learningGoals: [...prev.learningGoals, newLearningGoal.trim()]
      }))
      setNewLearningGoal('')
    }
  }

  const removeLearningGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.filter(g => g !== goal)
    }))
  }

  const addInterestedArea = () => {
    if (newInterestedArea.trim() && !formData.interestedAreas.includes(newInterestedArea.trim())) {
      setFormData(prev => ({
        ...prev,
        interestedAreas: [...prev.interestedAreas, newInterestedArea.trim()]
      }))
      setNewInterestedArea('')
    }
  }

  const removeInterestedArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      interestedAreas: prev.interestedAreas.filter(a => a !== area)
    }))
  }

  const addChallenge = () => {
    if (newChallenge.trim() && !formData.challengesNeeded.includes(newChallenge.trim())) {
      setFormData(prev => ({
        ...prev,
        challengesNeeded: [...prev.challengesNeeded, newChallenge.trim()]
      }))
      setNewChallenge('')
    }
  }

  const removeChallenge = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      challengesNeeded: prev.challengesNeeded.filter(c => c !== challenge)
    }))
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }))
  }

  const toggleHour = (hour: string) => {
    setFormData(prev => ({
      ...prev,
      preferredHours: prev.preferredHours.includes(hour)
        ? prev.preferredHours.filter(h => h !== hour)
        : [...prev.preferredHours, hour]
    }))
  }

  const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
  const hours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🌱 멘티 프로필 설정</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* 배경 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 수준 *
            </label>
            <select
              required
              value={formData.currentLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            >
              <option value="beginner">초급 (경험 1-2년)</option>
              <option value="intermediate">중급 (경험 3-5년)</option>
              <option value="advanced">고급 (경험 6년 이상)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 산업 분야
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              placeholder="예: IT, 금융, 제조업"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* 배경 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배경 소개
          </label>
          <textarea
            rows={3}
            value={formData.background}
            onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
            placeholder="현재 하고 있는 일이나 학습 배경을 간단히 소개해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* 학습 목표 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학습 목표 *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLearningGoal}
              onChange={(e) => setNewLearningGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningGoal())}
              placeholder="달성하고 싶은 학습 목표 (예: React 마스터하기)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <Button type="button" onClick={addLearningGoal} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.learningGoals.map((goal) => (
              <span
                key={goal}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => removeLearningGoal(goal)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 관심 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관심 분야 *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newInterestedArea}
              onChange={(e) => setNewInterestedArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterestedArea())}
              placeholder="관심 있는 분야 (예: 프론트엔드 개발, 데이터 분석)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <Button type="button" onClick={addInterestedArea} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interestedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeInterestedArea(area)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 필요한 도전 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            필요한 도전/개선 영역
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newChallenge}
              onChange={(e) => setNewChallenge(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChallenge())}
              placeholder="개선하고 싶은 영역 (예: 코드 리뷰 받기, 발표 능력)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <Button type="button" onClick={addChallenge} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.challengesNeeded.map((challenge) => (
              <span
                key={challenge}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {challenge}
                <button
                  type="button"
                  onClick={() => removeChallenge(challenge)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 멘토링 선호사항 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">멘토링 선호사항</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선호하는 멘토 경험 수준
              </label>
              <select
                value={formData.preferredMentorExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredMentorExperience: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="any">상관없음</option>
                <option value="intermediate">중급 이상</option>
                <option value="advanced">고급 이상</option>
                <option value="expert">전문가</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소통 스타일
              </label>
              <select
                value={formData.communicationStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, communicationStyle: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="formal">공식적</option>
                <option value="casual">캐주얼</option>
                <option value="mixed">혼합</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피드백 빈도
              </label>
              <select
                value={formData.feedbackFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, feedbackFrequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="daily">매일</option>
                <option value="weekly">주 1회</option>
                <option value="bi-weekly">2주 1회</option>
                <option value="monthly">월 1회</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 스타일
              </label>
              <select
                value={formData.learningStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, learningStyle: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="visual">시각적</option>
                <option value="auditory">청각적</option>
                <option value="kinesthetic">체험적</option>
                <option value="reading">독서/문서</option>
              </select>
            </div>
          </div>
        </div>

        {/* 시간 가용성 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">시간 가용성</h3>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">멘토링 참여 가능</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선호 요일
              </label>
              <div className="grid grid-cols-2 gap-2">
                {days.map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="mr-2"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선호 시간대
              </label>
              <div className="grid grid-cols-2 gap-2">
                {hours.map((hour) => (
                  <label key={hour} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredHours.includes(hour)}
                      onChange={() => toggleHour(hour)}
                      className="mr-2"
                    />
                    <span className="text-sm">{hour}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="submit"
            disabled={loading || formData.learningGoals.length === 0 || formData.interestedAreas.length === 0}
            className="px-8"
          >
            {loading ? '저장 중...' : existingProfile ? '프로필 업데이트' : '프로필 생성'}
          </Button>
        </div>
      </form>
    </Card>
  )
}