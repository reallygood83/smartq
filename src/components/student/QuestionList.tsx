'use client'

import { useState, useEffect } from 'react'
import { Question } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'

interface QuestionListProps {
  sessionId: string
}

export default function QuestionList({ sessionId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const questionsRef = ref(database, `questions/${sessionId}`)
    
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questionsList = Object.values(data) as Question[]
        // 최신순으로 정렬
        questionsList.sort((a, b) => b.createdAt - a.createdAt)
        setQuestions(questionsList)
      } else {
        setQuestions([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId])

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

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        총 {questions.length}개의 질문이 있습니다
      </div>
      
      {questions.map((question, index) => (
        <div
          key={question.questionId}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {questions.length - index}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {question.isAnonymous ? '익명' : (question.studentName || '학생')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(question.createdAt).toLocaleString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <p className="text-gray-800 leading-relaxed">
                {question.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}