'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ref, push, set } from 'firebase/database'
import { database } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useEducationLevel, useSmartTerminology, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { SessionType, Subject, generateSessionCode, getSessionTypeIcon, getSessionTypeLabel, getSessionTypeDescription, ADULT_SESSION_TYPES } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'

interface AdultSessionFormData {
  title: string
  sessionType: SessionType
  adultLearnerType: AdultLearnerType
  subjects: Subject[]
  learningGoals: string
  targetAudience: string
  prerequisites: string
  duration: string
  participantCount: string
  materials: string
  keywords: string[]
  industryFocus: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  deliveryFormat: 'in-person' | 'online' | 'hybrid'
  certificationOffered: boolean
  networkingOpportunities: boolean
}

export default function AdultSessionForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentLevel } = useEducationLevel()
  const { term, adapt } = useSmartTerminology()
  const theme = useFullTheme()
  
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  
  const [formData, setFormData] = useState<AdultSessionFormData>({
    title: '',
    sessionType: SessionType.SEMINAR,
    adultLearnerType: AdultLearnerType.PROFESSIONAL,
    subjects: [],
    learningGoals: '',
    targetAudience: '',
    prerequisites: '',
    duration: '',
    participantCount: '',
    materials: '',
    keywords: [],
    industryFocus: '',
    difficultyLevel: 'intermediate',
    deliveryFormat: 'in-person',
    certificationOffered: false,
    networkingOpportunities: false
  })

  // 콘텐츠 공유 상태
  const [sharedContents, setSharedContents] = useState<Array<{
    id: string
    title: string
    content: string
    type: 'text' | 'link' | 'youtube' | 'instruction'
  }>>([])
  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'link' | 'youtube' | 'instruction'
  })

  const handleInputChange = (field: keyof AdultSessionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubjectToggle = (subject: Subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !selectedKeywords.includes(newKeyword.trim())) {
      const updated = [...selectedKeywords, newKeyword.trim()]
      setSelectedKeywords(updated)
      setFormData(prev => ({ ...prev, keywords: updated }))
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    const updated = selectedKeywords.filter(k => k !== keyword)
    setSelectedKeywords(updated)
    setFormData(prev => ({ ...prev, keywords: updated }))
  }

  const handleAddContent = () => {
    if (!newContent.title.trim() || !newContent.content.trim()) return

    const content = {
      id: Date.now().toString(),
      title: newContent.title.trim(),
      content: newContent.content.trim(),
      type: newContent.type
    }

    setSharedContents(prev => [...prev, content])
    setNewContent({ title: '', content: '', type: 'text' })
  }

  const handleRemoveContent = (id: string) => {
    setSharedContents(prev => prev.filter(c => c.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !database) return

    setIsLoading(true)
    
    try {
      const sessionData = {
        ...formData,
        sessionId: generateSessionCode(),
        accessCode: generateSessionCode(),
        createdAt: Date.now(),
        teacherId: user.uid,
        isAdultEducation: true,
        educationLevel: currentLevel
      }

      // 세션 생성
      const sessionsRef = ref(database, 'sessions')
      const newSessionRef = await push(sessionsRef, sessionData)
      const newSessionId = newSessionRef.key

      // 콘텐츠가 있으면 함께 저장
      if (sharedContents.length > 0 && newSessionId) {
        const sharedContentsRef = ref(database, `sharedContents/${newSessionId}`)
        
        for (const content of sharedContents) {
          const contentData = {
            contentId: content.id,
            title: content.title,
            content: content.content,
            type: content.type,
            createdAt: Date.now(),
            sessionId: newSessionId,
            teacherId: user.uid
          }
          
          const contentRef = ref(database, `sharedContents/${newSessionId}/${content.id}`)
          await set(contentRef, contentData)
        }
      }

      // 세션 관리 페이지로 이동
      router.push(`/teacher/session/${newSessionId}`)
    } catch (error) {
      console.error('세션 생성 실패:', error)
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const adultLearnerTypes = [
    { type: AdultLearnerType.PROFESSIONAL, label: '직업 전문가', icon: '💼' },
    { type: AdultLearnerType.RESKILLING, label: '재교육/전환', icon: '🔄' },
    { type: AdultLearnerType.UPSKILLING, label: '역량 강화', icon: '📈' },
    { type: AdultLearnerType.DEGREE_COMPLETION, label: '학위 완성', icon: '🎓' },
    { type: AdultLearnerType.LIFELONG_LEARNING, label: '평생 학습', icon: '🌱' }
  ]

  const subjects = [
    { type: Subject.KOREAN, label: '언어/커뮤니케이션' },
    { type: Subject.MATH, label: '수리/통계' },
    { type: Subject.SCIENCE, label: '과학/기술' },
    { type: Subject.SOCIAL, label: '사회/경영' },
    { type: Subject.ENGLISH, label: '외국어' },
    { type: Subject.ART, label: '창의/디자인' },
    { type: Subject.PRACTICAL, label: '실무/기술' }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 
          className="font-bold mb-2"
          style={{ 
            fontSize: theme.typography.fontSize['3xl'],
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.primary
          }}
        >
          {adapt('성인 교육 세션 생성')}
        </h1>
        <p style={{ color: theme.colors.text.secondary }}>
          전문적인 성인 학습자를 위한 맞춤형 세션을 만들어보세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <Card>
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
            📋 기본 정보
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                세션 제목 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="예: 디지털 마케팅 전략과 실무 적용"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.text.primary }}>
                  세션 유형 *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ADULT_SESSION_TYPES.map(type => (
                    <label key={type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="sessionType"
                        value={type}
                        checked={formData.sessionType === type}
                        onChange={(e) => handleInputChange('sessionType', e.target.value as SessionType)}
                        className="mr-3"
                      />
                      <span className="text-2xl mr-3">{getSessionTypeIcon(type)}</span>
                      <div>
                        <div className="font-medium">{getSessionTypeLabel(type)}</div>
                        <div className="text-sm text-gray-600">{getSessionTypeDescription(type)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.text.primary }}>
                  학습자 유형 *
                </label>
                <div className="space-y-3">
                  {adultLearnerTypes.map(({ type, label, icon }) => (
                    <label key={type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="adultLearnerType"
                        value={type}
                        checked={formData.adultLearnerType === type}
                        onChange={(e) => handleInputChange('adultLearnerType', e.target.value as AdultLearnerType)}
                        className="mr-3"
                      />
                      <span className="text-xl mr-3">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 학습 목표 및 대상 */}
        <Card>
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
            🎯 학습 목표 및 대상
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                학습 목표 *
              </label>
              <textarea
                required
                rows={4}
                value={formData.learningGoals}
                onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="이 세션을 통해 학습자가 달성하게 될 구체적인 목표를 작성하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                대상 참여자 *
              </label>
              <textarea
                required
                rows={3}
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="예: 마케팅 실무 2-5년차, 스타트업 창업자, 중소기업 경영진"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                사전 요구사항
              </label>
              <textarea
                rows={3}
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="참여를 위해 필요한 사전 지식, 경험, 준비물 등"
              />
            </div>
          </div>
        </Card>

        {/* 세션 세부사항 */}
        <Card>
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
            ⚙️ 세션 세부사항
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                예상 시간
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
              >
                <option value="">선택하세요</option>
                <option value="1-2시간">1-2시간</option>
                <option value="반나절 (3-4시간)">반나절 (3-4시간)</option>
                <option value="하루 (6-8시간)">하루 (6-8시간)</option>
                <option value="2-3일">2-3일</option>
                <option value="1주일">1주일</option>
                <option value="1개월">1개월</option>
                <option value="3개월 이상">3개월 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                참여 인원
              </label>
              <select
                value={formData.participantCount}
                onChange={(e) => handleInputChange('participantCount', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
              >
                <option value="">선택하세요</option>
                <option value="1-5명 (소규모)">1-5명 (소규모)</option>
                <option value="6-15명 (중규모)">6-15명 (중규모)</option>
                <option value="16-30명 (중대규모)">16-30명 (중대규모)</option>
                <option value="31-50명 (대규모)">31-50명 (대규모)</option>
                <option value="50명 이상 (대형)">50명 이상 (대형)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                난이도 수준
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
              >
                <option value="beginner">초급 (Beginner)</option>
                <option value="intermediate">중급 (Intermediate)</option>
                <option value="advanced">고급 (Advanced)</option>
                <option value="expert">전문가 (Expert)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                진행 방식
              </label>
              <select
                value={formData.deliveryFormat}
                onChange={(e) => handleInputChange('deliveryFormat', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
              >
                <option value="in-person">대면 진행</option>
                <option value="online">온라인 진행</option>
                <option value="hybrid">하이브리드 (대면+온라인)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                산업 분야
              </label>
              <input
                type="text"
                value={formData.industryFocus}
                onChange={(e) => handleInputChange('industryFocus', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="예: IT, 금융, 제조업, 서비스업"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.certificationOffered}
                  onChange={(e) => handleInputChange('certificationOffered', e.target.checked)}
                  className="mr-2"
                />
                <span style={{ color: theme.colors.text.primary }}>수료증/인증서 제공</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.networkingOpportunities}
                  onChange={(e) => handleInputChange('networkingOpportunities', e.target.checked)}
                  className="mr-2"
                />
                <span style={{ color: theme.colors.text.primary }}>네트워킹 기회 제공</span>
              </label>
            </div>
          </div>
        </Card>

        {/* 과목 및 키워드 */}
        <Card>
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
            🏷️ 과목 및 키워드
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.text.primary }}>
                관련 분야 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {subjects.map(({ type, label }) => (
                  <label key={type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(type)}
                      onChange={() => handleSubjectToggle(type)}
                      className="mr-2"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                키워드 태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ borderColor: theme.colors.border }}
                  placeholder="키워드 입력 후 추가 버튼 클릭"
                />
                <Button type="button" onClick={handleAddKeyword} variant="outline">
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                준비 자료 및 도구
              </label>
              <textarea
                rows={3}
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ borderColor: theme.colors.border }}
                placeholder="세션에 필요한 자료, 도구, 플랫폼 등을 설명하세요"
              />
            </div>
          </div>
        </Card>

        {/* 콘텐츠 공유 */}
        <Card>
          <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
            📚 콘텐츠 공유 (선택사항)
          </h2>
          
          <div className="space-y-6">
            {/* 콘텐츠 추가 폼 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.text.primary }}>
                새 콘텐츠 추가
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                      제목
                    </label>
                    <input
                      type="text"
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.colors.border }}
                      placeholder="콘텐츠 제목"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                      유형
                    </label>
                    <select
                      value={newContent.type}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <option value="text">📄 텍스트</option>
                      <option value="link">🔗 링크</option>
                      <option value="youtube">🎬 유튜브</option>
                      <option value="instruction">📋 안내사항</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    내용
                  </label>
                  <textarea
                    rows={4}
                    value={newContent.content}
                    onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ borderColor: theme.colors.border }}
                    placeholder={
                      newContent.type === 'link' 
                        ? "https://example.com" 
                        : newContent.type === 'youtube'
                        ? "https://youtube.com/watch?v=... 또는 https://youtu.be/..."
                        : newContent.type === 'instruction'
                        ? "참여자들에게 전달할 안내사항"
                        : "공유할 텍스트 내용"
                    }
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleAddContent}
                    variant="outline"
                    disabled={!newContent.title.trim() || !newContent.content.trim()}
                  >
                    콘텐츠 추가
                  </Button>
                </div>
              </div>
            </div>

            {/* 추가된 콘텐츠 목록 */}
            {sharedContents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.text.primary }}>
                  추가된 콘텐츠 ({sharedContents.length}개)
                </h3>
                
                <div className="space-y-3">
                  {sharedContents.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">
                            {content.type === 'text' ? '📄' : 
                             content.type === 'link' ? '🔗' : 
                             content.type === 'youtube' ? '🎬' : '📋'}
                          </span>
                          <h4 className="font-medium" style={{ color: theme.colors.text.primary }}>
                            {content.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {content.content}
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveContent(content.id)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? '생성 중...' : '세션 생성하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}