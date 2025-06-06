'use client'

import { useState, useEffect } from 'react'
import { Question } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'

interface QuestionListProps {
  sessionId: string
  currentStudentId?: string // 현재 학생을 식별하기 위한 ID (브라우저 고유값)
}

export default function QuestionList({ sessionId, currentStudentId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [myStudentId, setMyStudentId] = useState<string>('')

  useEffect(() => {
    // 현재 학생의 고유 ID 생성 (브라우저 세션 기반)
    let studentId = currentStudentId
    if (!studentId) {
      studentId = localStorage.getItem('smartq_student_id')
      if (!studentId) {
        studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('smartq_student_id', studentId)
      }
    }
    setMyStudentId(studentId)

    const questionsRef = ref(database, `questions/${sessionId}`)
    
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questionsList = Object.values(data) as Question[]
        // 시간순으로 정렬 (오래된 것부터)
        questionsList.sort((a, b) => a.createdAt - b.createdAt)
        setQuestions(questionsList)
      } else {
        setQuestions([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId, currentStudentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">질문 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 제출된 질문이 없습니다
        </h3>
        <p className="text-gray-600">
          첫 번째 질문을 작성해보세요!
        </p>
      </div>
    )
  }

  // 내 질문인지 확인하는 함수
  const isMyQuestion = (question: Question): boolean => {
    // studentId 기반으로 확인 (질문 제출 시 저장된 ID와 비교)
    return question.studentId === myStudentId
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4 text-center">
        💬 총 {questions.length}개의 질문이 있습니다
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3 px-2">
        {questions.map((question, index) => {
          const isMine = isMyQuestion(question)
          
          return (
            <div
              key={question.questionId}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                isMine 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-white border border-gray-200 rounded-bl-md'
              }`}>
                {/* 발신자 정보 */}
                <div className={`flex items-center justify-between mb-2 ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <span className={`text-xs font-medium ${
                    isMine ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {isMine ? '나' : (question.isAnonymous ? '익명' : (question.studentName || '학생'))}
                  </span>
                  <span className={`text-xs ${
                    isMine ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {new Date(question.createdAt).toLocaleString('ko-KR', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* 질문 내용 */}
                <p className={`text-sm leading-relaxed ${
                  isMine ? 'text-white' : 'text-gray-800'
                }`}>
                  {question.text}
                </p>
                
                {/* 읽음 표시 (내 질문인 경우에만) */}
                {isMine && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-blue-200">✓</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 스크롤 안내 */}
      {questions.length > 5 && (
        <div className="text-center">
          <span className="text-xs text-gray-400">👆 위로 스크롤하여 더 많은 질문을 볼 수 있어요</span>
        </div>
      )}
    </div>
  )
}