'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Session,
  Question,
  QuestionStatus,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_STYLES,
  SharedContent,
  getQuestionStatus
} from '@/lib/utils'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor, isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue, set, remove, update } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { getStoredApiKey } from '@/lib/encryption'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Linkify } from '@/lib/linkify'
import PeerFeedbackSystem from '@/components/feedback/PeerFeedbackSystem'
import FeedbackQualityDashboard from '@/components/feedback/FeedbackQualityDashboard'
import AIAnalysisPanel from './AIAnalysisPanel'
import CollapsiblePanel from './CollapsiblePanel'
import QuickNavigation from './QuickNavigation'
import TeacherQuestionManager from './TeacherQuestionManager'

interface SessionManagerProps {
  sessionId: string
}

export default function SessionManager({ sessionId }: SessionManagerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sharedContents, setSharedContents] = useState<SharedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [showContentForm, setShowContentForm] = useState(false)
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'link' | 'instruction' | 'youtube'
  })

  // 패널 참조를 위한 refs
  const aiAnalysisRef = useRef<HTMLDivElement>(null)
  const teacherQuestionRef = useRef<HTMLDivElement>(null)
  const questionsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  // 스크롤 이동 함수
  const scrollToPanel = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 빠른 네비게이션 아이템
  const quickNavItems = [
    {
      id: 'ai-analysis',
      label: 'AI 분석',
      icon: '🤖',
      onClick: () => scrollToPanel(aiAnalysisRef)
    },
    ...(session?.interactionMode === 'teacher_led' ? [
      {
        id: 'teacher-questions',
        label: '질문 관리',
        icon: '🎯',
        onClick: () => scrollToPanel(teacherQuestionRef)
      }
    ] : []),
    {
      id: 'questions',
      label: session?.interactionMode === 'teacher_led' ? '학생 답변' : '질문 목록',
      icon: '❓',
      onClick: () => scrollToPanel(questionsRef)
    },
    {
      id: 'content',
      label: '콘텐츠 공유',
      icon: '📄',
      onClick: () => scrollToPanel(contentRef)
    },
    ...(session?.isAdultEducation ? [
      {
        id: 'feedback',
        label: '피드백 시스템',
        icon: '💬',
        onClick: () => scrollToPanel(feedbackRef)
      }
    ] : [])
  ]

  useEffect(() => {
    // 세션 데이터 로드
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSession(data)
      } else {
        // 세션이 존재하지 않으면 대시보드로 이동
        router.push('/teacher/dashboard')
      }
      setLoading(false)
    })

    // 질문 데이터 로드
    const questionsRef = ref(database, `questions/${sessionId}`)
    const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        try {
          const questionsList = Object.values(data).filter(item => item && typeof item === 'object') as Question[]
          if (Array.isArray(questionsList)) {
            questionsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            setQuestions(questionsList)
          } else {
            setQuestions([])
          }
        } catch (error) {
          console.error('질문 데이터 처리 오류:', error)
          setQuestions([])
        }
      } else {
        setQuestions([])
      }
    })

    // 공유 콘텐츠 로드
    const sharedContentsRef = ref(database, `sharedContents/${sessionId}`)
    const unsubscribeContents = onValue(sharedContentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        try {
          const contentsList = Object.values(data).filter(item => item && typeof item === 'object') as SharedContent[]
          if (Array.isArray(contentsList)) {
            contentsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            setSharedContents(contentsList)
          } else {
            setSharedContents([])
          }
        } catch (error) {
          console.error('공유 콘텐츠 데이터 처리 오류:', error)
          setSharedContents([])
        }
      } else {
        setSharedContents([])
      }
    })

    return () => {
      unsubscribeSession()
      unsubscribeQuestions()
      unsubscribeContents()
    }
  }, [sessionId, router])


  const copyStudentLink = () => {
    if (!session) return
    const studentUrl = `${window.location.origin}/student/session/${session.accessCode}`
    navigator.clipboard.writeText(studentUrl)
    alert('학생 접속 링크가 클립보드에 복사되었습니다!')
  }

  const handleShareContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !session) return

    try {
      const contentId = Date.now().toString()
      
      // 유튜브 URL 자동 감지
      let contentType = contentForm.type
      if (contentType === 'link' && isYouTubeUrl(contentForm.content)) {
        contentType = 'youtube'
      }
      
      const newContent: SharedContent = {
        contentId,
        title: contentForm.title,
        content: contentForm.content,
        type: contentType,
        createdAt: Date.now(),
        sessionId,
        teacherId: user.uid
      }

      const contentRef = ref(database, `sharedContents/${sessionId}/${contentId}`)
      await set(contentRef, newContent)

      // 폼 초기화
      setContentForm({
        title: '',
        content: '',
        type: 'text'
      })
      setShowContentForm(false)
      alert('콘텐츠가 공유되었습니다!')
    } catch (error) {
      console.error('콘텐츠 공유 오류:', error)
      alert('콘텐츠 공유에 실패했습니다.')
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까?')) return

    try {
      const contentRef = ref(database, `sharedContents/${sessionId}/${contentId}`)
      await remove(contentRef)
      alert('콘텐츠가 삭제되었습니다.')
    } catch (error) {
      console.error('콘텐츠 삭제 오류:', error)
      alert('콘텐츠 삭제에 실패했습니다.')
    }
  }

  const handleQuestionStatusChange = async (questionId: string, status: QuestionStatus) => {
    try {
      const questionRef = ref(database, `questions/${sessionId}/${questionId}`)
      await update(questionRef, { status })
    } catch (error) {
      console.error('질문 상태 변경 오류:', error)
      alert('질문 상태 변경에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">세션 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          세션을 찾을 수 없습니다
        </h2>
        <Link href="/teacher/dashboard">
          <Button>대시보드로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 빠른 네비게이션 */}
      <QuickNavigation items={quickNavItems} />
      
      {/* 세션 정보 헤더 */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">
                {getSessionTypeIcon(session.sessionType)}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.title}
                </h1>
                <p className="text-gray-600">
                  {getSessionTypeLabel(session.sessionType)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">접속 코드:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-lg font-mono font-bold bg-blue-100 text-blue-800">
                    {session.accessCode}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">상호작용 방식:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                    (session.interactionMode || 'free_question') === 'teacher_led' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {(session.interactionMode || 'free_question') === 'teacher_led' ? '🎯 교사 주도' : '💬 자유 질문'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">생성일:</span>
                <p className="mt-1 text-gray-900">
                  {new Date(session.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </div>

            {/* 교과목 태그 */}
            {session.subjects && session.subjects.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-2">교과목:</span>
                <div className="flex flex-wrap gap-2">
                  {session.subjects.map((subject) => (
                    <span
                      key={subject}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(subject)}`}
                    >
                      {getSubjectLabel(subject)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 학습 목표 */}
            {session.learningGoals && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-1">학습 목표:</span>
                <p className="text-gray-900">{session.learningGoals}</p>
              </div>
            )}

            {/* 키워드 */}
            {session.keywords && session.keywords.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">키워드:</span>
                <p className="text-gray-900">{session.keywords.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
            <Button onClick={copyStudentLink}>
              학생 링크 복사
            </Button>
            <Link href="/teacher/dashboard">
              <Button variant="outline">
                대시보드로
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* AI 분석 시스템 통합 패널 - 상단으로 이동하여 접근성 향상 */}
      <div ref={aiAnalysisRef}>
        {session && (
          <AIAnalysisPanel 
            session={session}
            questions={questions}
            sessionId={sessionId}
          />
        )}
      </div>

      {/* 교사 주도 질문 관리 (교사 주도 모드에서만 표시) */}
      {session?.interactionMode === 'teacher_led' && (
        <div ref={teacherQuestionRef}>
          <TeacherQuestionManager sessionId={sessionId} session={session} />
        </div>
      )}

      {/* 질문 목록 */}
      <div ref={questionsRef}>
        <CollapsiblePanel
          title="학생 질문"
          icon="❓"
          badge={questions?.length || 0}
          defaultExpanded={true}
        >

        {!questions?.length ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 제출된 질문이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              학생들이 질문을 제출하면 여기에 표시됩니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>학생 접속 방법:</strong> 접속 코드 <span className="font-mono font-bold">{session.accessCode}</span>를 
                <br />
                <span className="font-medium">{window.location.origin}/student</span>에서 입력
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(questions || []).map((question, index) => {
              const status = getQuestionStatus(question)
              return (
                <div
                  key={question.questionId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {question.isAnonymous ? '익명' : (question.studentName || '학생')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(question.createdAt).toLocaleTimeString()}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${QUESTION_STATUS_STYLES[status]}`}>
                          {QUESTION_STATUS_LABELS[status]}
                        </span>
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        <Linkify
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {question.text}
                        </Linkify>
                      </div>
                    </div>
                    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                      진행 상태
                      <select
                        value={status}
                        onChange={(event) => handleQuestionStatusChange(question.questionId, event.target.value as QuestionStatus)}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(Object.keys(QUESTION_STATUS_LABELS) as QuestionStatus[]).map((value) => (
                          <option key={value} value={value}>
                            {QUESTION_STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </CollapsiblePanel>
      </div>

      {/* 콘텐츠 공유 섹션 */}
      <div ref={contentRef}>
        <CollapsiblePanel
          title="콘텐츠 공유"
          icon="📄"
          badge={sharedContents?.length || 0}
          defaultExpanded={false}
          headerActions={
            <Button
              onClick={() => setShowContentForm(!showContentForm)}
              variant={showContentForm ? "outline" : "default"}
              size="sm"
            >
              {showContentForm ? '취소' : '+ 콘텐츠 공유'}
            </Button>
          }
        >

        {/* 콘텐츠 추가 폼 */}
        {showContentForm && (
          <Card className="p-4 mb-6 bg-gray-50">
            <form onSubmit={handleShareContent} className="space-y-4">
              <div>
                <label htmlFor="contentTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  id="contentTitle"
                  required
                  value={contentForm.title}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 수업 자료, 참고 링크 등"
                />
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                  유형
                </label>
                <select
                  id="contentType"
                  value={contentForm.type}
                  onChange={(e) => setContentForm(prev => ({ ...prev, type: e.target.value as 'text' | 'link' | 'instruction' | 'youtube' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">📄 텍스트</option>
                  <option value="link">🔗 링크</option>
                  <option value="youtube">🎬 유튜브</option>
                  <option value="instruction">📋 안내사항</option>
                </select>
              </div>

              <div>
                <label htmlFor="contentText" className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  id="contentText"
                  required
                  rows={4}
                  value={contentForm.content}
                  onChange={(e) => setContentForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    contentForm.type === 'link' 
                      ? "https://example.com" 
                      : contentForm.type === 'youtube'
                      ? "https://youtube.com/watch?v=... 또는 https://youtu.be/..."
                      : contentForm.type === 'instruction'
                      ? "학생들에게 전달할 안내사항을 입력하세요"
                      : "공유할 텍스트 내용을 입력하세요"
                  }
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" size="sm">
                  공유하기
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowContentForm(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 공유된 콘텐츠 목록 */}
        {!sharedContents?.length ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              공유된 콘텐츠가 없습니다
            </h3>
            <p className="text-gray-600">
              학생들과 공유할 자료나 안내사항을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedContents.map((content) => (
              <div
                key={content.contentId}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {content.type === 'text' ? '📄' : 
                         content.type === 'link' ? '🔗' : 
                         content.type === 'youtube' ? '🎬' : '📋'}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {content.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(content.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className={`rounded-md ${
                      content.type === 'youtube' ? 'bg-black' : 'bg-gray-50 p-3'
                    }`}>
                      {content.type === 'youtube' ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-md"
                            src={getYouTubeEmbedUrl(content.content) || ''}
                            title={content.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : content.type === 'link' ? (
                        <a
                          href={content.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 break-all"
                        >
                          {content.content}
                        </a>
                      ) : (
                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          <Linkify
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {content.content}
                          </Linkify>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteContent(content.contentId)}
                    className="ml-4 text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        </CollapsiblePanel>
      </div>

      {/* AI 분석 결과 표시 영역 - 더 이상 여기서 렌더링하지 않음 */}
      {/* 실제 분석은 각각의 전용 페이지에서 수행됨 */}

      {/* 피드백 시스템 (성인 교육 전용) */}
      <div ref={feedbackRef}>
      {session?.isAdultEducation && (
        <CollapsiblePanel
          title="피드백 시스템"
          icon="💬"
          defaultExpanded={false}
        >
          <div className="space-y-6">
            {/* 전문적 피드백 시스템 */}
            <PeerFeedbackSystem
              sessionId={sessionId}
              sessionTitle={session.title}
            />

            {/* AI 기반 피드백 품질 분석 */}
            <FeedbackQualityDashboard
              sessionId={sessionId}
              userApiKey={getStoredApiKey() || ''}
            />

            {/* 피드백 성장 분석 링크 */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">📊 피드백 성장 분석</h2>
                  <p className="text-gray-600">
                    참여자별 피드백 품질 성장 과정을 상세히 분석하고 추적합니다.
                  </p>
                </div>
                <Link href={`/teacher/session/${sessionId}/feedback-analytics`}>
                  <Button>
                    성장 분석 보기
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </CollapsiblePanel>
      )}
      </div>

      {/* AI 분석 결과 - 레거시 분석 결과는 더 이상 여기서 렌더링하지 않음 */}
      {/* 실제 분석은 상단의 AI 분석 패널 또는 각각의 전용 페이지에서 수행됨 */}
    </div>
  )
}
