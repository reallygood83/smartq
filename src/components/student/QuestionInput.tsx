'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { SessionType } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'

interface QuestionInputProps {
  sessionId: string
  sessionType: SessionType
}

export default function QuestionInput({ sessionId, sessionType }: QuestionInputProps) {
  const [questionText, setQuestionText] = useState('')
  const [studentName, setStudentName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentId, setStudentId] = useState('')

  // 학생 ID 초기화
  useEffect(() => {
    let id = localStorage.getItem('smartq_student_id')
    if (!id) {
      id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('smartq_student_id', id)
    }
    setStudentId(id)
  }, [])

  const getPlaceholderText = (type: SessionType): string => {
    switch (type) {
      case SessionType.DEBATE:
        return '토론하고 싶은 주제나 궁금한 점을 자유롭게 질문해보세요. 예: "환경보호를 위해 일회용품 사용을 금지해야 할까요?"'
      case SessionType.INQUIRY:
        return '탐구하고 싶은 점이나 실험해보고 싶은 것을 질문해보세요. 예: "식물은 어떻게 물을 빨아올릴까요?"'
      case SessionType.PROBLEM:
        return '해결하고 싶은 문제나 어려운 점을 질문해보세요. 예: "분수의 나눗셈이 왜 곱셈으로 바뀌나요?"'
      case SessionType.CREATIVE:
        return '창작 활동과 관련된 아이디어나 질문을 해보세요. 예: "우리 반만의 특별한 이야기를 만들려면 어떻게 해야 할까요?"'
      case SessionType.DISCUSSION:
        return '함께 이야기하고 싶은 주제를 제안해보세요. 예: "우리가 살고 싶은 미래 도시는 어떤 모습일까요?"'
      default:
        return '궁금한 점이나 배우고 싶은 것을 자유롭게 질문해보세요.'
    }
  }

  const getHelpText = (type: SessionType): string => {
    switch (type) {
      case SessionType.DEBATE:
        return '💡 좋은 토론 주제 만들기: 찬성과 반대 의견이 모두 가능한 주제, 여러 관점에서 생각할 수 있는 주제'
      case SessionType.INQUIRY:
        return '🔬 탐구 질문 만들기: "왜?", "어떻게?", "무엇이?" 로 시작하는 질문, 직접 확인해볼 수 있는 질문'
      case SessionType.PROBLEM:
        return '🧮 문제 해결하기: 구체적인 어려움이나 궁금한 원리, 실생활과 연결된 문제'
      case SessionType.CREATIVE:
        return '🎨 창작 아이디어: 새로운 것을 만들고 싶은 아이디어, 상상력을 발휘할 수 있는 주제'
      case SessionType.DISCUSSION:
        return '💭 토의 주제: 정답이 정해지지 않은 열린 질문, 서로의 경험과 생각을 나눌 수 있는 주제'
      default:
        return '❓ 자유롭게 질문하세요: 수업과 관련된 모든 궁금한 점을 편하게 물어보세요'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!questionText.trim()) {
      alert('질문을 입력해주세요.')
      return
    }

    if (!isAnonymous && !studentName.trim()) {
      alert('이름을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const questionsRef = ref(database, `questions/${sessionId}`)
      const newQuestionRef = push(questionsRef)
      
      const questionData = {
        questionId: newQuestionRef.key,
        text: questionText.trim(),
        studentName: isAnonymous ? null : studentName.trim(),
        studentId: studentId, // 학생 식별을 위한 ID 추가
        isAnonymous,
        createdAt: Date.now(),
        sessionId
      }

      await set(newQuestionRef, questionData)
      
      // 폼 초기화
      setQuestionText('')
      if (!isAnonymous) setStudentName('')
      
      alert('질문이 성공적으로 제출되었습니다!')
    } catch (error) {
      console.error('질문 제출 오류:', error)
      alert('질문 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 도움말 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {getHelpText(sessionType)}
        </p>
      </div>

      {/* 익명 설정 */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="anonymous"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(true)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">익명으로 질문하기</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="anonymous"
            checked={!isAnonymous}
            onChange={() => setIsAnonymous(false)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">이름을 남기고 질문하기</span>
        </label>
      </div>

      {/* 이름 입력 (익명이 아닌 경우) */}
      {!isAnonymous && (
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이름
          </label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="이름을 입력하세요"
            required={!isAnonymous}
          />
        </div>
      )}

      {/* 질문 입력 */}
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          질문 내용
        </label>
        <textarea
          id="questionText"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={getPlaceholderText(sessionType)}
          required
        />
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {questionText.length}/500자
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!questionText.trim() || (!isAnonymous && !studentName.trim()) || isSubmitting}
          isLoading={isSubmitting}
        >
          질문 제출하기
        </Button>
      </div>
    </form>
  )
}