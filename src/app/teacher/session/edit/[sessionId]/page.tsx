'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { database } from '@/lib/firebase'
import { ref, get, update } from 'firebase/database'
import { Session, SessionType, Subject } from '@/lib/utils'
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
    keywordsInput: ''
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
            keywordsInput: (sessionData.keywords || []).join(', ')
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
      const updateData = {
        title: formData.title,
        sessionType: formData.sessionType,
        subjects: formData.subjects,
        learningGoals: formData.learningGoals,
        keywords: keywords,
        updatedAt: Date.now()
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
    { value: SessionType.DISCUSSION, label: '💭 토의/의견 나누기' }
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