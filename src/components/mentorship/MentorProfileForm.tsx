'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MentorProfile } from '@/types/mentorship'
import { database } from '@/lib/firebase'
import { ref, set, get } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

interface MentorProfileFormProps {
  sessionId: string
  onSave?: (profile: MentorProfile) => void
}

export default function MentorProfileForm({ sessionId, onSave }: MentorProfileFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<MentorProfile | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertiseAreas: [] as string[],
    experienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    industry: '',
    jobTitle: '',
    yearsOfExperience: 0,
    maxMentees: 2,
    preferredCommunicationStyle: 'mixed' as 'formal' | 'casual' | 'mixed',
    availableTimeSlots: [] as string[],
    feedbackStyle: 'structured' as 'detailed' | 'concise' | 'structured',
    isAvailable: true,
    timeZone: 'Asia/Seoul',
    preferredDays: [] as string[],
    preferredHours: [] as string[]
  })
  
  const [newExpertiseArea, setNewExpertiseArea] = useState('')
  const [newTimeSlot, setNewTimeSlot] = useState('')

  // 기존 프로필 로드
  useEffect(() => {
    if (!user || !sessionId) return

    const loadProfile = async () => {
      try {
        const profileRef = ref(database, `mentorProfiles/${sessionId}/${user.uid}`)
        const snapshot = await get(profileRef)
        
        if (snapshot.exists()) {
          const profile = snapshot.val() as MentorProfile
          setExistingProfile(profile)
          setFormData({
            name: profile.name,
            email: profile.email || '',
            expertiseAreas: profile.expertiseAreas,
            experienceLevel: profile.experienceLevel,
            industry: profile.industry || '',
            jobTitle: profile.jobTitle || '',
            yearsOfExperience: profile.yearsOfExperience || 0,
            maxMentees: profile.mentoringPreferences.maxMentees,
            preferredCommunicationStyle: profile.mentoringPreferences.preferredCommunicationStyle,
            availableTimeSlots: profile.mentoringPreferences.availableTimeSlots,
            feedbackStyle: profile.mentoringPreferences.feedbackStyle,
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
      const profile: MentorProfile = {
        userId: user.uid,
        sessionId,
        name: formData.name,
        email: formData.email,
        expertiseAreas: formData.expertiseAreas,
        experienceLevel: formData.experienceLevel,
        industry: formData.industry,
        jobTitle: formData.jobTitle,
        yearsOfExperience: formData.yearsOfExperience,
        mentoringPreferences: {
          maxMentees: formData.maxMentees,
          preferredCommunicationStyle: formData.preferredCommunicationStyle,
          availableTimeSlots: formData.availableTimeSlots,
          feedbackStyle: formData.feedbackStyle
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

      const profileRef = ref(database, `mentorProfiles/${sessionId}/${user.uid}`)
      await set(profileRef, profile)
      
      alert('멘토 프로필이 저장되었습니다!')
      onSave?.(profile)
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      alert('프로필 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addExpertiseArea = () => {
    if (newExpertiseArea.trim() && !formData.expertiseAreas.includes(newExpertiseArea.trim())) {
      setFormData(prev => ({
        ...prev,
        expertiseAreas: [...prev.expertiseAreas, newExpertiseArea.trim()]
      }))
      setNewExpertiseArea('')
    }
  }

  const removeExpertiseArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter(a => a !== area)
    }))
  }

  const addTimeSlot = () => {
    if (newTimeSlot.trim() && !formData.availableTimeSlots.includes(newTimeSlot.trim())) {
      setFormData(prev => ({
        ...prev,
        availableTimeSlots: [...prev.availableTimeSlots, newTimeSlot.trim()]
      }))
      setNewTimeSlot('')
    }
  }

  const removeTimeSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter(s => s !== slot)
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 멘토 프로필 설정</h2>
      
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 전문성 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              산업 분야
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              placeholder="예: IT, 금융, 제조업"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직책
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              placeholder="예: 시니어 개발자, 프로젝트 매니저"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              경험 수준 *
            </label>
            <select
              required
              value={formData.experienceLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="beginner">초급 (1-2년)</option>
              <option value="intermediate">중급 (3-5년)</option>
              <option value="advanced">고급 (6-10년)</option>
              <option value="expert">전문가 (10년 이상)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              경력 연수
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 전문 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전문 분야 *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newExpertiseArea}
              onChange={(e) => setNewExpertiseArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertiseArea())}
              placeholder="전문 분야 추가 (예: 프론트엔드 개발, 데이터 분석)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button type="button" onClick={addExpertiseArea} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.expertiseAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeExpertiseArea(area)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 멘티 수
              </label>
              <select
                value={formData.maxMentees}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMentees: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1명</option>
                <option value={2}>2명</option>
                <option value={3}>3명</option>
                <option value={4}>4명</option>
                <option value={5}>5명</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소통 스타일
              </label>
              <select
                value={formData.preferredCommunicationStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredCommunicationStyle: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="formal">공식적</option>
                <option value="casual">캐주얼</option>
                <option value="mixed">혼합</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피드백 스타일
              </label>
              <select
                value={formData.feedbackStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, feedbackStyle: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="detailed">상세한</option>
                <option value="concise">간결한</option>
                <option value="structured">구조화된</option>
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
              <span className="text-sm font-medium text-gray-700">멘토링 가능</span>
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
            disabled={loading || formData.expertiseAreas.length === 0}
            className="px-8"
          >
            {loading ? '저장 중...' : existingProfile ? '프로필 업데이트' : '프로필 생성'}
          </Button>
        </div>
      </form>
    </Card>
  )
}