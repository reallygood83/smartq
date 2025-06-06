'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Session, Question, MultiSubjectAnalysisResult, SharedContent } from '@/lib/utils'
import { getSessionTypeIcon, getSessionTypeLabel, getSubjectLabel, getSubjectColor } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue, push, set, remove } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { analyzeQuestionsMultiSubject } from '@/lib/gemini'
import { getStoredApiKey } from '@/lib/encryption'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SessionManagerProps {
  sessionId: string
}

export default function SessionManager({ sessionId }: SessionManagerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [analysisResult, setAnalysisResult] = useState<MultiSubjectAnalysisResult | null>(null)
  const [sharedContents, setSharedContents] = useState<SharedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showContentForm, setShowContentForm] = useState(false)
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'link' | 'instruction'
  })

  useEffect(() => {
    // 세션 데이터 로드
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSession(data)
        if (data.aiAnalysisResult) {
          setAnalysisResult(data.aiAnalysisResult)
        }
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
        const questionsList = Object.values(data) as Question[]
        questionsList.sort((a, b) => b.createdAt - a.createdAt)
        setQuestions(questionsList)
      } else {
        setQuestions([])
      }
    })

    // 공유 콘텐츠 로드
    const sharedContentsRef = ref(database, `sharedContents/${sessionId}`)
    const unsubscribeContents = onValue(sharedContentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const contentsList = Object.values(data) as SharedContent[]
        contentsList.sort((a, b) => b.createdAt - a.createdAt)
        setSharedContents(contentsList)
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

  const handleAnalyzeQuestions = async () => {
    if (!session || questions.length === 0) return

    const apiKey = getStoredApiKey()
    if (!apiKey) {
      if (confirm('AI 분석을 위해 Gemini API 키가 필요합니다. 설정 페이지로 이동하시겠습니까?')) {
        router.push('/teacher/settings')
      }
      return
    }

    setAnalyzing(true)
    try {
      const questionTexts = questions.map(q => q.text)
      const result = await analyzeQuestionsMultiSubject(
        questionTexts,
        session.sessionType,
        session.subjects,
        apiKey,
        session.keywords
      )

      // 분석 결과를 Firebase에 저장
      const analysisRef = ref(database, `sessions/${sessionId}/aiAnalysisResult`)
      await set(analysisRef, result)
      
      setAnalysisResult(result)
      alert('AI 분석이 완료되었습니다!')
    } catch (error) {
      console.error('AI 분석 오류:', error)
      alert('AI 분석 중 오류가 발생했습니다. API 키를 확인해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

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
      const newContent: SharedContent = {
        contentId,
        title: contentForm.title,
        content: contentForm.content,
        type: contentForm.type,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">접속 코드:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-lg font-mono font-bold bg-blue-100 text-blue-800">
                    {session.accessCode}
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

      {/* 질문 목록 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            학생 질문 ({questions.length}개)
          </h2>
          {questions.length > 0 && (
            <Button
              onClick={handleAnalyzeQuestions}
              disabled={analyzing}
              isLoading={analyzing}
            >
              AI 분석 실행
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
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
            {questions.map((question, index) => (
              <div
                key={question.questionId}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-600">
                        {question.isAnonymous ? '익명' : (question.studentName || '학생')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(question.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-900">{question.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 콘텐츠 공유 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            콘텐츠 공유 ({sharedContents.length}개)
          </h2>
          <Button
            onClick={() => setShowContentForm(!showContentForm)}
            variant={showContentForm ? "outline" : "default"}
          >
            {showContentForm ? '취소' : '+ 콘텐츠 공유'}
          </Button>
        </div>

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
                  onChange={(e) => setContentForm(prev => ({ ...prev, type: e.target.value as 'text' | 'link' | 'instruction' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">📄 텍스트</option>
                  <option value="link">🔗 링크</option>
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
        {sharedContents.length === 0 ? (
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
                        {content.type === 'text' ? '📄' : content.type === 'link' ? '🔗' : '📋'}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {content.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(content.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      {content.type === 'link' ? (
                        <a
                          href={content.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 break-all"
                        >
                          {content.content}
                        </a>
                      ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">{content.content}</p>
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
      </Card>

      {/* AI 분석 결과 */}
      {analysisResult && (
        <>
          {/* 질문 그룹화 결과 */}
          {analysisResult.clusteredQuestions && analysisResult.clusteredQuestions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                질문 그룹 분석
              </h2>
              <div className="space-y-6">
                {analysisResult.clusteredQuestions.map((cluster) => (
                  <div key={cluster.clusterId} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {cluster.clusterTitle}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {cluster.clusterSummary}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        포함된 질문들:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {cluster.questions.map((question, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>활용 가이드:</strong> {cluster.combinationGuide}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 활동 추천 */}
          {analysisResult.recommendedActivities && analysisResult.recommendedActivities.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                추천 교육 활동
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysisResult.recommendedActivities.map((activity) => (
                  <div key={activity.activityId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {activity.activityTitle}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.difficulty === 'easy' ? '쉬움' :
                         activity.difficulty === 'medium' ? '보통' : '어려움'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">활동 유형:</span>
                        <p className="text-sm text-gray-600">{activity.activityType}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">설명:</span>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">소요 시간:</span>
                        <p className="text-sm text-gray-600">{activity.timeRequired}</p>
                      </div>
                      
                      {activity.materials && activity.materials.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">필요 자료:</span>
                          <ul className="text-sm text-gray-600 mt-1">
                            {activity.materials.map((material, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{material}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-blue-900">추천 이유:</span>
                        <p className="text-sm text-blue-800 mt-1">{activity.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}