'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { database } from '@/lib/firebase'
import { ref, get, update } from 'firebase/database'
import { Session, SessionType, Subject, getSessionTypeLabel, getSessionTypeIcon, ADULT_SESSION_TYPES } from '@/lib/utils'
import { AdultLearnerType } from '@/types/education'
import { redirect } from 'next/navigation'

export default function EditSessionPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    sessionType: SessionType.GENERAL,
    subjects: [] as Subject[],
    learningGoals: '',
    keywords: [] as string[],
    keywordsInput: '',
    // Adult education fields
    adultLearnerType: AdultLearnerType.PROFESSIONAL,
    targetAudience: '',
    prerequisites: '',
    duration: '',
    participantCount: '',
    industryFocus: '',
    difficultyLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    deliveryFormat: 'in-person' as 'in-person' | 'online' | 'hybrid',
    certificationOffered: false,
    networkingOpportunities: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 세션 데이터 로드
  useEffect(() => {
    if (!user || !sessionId) return

    const loadSession = async () => {
      try {
        const sessionRef = ref(database, `sessions/${sessionId}`)
        const snapshot = await get(sessionRef)
        
        if (snapshot.exists()) {
          const sessionData = snapshot.val() as Session
          
          // 교사 권한 확인
          if (sessionData.teacherId !== user.uid) {
            alert('세션을 수정할 권한이 없습니다.')
            router.push('/teacher/dashboard')
            return
          }
          
          setSession(sessionData)
          setFormData({
            title: sessionData.title,
            sessionType: sessionData.sessionType,
            subjects: sessionData.subjects || [],
            learningGoals: sessionData.learningGoals || '',
            keywords: sessionData.keywords || [],
            keywordsInput: (sessionData.keywords || []).join(', '),
            // Adult education fields
            adultLearnerType: sessionData.adultLearnerType || AdultLearnerType.PROFESSIONAL,
            targetAudience: sessionData.targetAudience || '',
            prerequisites: sessionData.prerequisites || '',
            duration: sessionData.duration || '',
            participantCount: sessionData.participantCount || '',
            industryFocus: sessionData.industryFocus || '',
            difficultyLevel: sessionData.difficultyLevel || 'intermediate',
            deliveryFormat: sessionData.deliveryFormat || 'in-person',
            certificationOffered: sessionData.certificationOffered || false,
            networkingOpportunities: sessionData.networkingOpportunities || false
          })
        } else {
          alert('세션을 찾을 수 없습니다.')
          router.push('/teacher/dashboard')
        }
      } catch (error) {
        console.error('세션 로드 오류:', error)
        alert('세션을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [user, sessionId, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    redirect('/auth/login')
  }

  if (!session) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 키워드 처리
      const keywords = formData.keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      // 세션 업데이트 데이터
      const updateData: any = {
        title: formData.title,
        sessionType: formData.sessionType,
        subjects: formData.subjects,
        learningGoals: formData.learningGoals,
        keywords: keywords,
        updatedAt: Date.now()
      }

      // 성인 교육 세션인 경우 추가 필드 포함
      if (session?.isAdultEducation) {
        updateData.adultLearnerType = formData.adultLearnerType
        updateData.targetAudience = formData.targetAudience
        updateData.prerequisites = formData.prerequisites
        updateData.duration = formData.duration
        updateData.participantCount = formData.participantCount
        updateData.industryFocus = formData.industryFocus
        updateData.difficultyLevel = formData.difficultyLevel
        updateData.deliveryFormat = formData.deliveryFormat
        updateData.certificationOffered = formData.certificationOffered
        updateData.networkingOpportunities = formData.networkingOpportunities
      }

      const sessionRef = ref(database, `sessions/${sessionId}`)
      await update(sessionRef, updateData)

      alert('세션이 성공적으로 수정되었습니다!')
      router.push('/teacher/dashboard')
    } catch (error) {
      console.error('세션 수정 오류:', error)
      alert('세션 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const sessionTypes = [
    { value: SessionType.GENERAL, label: '❓ 일반 Q&A' },
    { value: SessionType.DEBATE, label: '💬 토론/논제 발굴' },
    { value: SessionType.INQUIRY, label: '🔬 탐구 활동' },
    { value: SessionType.PROBLEM, label: '🧮 문제 해결' },
    { value: SessionType.CREATIVE, label: '🎨 창작 활동' },
    { value: SessionType.DISCUSSION, label: '💭 토의/의견 나누기' },
    
    // Adult education session types
    { value: SessionType.CORPORATE_TRAINING, label: '🏢 기업 연수' },
    { value: SessionType.UNIVERSITY_LECTURE, label: '🎓 대학 강의' },
    { value: SessionType.SEMINAR, label: '📊 세미나' },
    { value: SessionType.WORKSHOP, label: '🔧 워크샵' },
    { value: SessionType.CONFERENCE, label: '🎤 컨퍼런스' },
    { value: SessionType.PROFESSIONAL_DEV, label: '📈 전문 개발' },
    { value: SessionType.CERTIFICATION, label: '🏆 자격증 과정' },
    { value: SessionType.MENTORING, label: '👨‍🏫 멘토링' },
    { value: SessionType.NETWORKING, label: '🤝 네트워킹' }
  ]

  const subjects = [
    { value: Subject.KOREAN, label: '국어', color: 'bg-red-100 text-red-800' },
    { value: Subject.MATH, label: '수학', color: 'bg-blue-100 text-blue-800' },
    { value: Subject.SCIENCE, label: '과학', color: 'bg-green-100 text-green-800' },
    { value: Subject.SOCIAL, label: '사회', color: 'bg-yellow-100 text-yellow-800' },
    { value: Subject.ENGLISH, label: '영어', color: 'bg-purple-100 text-purple-800' },
    { value: Subject.ART, label: '미술', color: 'bg-pink-100 text-pink-800' },
    { value: Subject.MUSIC, label: '음악', color: 'bg-indigo-100 text-indigo-800' },
    { value: Subject.PE, label: '체육', color: 'bg-orange-100 text-orange-800' },
    { value: Subject.PRACTICAL, label: '실과', color: 'bg-teal-100 text-teal-800' },
    { value: Subject.MORAL, label: '도덕', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            세션 수정
          </h1>
          <p className="text-gray-600">
            세션 정보를 수정하고 업데이트하세요.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 세션 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                세션 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 물의 성질에 대한 탐구"
              />
            </div>

            {/* 세션 유형 */}
            <div>
              <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-2">
                세션 유형 *
              </label>
              <select
                id="sessionType"
                name="sessionType"
                required
                value={formData.sessionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sessionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 교과목 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                교과목 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {subjects.map(subject => (
                  <button
                    key={subject.value}
                    type="button"
                    onClick={() => handleSubjectToggle(subject.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      formData.subjects.includes(subject.value)
                        ? `${subject.color} border-current`
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {subject.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 학습 목표 */}
            <div>
              <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700 mb-2">
                학습 목표
              </label>
              <textarea
                id="learningGoals"
                name="learningGoals"
                rows={3}
                value={formData.learningGoals}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이 세션에서 달성하고자 하는 학습 목표를 작성해주세요"
              />
            </div>

            {/* 키워드 */}
            <div>
              <label htmlFor="keywordsInput" className="block text-sm font-medium text-gray-700 mb-2">
                키워드
              </label>
              <input
                type="text"
                id="keywordsInput"
                name="keywordsInput"
                value={formData.keywordsInput}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="쉼표로 구분하여 입력 (예: 물, 끓는점, 상태변화)"
              />
              <p className="mt-1 text-sm text-gray-500">
                AI가 질문을 분석할 때 참고할 키워드를 입력하세요
              </p>
            </div>

            {/* 성인 교육 세션 추가 필드 */}
            {session?.isAdultEducation && (
              <>
                {/* 성인 학습자 유형 */}
                <div>
                  <label htmlFor="adultLearnerType" className="block text-sm font-medium text-gray-700 mb-2">
                    학습자 유형 *
                  </label>
                  <select
                    id="adultLearnerType"
                    name="adultLearnerType"
                    value={formData.adultLearnerType}
                    onChange={(e) => setFormData(prev => ({ ...prev, adultLearnerType: e.target.value as AdultLearnerType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={AdultLearnerType.PROFESSIONAL}>현업 전문가</option>
                    <option value={AdultLearnerType.RESKILLING}>재교육 대상자</option>
                    <option value={AdultLearnerType.UPSKILLING}>역량 강화 대상자</option>
                    <option value={AdultLearnerType.DEGREE_COMPLETION}>학위 완성 과정</option>
                    <option value={AdultLearnerType.LIFELONG_LEARNING}>평생학습자</option>
                  </select>
                </div>

                {/* 대상 청중 */}
                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                    대상 청중
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 중간 관리자, 신입 개발자, 창업 희망자"
                  />
                </div>

                {/* 선수 요건 */}
                <div>
                  <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-2">
                    선수 요건
                  </label>
                  <textarea
                    id="prerequisites"
                    name="prerequisites"
                    rows={2}
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="참여에 필요한 사전 지식이나 경험을 입력하세요"
                  />
                </div>

                {/* 지속 시간과 참가자 수 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      소요 시간
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="30분">30분</option>
                      <option value="1시간">1시간</option>
                      <option value="2시간">2시간</option>
                      <option value="반나절">반나절 (4시간)</option>
                      <option value="하루">하루 (8시간)</option>
                      <option value="2일">2일</option>
                      <option value="3일">3일</option>
                      <option value="1주">1주</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="participantCount" className="block text-sm font-medium text-gray-700 mb-2">
                      참가자 수
                    </label>
                    <select
                      id="participantCount"
                      name="participantCount"
                      value={formData.participantCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="5-10명">5-10명</option>
                      <option value="10-20명">10-20명</option>
                      <option value="20-50명">20-50명</option>
                      <option value="50-100명">50-100명</option>
                      <option value="100명 이상">100명 이상</option>
                    </select>
                  </div>
                </div>

                {/* 산업 분야와 난이도 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industryFocus" className="block text-sm font-medium text-gray-700 mb-2">
                      산업 분야
                    </label>
                    <input
                      type="text"
                      id="industryFocus"
                      name="industryFocus"
                      value={formData.industryFocus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: IT, 제조업, 금융, 의료"
                    />
                  </div>

                  <div>
                    <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      난이도
                    </label>
                    <select
                      id="difficultyLevel"
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                      <option value="expert">전문가</option>
                    </select>
                  </div>
                </div>

                {/* 진행 방식 */}
                <div>
                  <label htmlFor="deliveryFormat" className="block text-sm font-medium text-gray-700 mb-2">
                    진행 방식
                  </label>
                  <select
                    id="deliveryFormat"
                    name="deliveryFormat"
                    value={formData.deliveryFormat}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryFormat: e.target.value as 'in-person' | 'online' | 'hybrid' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="in-person">대면</option>
                    <option value="online">온라인</option>
                    <option value="hybrid">하이브리드</option>
                  </select>
                </div>

                {/* 추가 옵션 */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="certificationOffered"
                      name="certificationOffered"
                      checked={formData.certificationOffered}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificationOffered: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="certificationOffered" className="ml-2 block text-sm text-gray-700">
                      수료증 제공
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="networkingOpportunities"
                      name="networkingOpportunities"
                      checked={formData.networkingOpportunities}
                      onChange={(e) => setFormData(prev => ({ ...prev, networkingOpportunities: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="networkingOpportunities" className="ml-2 block text-sm text-gray-700">
                      네트워킹 기회 제공
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* 세션 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">세션 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">접속 코드:</span>
                  <span className="font-mono font-bold text-blue-600 ml-2">{session.accessCode}</span>
                </div>
                <div>
                  <span className="text-gray-500">생성일:</span>
                  <span className="ml-2">{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/teacher/dashboard')}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '세션 수정'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}