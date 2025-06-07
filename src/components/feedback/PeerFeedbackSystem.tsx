'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEducationLevel, useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import FeedbackProvisionForm from './FeedbackProvisionForm'
import { FeedbackRequest, FeedbackResponse, FeedbackType, FeedbackCategory, FeedbackStatus } from '@/types/feedback'
import { database } from '@/lib/firebase'
import { ref, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database'

interface PeerFeedbackSystemProps {
  sessionId: string
  sessionTitle?: string
}

export default function PeerFeedbackSystem({ sessionId, sessionTitle }: PeerFeedbackSystemProps) {
  const { user } = useAuth()
  const { currentLevel } = useEducationLevel()
  const theme = useFullTheme()
  
  const [activeTab, setActiveTab] = useState<'request' | 'provide' | 'received'>('request')
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([])
  const [myRequests, setMyRequests] = useState<FeedbackRequest[]>([])
  const [receivedFeedback, setReceivedFeedback] = useState<FeedbackResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequest | null>(null)
  const [showProvisionForm, setShowProvisionForm] = useState(false)
  
  // 새 피드백 요청 폼 상태
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    feedbackType: FeedbackType.PEER_REVIEW,
    categories: [] as FeedbackCategory[],
    specificQuestions: [''],
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isAnonymous: false
  })

  useEffect(() => {
    if (!user) return

    // 피드백 요청들 로드
    const requestsRef = ref(database, `feedbackRequests/${sessionId}`)
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allRequests = Object.values(data) as FeedbackRequest[]
        setFeedbackRequests(allRequests.filter(req => req.requesterId !== user.uid && req.status === FeedbackStatus.PENDING))
        setMyRequests(allRequests.filter(req => req.requesterId === user.uid))
      }
      setLoading(false)
    })

    // 받은 피드백들 로드
    const responsesRef = ref(database, `feedbackResponses/${sessionId}`)
    const unsubscribeResponses = onValue(responsesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const allResponses = Object.values(data) as FeedbackResponse[]
        // 내 요청에 대한 피드백만 필터링
        const myRequestIds = myRequests.map(req => req.requestId)
        setReceivedFeedback(allResponses.filter(resp => myRequestIds.includes(resp.requestId)))
      }
    })

    return () => {
      unsubscribeRequests()
      unsubscribeResponses()
    }
  }, [user, sessionId, myRequests])

  const handleCategoryToggle = (category: FeedbackCategory) => {
    setRequestForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleAddQuestion = () => {
    setRequestForm(prev => ({
      ...prev,
      specificQuestions: [...prev.specificQuestions, '']
    }))
  }

  const handleQuestionChange = (index: number, value: string) => {
    setRequestForm(prev => ({
      ...prev,
      specificQuestions: prev.specificQuestions.map((q, i) => i === index ? value : q)
    }))
  }

  const handleRemoveQuestion = (index: number) => {
    setRequestForm(prev => ({
      ...prev,
      specificQuestions: prev.specificQuestions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const requestId = Date.now().toString()
      const requestData: FeedbackRequest = {
        requestId,
        sessionId,
        requesterId: user.uid,
        requesterName: user.displayName || user.email || '익명 사용자',
        requesterEmail: user.email || undefined,
        
        feedbackType: requestForm.feedbackType,
        categories: requestForm.categories,
        title: requestForm.title,
        description: requestForm.description,
        specificQuestions: requestForm.specificQuestions.filter(q => q.trim()),
        
        createdAt: Date.now(),
        deadline: requestForm.deadline ? new Date(requestForm.deadline).getTime() : undefined,
        status: FeedbackStatus.PENDING,
        priority: requestForm.priority,
        isAnonymous: requestForm.isAnonymous,
        
        linkedSessionData: sessionTitle ? {
          sessionTitle,
          sessionType: 'feedback_session',
        } : undefined
      }

      const requestRef = ref(database, `feedbackRequests/${sessionId}/${requestId}`)
      await set(requestRef, requestData)

      // 폼 초기화
      setRequestForm({
        title: '',
        description: '',
        feedbackType: FeedbackType.PEER_REVIEW,
        categories: [],
        specificQuestions: [''],
        deadline: '',
        priority: 'medium',
        isAnonymous: false
      })
      setShowRequestForm(false)
      
      alert('피드백 요청이 성공적으로 등록되었습니다!')
    } catch (error) {
      console.error('피드백 요청 등록 오류:', error)
      alert('피드백 요청 등록에 실패했습니다.')
    }
  }

  const getFeedbackTypeLabel = (type: FeedbackType) => {
    const labels = {
      [FeedbackType.PEER_REVIEW]: '동료 리뷰',
      [FeedbackType.MENTOR_GUIDANCE]: '멘토 가이던스',
      [FeedbackType.SKILL_ASSESSMENT]: '기술 평가',
      [FeedbackType.PROJECT_REVIEW]: '프로젝트 리뷰',
      [FeedbackType.PRESENTATION_FEEDBACK]: '발표 피드백',
      [FeedbackType.COLLABORATION_FEEDBACK]: '협업 피드백'
    }
    return labels[type]
  }

  const getCategoryLabel = (category: FeedbackCategory) => {
    const labels = {
      [FeedbackCategory.TECHNICAL_SKILLS]: '기술적 역량',
      [FeedbackCategory.COMMUNICATION]: '커뮤니케이션',
      [FeedbackCategory.LEADERSHIP]: '리더십',
      [FeedbackCategory.PROBLEM_SOLVING]: '문제 해결',
      [FeedbackCategory.CREATIVITY]: '창의성',
      [FeedbackCategory.TEAMWORK]: '팀워크',
      [FeedbackCategory.PRESENTATION]: '발표 능력',
      [FeedbackCategory.ANALYTICAL_THINKING]: '분석적 사고'
    }
    return labels[category]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return priority
    }
  }

  const handleProvideFeedback = (request: FeedbackRequest) => {
    setSelectedRequest(request)
    setShowProvisionForm(true)
  }

  const handleFeedbackSubmitted = () => {
    // 피드백 제출 후 목록 새로고침을 위해 상태 업데이트
    setShowProvisionForm(false)
    setSelectedRequest(null)
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-lg" style={{ color: theme.colors.text.secondary }}>
            피드백 시스템을 로드하는 중...
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
              🤝 동료 간 피드백 시스템
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
              전문적인 동료 피드백을 주고받으며 함께 성장하세요
            </p>
          </div>
          
          <Button onClick={() => setShowRequestForm(true)}>
            + 피드백 요청하기
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'request'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            피드백 요청 ({feedbackRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('provide')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'provide'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            내 요청 ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            받은 피드백 ({receivedFeedback.length})
          </button>
        </div>
      </Card>

      {/* 피드백 요청 폼 */}
      {showRequestForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            새 피드백 요청
          </h3>
          
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">제목 *</label>
              <input
                type="text"
                required
                value={requestForm.title}
                onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="피드백을 받고 싶은 내용을 간단히 설명해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">피드백 유형 *</label>
              <select
                value={requestForm.feedbackType}
                onChange={(e) => setRequestForm(prev => ({ ...prev, feedbackType: e.target.value as FeedbackType }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(FeedbackType).map(type => (
                  <option key={type} value={type}>
                    {getFeedbackTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">피드백 카테고리 *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(FeedbackCategory).map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestForm.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{getCategoryLabel(category)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">상세 설명 *</label>
              <textarea
                required
                rows={4}
                value={requestForm.description}
                onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="어떤 피드백을 받고 싶은지 구체적으로 설명해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">구체적 질문</label>
              {requestForm.specificQuestions.map((question, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`질문 ${index + 1}`}
                  />
                  {requestForm.specificQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddQuestion}>
                질문 추가
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">우선순위</label>
                <select
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">마감일</label>
                <input
                  type="datetime-local"
                  value={requestForm.deadline}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center mt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestForm.isAnonymous}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">익명 요청</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                취소
              </Button>
              <Button type="submit" disabled={!requestForm.title || !requestForm.description || requestForm.categories.length === 0}>
                요청 등록
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 컨텐츠 영역 */}
      {activeTab === 'request' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            피드백 요청 목록
          </h3>
          
          {feedbackRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">현재 대기 중인 피드백 요청이 없습니다.</div>
              <p className="text-sm text-gray-400">
                동료들이 피드백을 요청하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackRequests.map((request) => (
                <div key={request.requestId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{request.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {getPriorityLabel(request.priority)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getFeedbackTypeLabel(request.feedbackType)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.categories.map(category => (
                          <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {getCategoryLabel(category)}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        요청자: {request.isAnonymous ? '익명' : request.requesterName} • 
                        요청일: {new Date(request.createdAt).toLocaleDateString()}
                        {request.deadline && ` • 마감: ${new Date(request.deadline).toLocaleDateString()}`}
                      </div>
                    </div>
                    
                    <Button size="sm" onClick={() => handleProvideFeedback(request)}>
                      피드백 제공
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'provide' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            내가 요청한 피드백
          </h3>
          
          {myRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">아직 요청한 피드백이 없습니다.</div>
              <p className="text-sm text-gray-400">
                "피드백 요청하기" 버튼을 클릭하여 동료들에게 피드백을 요청해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.requestId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{request.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === FeedbackStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                          request.status === FeedbackStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status === FeedbackStatus.PENDING ? '대기 중' :
                           request.status === FeedbackStatus.COMPLETED ? '완료' : request.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="text-xs text-gray-500">
                        요청일: {new Date(request.createdAt).toLocaleDateString()}
                        {request.deadline && ` • 마감: ${new Date(request.deadline).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'received' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
            받은 피드백
          </h3>
          
          {receivedFeedback.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">아직 받은 피드백이 없습니다.</div>
              <p className="text-sm text-gray-400">
                동료들이 피드백을 제공하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedFeedback.map((feedback) => (
                <div key={feedback.responseId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">전체 평가: {feedback.overallRating}/10</h4>
                      <p className="text-sm text-gray-600">
                        피드백 제공자: {feedback.reviewerName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-700">강점</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {feedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-orange-700">개선 영역</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {feedback.improvementAreas.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-blue-700">상세 피드백</h5>
                      <p className="text-sm text-gray-600">{feedback.detailedFeedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 피드백 제공 폼 */}
      {showProvisionForm && selectedRequest && (
        <FeedbackProvisionForm
          request={selectedRequest}
          onClose={() => setShowProvisionForm(false)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  )
}