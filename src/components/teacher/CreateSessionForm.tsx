'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SessionType, Subject, Session, Material, generateSessionCode } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { database } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'
import { useRouter } from 'next/navigation'

export default function CreateSessionForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.GENERAL)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [learningGoals, setLearningGoals] = useState('')
  const [keywords, setKeywords] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])

  // Material form state
  const [newMaterial, setNewMaterial] = useState<Material>({
    type: 'text',
    content: ''
  })

  const handleSubjectChange = (subject: Subject, checked: boolean) => {
    if (checked) {
      setSubjects(prev => [...prev, subject])
    } else {
      setSubjects(prev => prev.filter(s => s !== subject))
    }
  }

  const addMaterial = () => {
    if (!newMaterial.content && !newMaterial.url) return
    
    setMaterials(prev => [...prev, { ...newMaterial }])
    setNewMaterial({ type: 'text', content: '' })
  }

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateSession = async () => {
    if (!title.trim() || !user) return

    setIsLoading(true)
    try {
      const accessCode = generateSessionCode()
      const sessionData: Session = {
        sessionId: '', // Will be set by Firebase
        title: title.trim(),
        accessCode,
        createdAt: Date.now(),
        teacherId: user.uid,
        sessionType,
        subjects,
        learningGoals: learningGoals.trim() || undefined,
        materials: materials.length > 0 ? materials : undefined,
        keywords: keywords.trim() ? keywords.split(',').map(k => k.trim()).filter(k => k) : undefined
      }

      const sessionsRef = ref(database, 'sessions')
      const newSessionRef = push(sessionsRef)
      sessionData.sessionId = newSessionRef.key!
      
      await set(newSessionRef, sessionData)
      
      router.push(`/teacher/session/${sessionData.sessionId}`)
    } catch (error) {
      console.error('세션 생성 실패:', error)
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">새 세션 만들기</h2>
        
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              세션 제목 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 5학년 과학 - 물의 순환"
              required
            />
          </div>

          {/* 세션 유형 */}
          <div>
            <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-2">
              세션 유형 *
            </label>
            <select
              id="sessionType"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={SessionType.GENERAL}>일반 Q&A</option>
              <option value={SessionType.DEBATE}>토론/논제 발굴</option>
              <option value={SessionType.INQUIRY}>탐구 활동</option>
              <option value={SessionType.PROBLEM}>문제 해결</option>
              <option value={SessionType.CREATIVE}>창작 활동</option>
              <option value={SessionType.DISCUSSION}>토의/의견 나누기</option>
            </select>
          </div>

          {/* 교과목 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교과목 (다중 선택 가능)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.values(Subject).map((subject) => (
                <label key={subject} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subjects.includes(subject)}
                    onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {subject === Subject.KOREAN && '국어'}
                    {subject === Subject.MATH && '수학'}
                    {subject === Subject.SCIENCE && '과학'}
                    {subject === Subject.SOCIAL && '사회'}
                    {subject === Subject.ENGLISH && '영어'}
                    {subject === Subject.ART && '미술'}
                    {subject === Subject.MUSIC && '음악'}
                    {subject === Subject.PE && '체육'}
                    {subject === Subject.PRACTICAL && '실과'}
                    {subject === Subject.MORAL && '도덕'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 학습 목표 */}
          <div>
            <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700 mb-2">
              학습 목표 (선택사항)
            </label>
            <textarea
              id="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="이 세션을 통해 달성하고자 하는 학습 목표를 입력하세요."
            />
          </div>

          {/* 키워드 */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              키워드 (선택사항)
            </label>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="관련 키워드를 쉼표로 구분하여 입력 (예: 물의 순환, 증발, 응결)"
            />
          </div>
        </div>
      </Card>

      {/* 학습 자료 */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">학습 자료 (선택사항)</h3>
        
        {/* 자료 추가 폼 */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newMaterial.type}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">텍스트</option>
              <option value="youtube">YouTube 동영상</option>
              <option value="link">웹 링크</option>
            </select>
            
            {newMaterial.type === 'text' && (
              <input
                type="text"
                value={newMaterial.content || ''}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, content: e.target.value }))}
                placeholder="텍스트 내용"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2"
              />
            )}
            
            {(newMaterial.type === 'youtube' || newMaterial.type === 'link') && (
              <input
                type="url"
                value={newMaterial.url || ''}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                placeholder={newMaterial.type === 'youtube' ? 'YouTube URL' : '웹사이트 URL'}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2"
              />
            )}
          </div>
          
          <Button onClick={addMaterial} variant="outline" size="sm">
            자료 추가
          </Button>
        </div>

        {/* 추가된 자료 목록 */}
        {materials.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">추가된 자료:</h4>
            {materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 uppercase">{material.type}</span>
                  <p className="text-sm text-gray-900">
                    {material.content || material.url || material.linkTitle}
                  </p>
                </div>
                <Button
                  onClick={() => removeMaterial(index)}
                  variant="outline"
                  size="sm"
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 생성 버튼 */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button
          onClick={handleCreateSession}
          disabled={!title.trim() || isLoading}
          isLoading={isLoading}
        >
          세션 만들기
        </Button>
      </div>
    </div>
  )
}