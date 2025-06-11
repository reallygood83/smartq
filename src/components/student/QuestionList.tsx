'use client'

import { useState, useEffect } from 'react'
import { Question, Session } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue, set, remove } from 'firebase/database'
import { useEducationLevel, useSmartTerminology, useFullTheme } from '@/contexts/EducationLevelContext'
import { EducationLevel } from '@/types/education'
import { Linkify } from '@/lib/linkify'

interface QuestionListProps {
  sessionId: string
  currentStudentId?: string // 현재 학생을 식별하기 위한 ID (브라우저 고유값)
  session?: Session // 세션 정보 추가 (성인 교육 여부 확인용)
}

export default function QuestionList({ sessionId, currentStudentId, session }: QuestionListProps) {
  const { currentLevel } = useEducationLevel()
  const { term, adapt } = useSmartTerminology()
  const theme = useFullTheme()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [myStudentId, setMyStudentId] = useState<string>('')
  const [likesData, setLikesData] = useState<{[questionId: string]: {[studentId: string]: boolean}}>({})
  const [processingLike, setProcessingLike] = useState<string | null>(null)
  
  // Determine if this is an adult/university education session
  const isAdultEducationSession = session?.isAdultEducation || 
    [currentLevel].includes(EducationLevel.UNIVERSITY) || 
    [currentLevel].includes(EducationLevel.ADULT)

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
        
        // 좋아요 데이터 추출
        const likes: {[questionId: string]: {[studentId: string]: boolean}} = {}
        Object.entries(data).forEach(([questionId, questionData]: [string, any]) => {
          if (questionData.likes) {
            likes[questionId] = questionData.likes
          }
        })
        setLikesData(likes)
      } else {
        setQuestions([])
        setLikesData({})
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId, currentStudentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-white">질문 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
          {isAdultEducationSession 
            ? adapt('아직 질의응답이 없습니다', '질문이 제출되지 않았습니다', '토론 참여를 기다리고 있습니다')
            : adapt('아직 제출된 질문이 없습니다', '질문이 아직 없어요', '첫 질문을 기다리고 있어요')}
        </h3>
        <p className="text-gray-600 dark:text-white">
          {isAdultEducationSession 
            ? adapt('첫 번째 질문을 제출하여 토론을 시작해보세요!', '질의응답을 시작해주세요!', '전문적인 질문으로 시작해보세요!')
            : adapt('첫 번째 질문을 작성해보세요!', '궁금한 것을 물어보세요!', '질문해주세요!')}
        </p>
      </div>
    )
  }

  // 내 질문인지 확인하는 함수
  const isMyQuestion = (question: Question): boolean => {
    // studentId 기반으로 확인 (질문 제출 시 저장된 ID와 비교)
    return question.studentId === myStudentId
  }

  // 좋아요 토글 함수
  const toggleLike = async (questionId: string) => {
    if (!database || !myStudentId || processingLike) return
    
    setProcessingLike(questionId)
    
    try {
      const likeRef = ref(database, `questions/${sessionId}/${questionId}/likes/${myStudentId}`)
      const isLiked = likesData[questionId]?.[myStudentId] || false
      
      if (isLiked) {
        // 좋아요 취소
        await remove(likeRef)
      } else {
        // 좋아요 추가
        await set(likeRef, true)
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessingLike(null)
    }
  }

  // 질문의 좋아요 수 계산
  const getLikeCount = (questionId: string): number => {
    const likes = likesData[questionId]
    if (!likes || typeof likes !== 'object') return 0
    return Object.keys(likes).length
  }

  // 내가 좋아요 했는지 확인
  const isLikedByMe = (questionId: string): boolean => {
    return likesData[questionId]?.[myStudentId] || false
  }

  return (
    <div className="space-y-3">
      <div className="text-sm mb-4 text-center text-gray-600 dark:text-white">
        💬 {isAdultEducationSession 
          ? adapt(`총 ${questions?.length || 0}개의 질의응답`, `${questions?.length || 0}개의 토론 질문`, `${questions?.length || 0}개의 전문 질문`)
          : adapt(`총 ${questions?.length || 0}개의 질문이 있습니다`, `${questions?.length || 0}개의 질문이 있어요`, `질문이 ${questions?.length || 0}개 있어요`)}
      </div>
      
      <div className={`${isAdultEducationSession ? 'max-h-[32rem]' : 'max-h-96'} overflow-y-auto space-y-3 px-2`} 
           style={{ backgroundColor: isAdultEducationSession ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
        {questions.map((question, index) => {
          const isMine = isMyQuestion(question)
          const likeCount = getLikeCount(question.questionId)
          const isPopular = likeCount >= 3 // 3개 이상의 좋아요를 받으면 인기 질문
          
          return (
            <div
              key={question.questionId}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isAdultEducationSession ? 'mb-4' : ''}`}
            >
              <div className={`${isAdultEducationSession ? 'max-w-lg lg:max-w-xl' : 'max-w-xs lg:max-w-md'} px-4 py-3 rounded-2xl shadow-sm ${
                isPopular && !isMine ? 'ring-2 ring-red-300 ring-opacity-50' : ''
              } ${
                isMine 
                  ? isAdultEducationSession 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md shadow-md' 
                    : 'bg-blue-500 text-white rounded-br-md'
                  : isAdultEducationSession
                    ? 'bg-white border border-gray-300 rounded-bl-md shadow-md'
                    : 'bg-white border border-gray-200 rounded-bl-md'
              }`} style={isAdultEducationSession ? { 
                borderLeft: isMine ? 'none' : `4px solid ${theme.colors.primary}`,
                borderRight: isMine ? `4px solid ${theme.colors.primary}` : 'none'
              } : {}}>
                {/* 발신자 정보 */}
                <div className={`flex items-center justify-between mb-2 ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <span className={`text-xs font-medium ${
                    isMine ? 'text-blue-100' : 'text-gray-600 dark:text-white'
                  }`}>
                    {isMine 
                      ? isAdultEducationSession 
                        ? adapt('본인', '나', '내 질문')
                        : '나'
                      : (question.isAnonymous 
                        ? isAdultEducationSession 
                          ? adapt('익명 참여자', '익명', '익명 질문자')
                          : '익명'
                        : (question.studentName || (isAdultEducationSession ? adapt('참여자', '학습자', '질문자') : '학생')))}
                  </span>
                  <span className={`text-xs ${
                    isMine ? 'text-blue-200' : 'text-gray-400 dark:text-white'
                  }`}>
                    {new Date(question.createdAt).toLocaleString('ko-KR', isAdultEducationSession ? {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    } : {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* 질문 내용 */}
                <div className={`${isAdultEducationSession ? 'text-base' : 'text-sm'} leading-relaxed ${
                  isMine ? 'text-white' : 'text-gray-800 dark:text-white'
                }`}>
                  <Linkify
                    className={`${
                      isMine 
                        ? 'text-blue-200 hover:text-blue-100 underline' 
                        : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {question.text}
                  </Linkify>
                </div>
                
                {/* 좋아요 버튼 및 카운트 */}
                <div className={`mt-3 flex items-center ${isMine ? 'justify-between' : 'justify-between'}`}>
                  <button
                    onClick={() => toggleLike(question.questionId)}
                    disabled={processingLike === question.questionId || isMine}
                    className={`flex items-center space-x-1 transition-all ${
                      isMine 
                        ? 'cursor-not-allowed opacity-50' 
                        : processingLike === question.questionId
                        ? 'cursor-wait opacity-70'
                        : 'cursor-pointer hover:scale-110'
                    } ${
                      isLikedByMe(question.questionId)
                        ? 'text-red-500'
                        : isMine
                        ? 'text-blue-200'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    title={isMine ? '내 질문에는 좋아요를 할 수 없습니다' : '좋아요'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLikedByMe(question.questionId) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className={`text-sm font-medium ${
                      isMine ? 'text-blue-200' : ''
                    }`}>
                      {getLikeCount(question.questionId)}
                    </span>
                  </button>

                  {/* 추가 메타데이터 (성인 교육용) */}
                  {isAdultEducationSession && (
                    <div className={`flex items-center space-x-3 text-xs ${
                      isMine ? 'text-blue-100' : 'text-gray-500 dark:text-white'
                    }`}>
                      <span>#{index + 1}</span>
                      <span>{question.text.length}자</span>
                    </div>
                  )}
                </div>
                
                {/* 읽음 표시 (내 질문인 경우에만) */}
                {isMine && (
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${isAdultEducationSession ? 'text-blue-100' : 'text-blue-200'}`}>
                      {isAdultEducationSession ? '✓ 제출됨' : '✓'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 스크롤 안내 */}
      {questions.length > (isAdultEducationSession ? 8 : 5) && (
        <div className="text-center">
          <span className="text-xs text-gray-600 dark:text-white">
            {isAdultEducationSession 
              ? adapt('👆 스크롤하여 이전 질의응답 확인', '👆 위로 스크롤하여 더 많은 토론 내용 보기', '👆 스크롤로 전체 대화 내용 확인')
              : adapt('👆 위로 스크롤하여 더 많은 질문을 볼 수 있어요', '👆 스크롤해서 다른 질문들도 봐요', '👆 위로 올려서 더 보기')}
          </span>
        </div>
      )}
    </div>
  )
}