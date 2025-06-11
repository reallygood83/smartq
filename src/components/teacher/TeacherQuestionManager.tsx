'use client'

import { useState, useEffect } from 'react'
import { database } from '@/lib/firebase'
import { ref, push, set, onValue, update, remove } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { TeacherQuestion, CreateTeacherQuestionRequest, ActivateQuestionRequest } from '@/types/teacher-led'
import StudentResponseAnalysisDashboard from './StudentResponseAnalysisDashboard'
import QuestionTemplates from './QuestionTemplates'
import ParticipationMonitor from './ParticipationMonitor'
import { Session } from '@/lib/utils'
import { Linkify } from '@/lib/linkify'

interface TeacherQuestionManagerProps {
  sessionId: string
  onQuestionActivated?: (questionId: string) => void
  session?: Session // 세션 정보를 받아서 템플릿 필터링에 사용
}

export default function TeacherQuestionManager({ sessionId, onQuestionActivated, session }: TeacherQuestionManagerProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<TeacherQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [analysisQuestionId, setAnalysisQuestionId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  // 실시간 질문 목록 동기화
  useEffect(() => {
    if (!sessionId) return

    const questionsRef = ref(database, `teacherQuestions/${sessionId}`)
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const questionsList = Object.values(data) as TeacherQuestion[]
        // order 순으로 정렬
        questionsList.sort((a, b) => a.order - b.order)
        setQuestions(questionsList)
        
        // 현재 활성화된 질문 찾기
        const activeQuestion = questionsList.find(q => q.status === 'active')
        setActiveQuestionId(activeQuestion?.questionId || null)
      } else {
        setQuestions([])
        setActiveQuestionId(null)
      }
    })

    return unsubscribe
  }, [sessionId])

  // 새 질문 추가 (실시간)
  const addRealtimeQuestion = async () => {
    if (!newQuestion.trim() || !user) return

    setIsLoading(true)
    try {
      const questionId = `tq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const questionData: TeacherQuestion = {
        questionId,
        sessionId,
        text: newQuestion.trim(),
        teacherId: user.uid,
        order: questions.length + 1,
        source: 'realtime',
        status: 'waiting',
        createdAt: Date.now()
      }

      const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
      await set(questionRef, questionData)
      
      setNewQuestion('')
    } catch (error) {
      console.error('질문 추가 실패:', error)
      alert('질문 추가에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 질문 즉시 전송 (추가 + 활성화)
  const sendQuestionImmediately = async () => {
    if (!newQuestion.trim() || !user) return

    setIsLoading(true)
    try {
      // 1. 기존 활성 질문이 있다면 완료 처리
      if (activeQuestionId) {
        await completeQuestion(activeQuestionId)
      }

      // 2. 새 질문 추가
      const questionId = `tq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const questionData: TeacherQuestion = {
        questionId,
        sessionId,
        text: newQuestion.trim(),
        teacherId: user.uid,
        order: questions.length + 1,
        source: 'realtime',
        status: 'active', // 즉시 활성화
        createdAt: Date.now(),
        activatedAt: Date.now()
      }

      const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
      await set(questionRef, questionData)
      
      setNewQuestion('')
      onQuestionActivated?.(questionId)
    } catch (error) {
      console.error('질문 즉시 전송 실패:', error)
      alert('질문 전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 질문 활성화
  const activateQuestion = async (questionId: string) => {
    if (!user) return

    try {
      const updates: { [key: string]: any } = {}
      
      // 1. 기존 활성 질문이 있다면 완료 처리
      if (activeQuestionId && activeQuestionId !== questionId) {
        updates[`teacherQuestions/${sessionId}/${activeQuestionId}/status`] = 'completed'
        updates[`teacherQuestions/${sessionId}/${activeQuestionId}/completedAt`] = Date.now()
      }

      // 2. 새 질문 활성화
      updates[`teacherQuestions/${sessionId}/${questionId}/status`] = 'active'
      updates[`teacherQuestions/${sessionId}/${questionId}/activatedAt`] = Date.now()

      await update(ref(database), updates)
      onQuestionActivated?.(questionId)
    } catch (error) {
      console.error('질문 활성화 실패:', error)
      alert('질문 활성화에 실패했습니다.')
    }
  }

  // 질문 완료
  const completeQuestion = async (questionId: string) => {
    if (!user) return

    try {
      const updates = {
        [`teacherQuestions/${sessionId}/${questionId}/status`]: 'completed',
        [`teacherQuestions/${sessionId}/${questionId}/completedAt`]: Date.now()
      }

      await update(ref(database), updates)
    } catch (error) {
      console.error('질문 완료 실패:', error)
      alert('질문 완료 처리에 실패했습니다.')
    }
  }

  // 질문 삭제
  const deleteQuestion = async (questionId: string) => {
    if (!user || !confirm('이 질문을 삭제하시겠습니까?')) return

    try {
      const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
      await remove(questionRef)
    } catch (error) {
      console.error('질문 삭제 실패:', error)
      alert('질문 삭제에 실패했습니다.')
    }
  }

  // 질문 수정
  const editQuestion = async (questionId: string, newText: string) => {
    if (!user || !newText.trim()) return

    try {
      const updates = {
        [`teacherQuestions/${sessionId}/${questionId}/text`]: newText.trim()
      }

      await update(ref(database), updates)
    } catch (error) {
      console.error('질문 수정 실패:', error)
      alert('질문 수정에 실패했습니다.')
    }
  }

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (template: string) => {
    setNewQuestion(template)
    setShowTemplates(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100'
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행 중'
      case 'completed':
        return '완료'
      default:
        return '대기'
    }
  }

  return (
    <>
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">💭 질문 관리</h3>
      
      {/* 즉석 질문 입력 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-100">
          새 질문 작성
        </label>
        <div className="space-y-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="수업 흐름에 맞는 질문을 입력하세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-200 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button 
              onClick={sendQuestionImmediately}
              disabled={!newQuestion.trim() || isLoading}
              isLoading={isLoading}
              className="flex-1"
            >
              📤 즉시 전송
            </Button>
            <Button 
              onClick={addRealtimeQuestion}
              disabled={!newQuestion.trim() || isLoading}
              variant="outline"
              className="flex-1"
            >
              💾 대기열 추가
            </Button>
            <Button 
              onClick={() => setShowTemplates(!showTemplates)}
              variant="outline"
              size="sm"
            >
              📝 템플릿
            </Button>
          </div>
        </div>
      </div>

      {/* 질문 템플릿 섹션 */}
      {showTemplates && (
        <div className="mb-6">
          <QuestionTemplates
            onSelectTemplate={handleTemplateSelect}
            sessionType={session?.sessionType}
            subjects={session?.subjects}
            onClose={() => setShowTemplates(false)}
          />
        </div>
      )}
      
      {/* 실시간 참여도 모니터링 */}
      {activeQuestionId && (
        <div className="mb-6">
          <ParticipationMonitor 
            sessionId={sessionId} 
            activeQuestionId={activeQuestionId} 
          />
        </div>
      )}

      {/* 질문 목록 */}
      <div>
        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-100">📋 질문 목록</h4>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>아직 생성된 질문이 없습니다.</p>
            <p className="text-sm mt-1">위에서 새 질문을 작성해보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div 
                key={question.questionId} 
                className={`p-4 border rounded-lg transition-all ${
                  question.status === 'active' 
                    ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20' 
                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Q{question.order}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(question.status)}`}>
                        {getStatusText(question.status)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {question.source === 'prepared' ? '사전 준비' : '실시간 추가'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white mb-2">
                      <Linkify
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {question.text}
                      </Linkify>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      생성: {new Date(question.createdAt).toLocaleString()}
                      {question.activatedAt && (
                        <span className="ml-2">
                          활성화: {new Date(question.activatedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    {question.status === 'waiting' && (
                      <Button
                        onClick={() => activateQuestion(question.questionId)}
                        size="sm"
                        className="text-xs"
                      >
                        활성화
                      </Button>
                    )}
                    {question.status === 'active' && (
                      <Button
                        onClick={() => completeQuestion(question.questionId)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        완료
                      </Button>
                    )}
                    {(question.status === 'active' || question.status === 'completed') && (
                      <Button
                        onClick={() => setAnalysisQuestionId(question.questionId)}
                        variant="outline"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        📊 AI 분석
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const newText = prompt('질문 수정:', question.text)
                        if (newText) editQuestion(question.questionId, newText)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      수정
                    </Button>
                    <Button
                      onClick={() => deleteQuestion(question.questionId)}
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 사용 팁 */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">💡 사용 팁</h4>
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <li>• <strong>즉시 전송:</strong> 질문을 바로 학생들에게 보내고 답변을 받습니다</li>
          <li>• <strong>대기열 추가:</strong> 나중에 사용할 질문을 미리 준비해둡니다</li>
          <li>• <strong>활성화:</strong> 대기 중인 질문을 학생들에게 전송합니다</li>
          <li>• <strong>완료:</strong> 진행 중인 질문을 종료하고 다음 질문으로 넘어갑니다</li>
          <li>• <strong>AI 분석:</strong> 활성화되거나 완료된 질문의 학생 답변을 AI로 분석합니다</li>
        </ul>
      </div>
    </Card>

    {/* AI 분석 대시보드 모달 */}
    {analysisQuestionId && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <StudentResponseAnalysisDashboard 
            sessionId={sessionId}
            questionId={analysisQuestionId}
            onClose={() => setAnalysisQuestionId(null)}
          />
        </div>
      </div>
    )}
  </>
  )
}