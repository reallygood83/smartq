'use client'

import { useState, useEffect } from 'react'
import { database } from '@/lib/firebase'
import { ref, onValue, push, set } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { TeacherQuestion, StudentResponse } from '@/types/teacher-led'
import { Linkify } from '@/lib/linkify'

interface TeacherQuestionViewProps {
  sessionId: string
  studentId: string
  studentName?: string
}

export default function TeacherQuestionView({ sessionId, studentId, studentName }: TeacherQuestionViewProps) {
  const [activeQuestion, setActiveQuestion] = useState<TeacherQuestion | null>(null)
  const [responses, setResponses] = useState<StudentResponse[]>([])
  const [myResponse, setMyResponse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  // 학생 이름이 있으면 기본적으로 실명 모드, 없으면 익명 모드
  const [isAnonymous, setIsAnonymous] = useState(!studentName)

  // 활성 질문 실시간 동기화
  useEffect(() => {
    if (!sessionId) return

    const questionsRef = ref(database, `teacherQuestions/${sessionId}`)
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questions = Object.values(data) as TeacherQuestion[]
        const active = questions.find(q => q.status === 'active')
        setActiveQuestion(active || null)
        
        // 새 질문이 활성화되면 기존 답변 초기화
        if (active && (!activeQuestion || active.questionId !== activeQuestion.questionId)) {
          setMyResponse('')
          setHasSubmitted(false)
        }
      } else {
        setActiveQuestion(null)
      }
    })

    return unsubscribe
  }, [sessionId, activeQuestion?.questionId])

  // 답변 실시간 동기화
  useEffect(() => {
    if (!sessionId || !activeQuestion) {
      setResponses([])
      return
    }

    const responsesRef = ref(database, `studentResponses/${sessionId}`)
    const unsubscribe = onValue(responsesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allResponses = Object.values(data) as StudentResponse[]
        // 현재 활성 질문에 대한 답변만 필터링
        const questionResponses = allResponses.filter(r => r.questionId === activeQuestion.questionId)
        // 최신순으로 정렬
        questionResponses.sort((a, b) => b.createdAt - a.createdAt)
        setResponses(questionResponses)
        
        // 내가 이미 답변했는지 확인
        const mySubmission = questionResponses.find(r => r.studentId === studentId)
        setHasSubmitted(!!mySubmission)
        if (mySubmission) {
          setMyResponse(mySubmission.text)
        }
      } else {
        setResponses([])
        setHasSubmitted(false)
      }
    })

    return unsubscribe
  }, [sessionId, activeQuestion?.questionId, studentId])

  // 답변 제출
  const submitResponse = async () => {
    if (!myResponse.trim() || !activeQuestion || isSubmitting) return

    setIsSubmitting(true)
    try {
      const responseId = `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const responseData: StudentResponse = {
        responseId,
        questionId: activeQuestion.questionId,
        sessionId,
        text: myResponse.trim(),
        studentId,
        isAnonymous,
        createdAt: Date.now()
      }

      if (!isAnonymous && studentName) {
        responseData.studentName = studentName
      }

      const responseRef = ref(database, `studentResponses/${sessionId}/${responseId}`)
      await set(responseRef, responseData)

      setHasSubmitted(true)
    } catch (error) {
      console.error('답변 제출 실패:', error)
      alert('답변 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 답변 수정
  const updateResponse = async () => {
    if (!myResponse.trim() || !activeQuestion || isSubmitting) return

    setIsSubmitting(true)
    try {
      // 기존 답변 찾기
      const myExistingResponse = responses.find(r => r.studentId === studentId)
      if (!myExistingResponse) return

      // 기존 답변 업데이트
      const responseRef = ref(database, `studentResponses/${sessionId}/${myExistingResponse.responseId}`)
      const updatedData = {
        ...myExistingResponse,
        text: myResponse.trim(),
        isAnonymous,
        studentName: (!isAnonymous && studentName) ? studentName : null
      }

      await set(responseRef, updatedData)
    } catch (error) {
      console.error('답변 수정 실패:', error)
      alert('답변 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeQuestion) {
    return (
      <Card className="p-6 text-center">
        <div className="py-8">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            다음 질문을 기다리고 있어요
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            선생님이 새로운 질문을 준비 중입니다
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 현재 질문 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🙋‍♂️</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">선생님 질문</h2>
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded text-sm">
            진행 중
          </span>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <div className="text-lg text-gray-900 dark:text-white font-medium">
            <Linkify
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {activeQuestion.text}
            </Linkify>
          </div>
        </div>

        {/* 답변 작성 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              ✍️ 내 답변
            </label>
            <textarea
              value={myResponse}
              onChange={(e) => setMyResponse(e.target.value)}
              placeholder="생각을 자유롭게 표현해보세요..."
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-200 resize-none"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {myResponse.length}/2000자
              </span>
              {myResponse.length > 2000 && (
                <span className="text-xs text-red-500">글자 수를 초과했습니다</span>
              )}
            </div>
          </div>

          {/* 실명/익명 설정 */}
          <div className="space-y-3">
            {!isAnonymous && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  학생 이름
                </label>
                <input
                  type="text"
                  value={studentName || ''}
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-200"
                  readOnly
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ※ 실명은 세션 접속 시 입력한 이름으로 표시됩니다
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-100">
                익명으로 답변하기
              </label>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-2">
            {!hasSubmitted ? (
              <Button
                onClick={submitResponse}
                disabled={!myResponse.trim() || myResponse.length > 2000 || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                답변 제출
              </Button>
            ) : (
              <Button
                onClick={updateResponse}
                disabled={!myResponse.trim() || myResponse.length > 2000 || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
                variant="outline"
              >
                답변 수정
              </Button>
            )}
          </div>

          {hasSubmitted && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-100">
                ✅ 답변이 제출되었습니다. 언제든 수정할 수 있어요!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 다른 학생들 답변 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💬 친구들의 답변 ({responses.length}개)
        </h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>아직 제출된 답변이 없습니다.</p>
            <p className="text-sm mt-1">첫 번째로 답변해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {responses.map((response) => (
              <div 
                key={response.responseId} 
                className={`p-4 rounded-lg border ${
                  response.studentId === studentId 
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {response.studentId === studentId ? '내 답변' : 
                     response.isAnonymous ? '익명' : 
                     response.studentName || '친구'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(response.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white">{response.text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}