'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFullTheme } from '@/contexts/EducationLevelContext'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { FeedbackRequest, FeedbackResponse, FeedbackCategory } from '@/types/feedback'
import { database } from '@/lib/firebase'
import { ref, set } from 'firebase/database'

interface FeedbackProvisionFormProps {
  request: FeedbackRequest
  onClose: () => void
  onSubmitted: () => void
}

export default function FeedbackProvisionForm({ request, onClose, onSubmitted }: FeedbackProvisionFormProps) {
  const { user } = useAuth()
  const theme = useFullTheme()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    overallRating: 5,
    categoryRatings: request.categories.map(category => ({
      category,
      rating: 5,
      feedback: ''
    })),
    strengths: [''],
    improvementAreas: [''],
    specificSuggestions: [''],
    actionItems: [''],
    detailedFeedback: '',
    resourceRecommendations: [{ title: '', url: '', description: '', type: 'article' as const }],
    followUpSuggestions: [''],
    mentorshipOffer: false,
    collaborationInterest: false,
    confidence: 8,
    timeSpent: 0
  })

  const [reviewerProfile] = useState({
    expertise: ['웹 개발', '프로젝트 관리'],
    experienceYears: '5-10년',
    industry: 'IT',
    role: '시니어 개발자',
    certifications: ['PMP', 'AWS Solutions Architect']
  })

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

  const handleArrayFieldChange = (field: 'strengths' | 'improvementAreas' | 'specificSuggestions' | 'actionItems' | 'followUpSuggestions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const handleAddArrayField = (field: 'strengths' | 'improvementAreas' | 'specificSuggestions' | 'actionItems' | 'followUpSuggestions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const handleRemoveArrayField = (field: 'strengths' | 'improvementAreas' | 'specificSuggestions' | 'actionItems' | 'followUpSuggestions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleCategoryRatingChange = (category: FeedbackCategory, field: 'rating' | 'feedback', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      categoryRatings: prev.categoryRatings.map(rating => 
        rating.category === category 
          ? { ...rating, [field]: value }
          : rating
      )
    }))
  }

  const handleResourceChange = (index: number, field: 'title' | 'url' | 'description' | 'type', value: string) => {
    setFormData(prev => ({
      ...prev,
      resourceRecommendations: prev.resourceRecommendations.map((resource, i) => 
        i === index 
          ? { ...resource, [field]: value }
          : resource
      )
    }))
  }

  const handleAddResource = () => {
    setFormData(prev => ({
      ...prev,
      resourceRecommendations: [...prev.resourceRecommendations, { title: '', url: '', description: '', type: 'article' }]
    }))
  }

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resourceRecommendations: prev.resourceRecommendations.filter((_, i) => i !== index)
    }))
  }

  const calculateQualityMetrics = () => {
    // AI 분석 시뮬레이션
    const filledFields = [
      ...formData.strengths.filter(s => s.trim()),
      ...formData.improvementAreas.filter(s => s.trim()),
      ...formData.specificSuggestions.filter(s => s.trim()),
      formData.detailedFeedback.trim() ? 1 : 0
    ].length

    const totalPossibleFields = formData.strengths.length + formData.improvementAreas.length + formData.specificSuggestions.length + 1
    
    return {
      qualityScore: Math.min(95, Math.max(60, (filledFields / totalPossibleFields) * 100 + Math.random() * 10)),
      sentiment: 'constructive' as const,
      actionability: Math.min(10, Math.max(6, formData.actionItems.filter(a => a.trim()).length + 6)),
      specificity: Math.min(10, Math.max(5, formData.detailedFeedback.length / 20))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const responseId = Date.now().toString()
      const aiAnalysis = calculateQualityMetrics()

      const responseData: FeedbackResponse = {
        responseId,
        requestId: request.requestId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || '익명 리뷰어',
        reviewerProfile,
        
        overallRating: formData.overallRating,
        categoryRatings: formData.categoryRatings,
        
        strengths: formData.strengths.filter(s => s.trim()),
        improvementAreas: formData.improvementAreas.filter(s => s.trim()),
        specificSuggestions: formData.specificSuggestions.filter(s => s.trim()),
        actionItems: formData.actionItems.filter(s => s.trim()),
        
        detailedFeedback: formData.detailedFeedback,
        resourceRecommendations: formData.resourceRecommendations.filter(r => r.title.trim()),
        
        followUpSuggestions: formData.followUpSuggestions.filter(s => s.trim()),
        mentorshipOffer: formData.mentorshipOffer,
        collaborationInterest: formData.collaborationInterest,
        
        submittedAt: Date.now(),
        timeSpent: formData.timeSpent,
        confidence: formData.confidence,
        isConstructive: true,
        
        aiAnalysis
      }

      // 피드백 응답 저장
      const responseRef = ref(database, `feedbackResponses/${request.sessionId}/${responseId}`)
      await set(responseRef, responseData)

      // 요청 상태 업데이트 (완료로 변경)
      const requestUpdateRef = ref(database, `feedbackRequests/${request.sessionId}/${request.requestId}/status`)
      await set(requestUpdateRef, 'completed')

      alert('피드백이 성공적으로 제출되었습니다!')
      onSubmitted()
      onClose()
    } catch (error) {
      console.error('피드백 제출 오류:', error)
      alert('피드백 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="m-0">
          <div className="sticky top-0 bg-white border-b pb-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>
                피드백 제공: {request.title}
              </h2>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>요청자:</strong> {request.isAnonymous ? '익명' : request.requesterName}</p>
              <p><strong>설명:</strong> {request.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 전체 평가 */}
            <div>
              <label className="block text-sm font-medium mb-3">전체 평가 (1-10점)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.overallRating}
                  onChange={(e) => setFormData(prev => ({ ...prev, overallRating: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-lg font-semibold w-8">{formData.overallRating}</span>
              </div>
            </div>

            {/* 카테고리별 평가 */}
            <div>
              <h3 className="text-lg font-medium mb-4">카테고리별 상세 평가</h3>
              <div className="space-y-6">
                {formData.categoryRatings.map((rating, index) => (
                  <div key={rating.category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{getCategoryLabel(rating.category)}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">점수 (1-10)</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={rating.rating}
                            onChange={(e) => handleCategoryRatingChange(rating.category, 'rating', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="font-semibold w-8">{rating.rating}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">구체적 피드백</label>
                        <textarea
                          rows={3}
                          value={rating.feedback}
                          onChange={(e) => handleCategoryRatingChange(rating.category, 'feedback', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`${getCategoryLabel(rating.category)}에 대한 구체적인 피드백을 작성하세요`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 강점 */}
            <div>
              <label className="block text-sm font-medium mb-3">🌟 강점</label>
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => handleArrayFieldChange('strengths', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`강점 ${index + 1}`}
                  />
                  {formData.strengths.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => handleRemoveArrayField('strengths', index)}>
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddArrayField('strengths')}>
                강점 추가
              </Button>
            </div>

            {/* 개선 영역 */}
            <div>
              <label className="block text-sm font-medium mb-3">🎯 개선 영역</label>
              {formData.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => handleArrayFieldChange('improvementAreas', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`개선 영역 ${index + 1}`}
                  />
                  {formData.improvementAreas.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => handleRemoveArrayField('improvementAreas', index)}>
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddArrayField('improvementAreas')}>
                개선 영역 추가
              </Button>
            </div>

            {/* 구체적 제안 */}
            <div>
              <label className="block text-sm font-medium mb-3">💡 구체적 제안</label>
              {formData.specificSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={suggestion}
                    onChange={(e) => handleArrayFieldChange('specificSuggestions', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`제안 ${index + 1}`}
                  />
                  {formData.specificSuggestions.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => handleRemoveArrayField('specificSuggestions', index)}>
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddArrayField('specificSuggestions')}>
                제안 추가
              </Button>
            </div>

            {/* 실행 항목 */}
            <div>
              <label className="block text-sm font-medium mb-3">📋 실행 항목</label>
              {formData.actionItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayFieldChange('actionItems', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`실행 항목 ${index + 1}`}
                  />
                  {formData.actionItems.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => handleRemoveArrayField('actionItems', index)}>
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddArrayField('actionItems')}>
                실행 항목 추가
              </Button>
            </div>

            {/* 상세 피드백 */}
            <div>
              <label className="block text-sm font-medium mb-3">📝 상세 피드백</label>
              <textarea
                rows={6}
                value={formData.detailedFeedback}
                onChange={(e) => setFormData(prev => ({ ...prev, detailedFeedback: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="종합적이고 건설적인 피드백을 작성해주세요..."
              />
            </div>

            {/* 추천 자료 */}
            <div>
              <label className="block text-sm font-medium mb-3">📚 추천 자료</label>
              {formData.resourceRecommendations.map((resource, index) => (
                <div key={index} className="border rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="자료 제목"
                    />
                    <select
                      value={resource.type}
                      onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="book">책</option>
                      <option value="course">강의</option>
                      <option value="article">아티클</option>
                      <option value="tool">도구</option>
                      <option value="community">커뮤니티</option>
                    </select>
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="URL (선택사항)"
                    />
                    <input
                      type="text"
                      value={resource.description}
                      onChange={(e) => handleResourceChange(index, 'description', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="간단한 설명"
                    />
                  </div>
                  {formData.resourceRecommendations.length > 1 && (
                    <div className="mt-3 flex justify-end">
                      <Button type="button" variant="outline" onClick={() => handleRemoveResource(index)}>
                        자료 삭제
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddResource}>
                추천 자료 추가
              </Button>
            </div>

            {/* 후속 조치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">🚀 후속 제안</label>
                {formData.followUpSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={suggestion}
                      onChange={(e) => handleArrayFieldChange('followUpSuggestions', index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`후속 제안 ${index + 1}`}
                    />
                    {formData.followUpSuggestions.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => handleRemoveArrayField('followUpSuggestions', index)}>
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddArrayField('followUpSuggestions')}>
                  후속 제안 추가
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">피드백 신뢰도 (1-10)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.confidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="font-semibold w-8">{formData.confidence}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.mentorshipOffer}
                      onChange={(e) => setFormData(prev => ({ ...prev, mentorshipOffer: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">멘토링 제안</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.collaborationInterest}
                      onChange={(e) => setFormData(prev => ({ ...prev, collaborationInterest: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">협업 관심</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.detailedFeedback.trim()}>
                {isSubmitting ? '제출 중...' : '피드백 제출'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}