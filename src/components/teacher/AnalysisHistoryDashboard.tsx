'use client'

import { useState, useEffect } from 'react'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { StudentResponseAnalysis, ComprehensiveAnalysis, TeacherQuestion } from '@/types/teacher-led'
import { Session } from '@/lib/utils'

interface AnalysisHistoryDashboardProps {
  sessionId?: string // 특정 세션의 분석만 보려면 sessionId 제공
  showAllSessions?: boolean // 전체 세션의 분석을 보려면 true
}

interface AnalysisWithSession {
  analysis: StudentResponseAnalysis | ComprehensiveAnalysis
  session: Session
  question: TeacherQuestion
  type: 'individual' | 'comprehensive'
}

export default function AnalysisHistoryDashboard({ 
  sessionId, 
  showAllSessions = false 
}: AnalysisHistoryDashboardProps) {
  const { user } = useAuth()
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisWithSession[]>([])
  const [sessions, setSessions] = useState<{[id: string]: Session}>({})
  const [questions, setQuestions] = useState<{[sessionId: string]: {[questionId: string]: TeacherQuestion}}>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'comprehensive' | 'individual'>('all')
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisWithSession | null>(null)

  // 세션 정보 로드
  useEffect(() => {
    if (!user) return

    const sessionsRef = ref(database, 'sessions')
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // 현재 사용자의 세션만 필터링
        const userSessions: {[id: string]: Session} = {}
        Object.entries(data).forEach(([id, sessionData]) => {
          const session = sessionData as Session
          if (session.teacherId === user.uid) {
            userSessions[id] = { ...session, sessionId: id }
          }
        })
        setSessions(userSessions)
      }
    })

    return unsubscribe
  }, [user])

  // 교사 질문 정보 로드
  useEffect(() => {
    if (!user || Object.keys(sessions).length === 0) return

    const sessionIds = showAllSessions 
      ? Object.keys(sessions)
      : sessionId 
        ? [sessionId]
        : Object.keys(sessions)

    const unsubscribes: (() => void)[] = []

    sessionIds.forEach((sId) => {
      if (sessions[sId]) {
        const questionsRef = ref(database, `teacherQuestions/${sId}`)
        const unsubscribe = onValue(questionsRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            setQuestions(prev => ({
              ...prev,
              [sId]: data
            }))
          }
        })
        unsubscribes.push(unsubscribe)
      }
    })

    return () => unsubscribes.forEach(unsub => unsub())
  }, [user, sessions, sessionId, showAllSessions])

  // 분석 데이터 로드
  useEffect(() => {
    if (!user || Object.keys(sessions).length === 0) return

    const sessionIds = showAllSessions 
      ? Object.keys(sessions)
      : sessionId 
        ? [sessionId]
        : Object.keys(sessions)

    const unsubscribes: (() => void)[] = []
    let allAnalyses: AnalysisWithSession[] = []

    const loadAnalysisForSession = (sId: string) => {
      if (!sessions[sId]) return

      // 종합 분석 로드
      const comprehensiveRef = ref(database, `comprehensiveAnalyses/${sId}`)
      const unsubComprehensive = onValue(comprehensiveRef, (snapshot) => {
        const data = snapshot.val()
        console.log(`Comprehensive analyses for session ${sId}:`, data)
        if (data) {
          try {
            const comprehensiveAnalyses = Object.values(data).filter(item => item && typeof item === 'object') as ComprehensiveAnalysis[]
            const comprehensiveWithSession = comprehensiveAnalyses
              .filter(analysis => analysis && analysis.questionId)
              .map(analysis => ({
                analysis,
                session: sessions[sId],
                question: questions[sId]?.[analysis.questionId],
                type: 'comprehensive' as const
              }))
              .filter(item => item.question) // 질문 정보가 있는 것만 포함

            allAnalyses = allAnalyses.filter(item => 
              !(item.type === 'comprehensive' && item.session.sessionId === sId)
            )
            allAnalyses.push(...comprehensiveWithSession)
            
            // 시간순 정렬
            allAnalyses.sort((a, b) => (b.analysis.generatedAt || 0) - (a.analysis.generatedAt || 0))
            setAnalysisHistory([...allAnalyses])
          } catch (error) {
            console.error('종합 분석 데이터 처리 오류:', error)
          }
        }
      })

      // 개별 분석 로드
      const individualRef = ref(database, `questionAnalyses/${sId}`)
      const unsubIndividual = onValue(individualRef, (snapshot) => {
        const data = snapshot.val()
        console.log(`Individual analyses for session ${sId}:`, data)
        if (data) {
          try {
            const individualAnalyses = Object.values(data).filter(item => item && typeof item === 'object') as StudentResponseAnalysis[]
            const individualWithSession = individualAnalyses
              .filter(analysis => analysis && analysis.questionId)
              .map(analysis => ({
                analysis,
                session: sessions[sId],
                question: questions[sId]?.[analysis.questionId],
                type: 'individual' as const
              }))
              .filter(item => item.question) // 질문 정보가 있는 것만 포함

            allAnalyses = allAnalyses.filter(item => 
              !(item.type === 'individual' && item.session.sessionId === sId)
            )
            allAnalyses.push(...individualWithSession)
            
            // 시간순 정렬
            allAnalyses.sort((a, b) => (b.analysis.generatedAt || 0) - (a.analysis.generatedAt || 0))
            setAnalysisHistory([...allAnalyses])
          } catch (error) {
            console.error('개별 분석 데이터 처리 오류:', error)
          }
        }
      })

      unsubscribes.push(unsubComprehensive, unsubIndividual)
    }

    console.log('Loading analyses for sessions:', sessionIds)
    sessionIds.forEach(loadAnalysisForSession)
    setLoading(false)

    return () => unsubscribes.forEach(unsub => unsub())
  }, [user, sessions, questions, sessionId, showAllSessions])

  const filteredHistory = analysisHistory.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const formatAnalysisPreview = (item: AnalysisWithSession) => {
    if (item.type === 'comprehensive') {
      const analysis = item.analysis as ComprehensiveAnalysis
      return {
        responseCount: analysis.question?.responseCount || 0,
        mainMetric: `이해도 ${analysis.overallAssessment?.classUnderstandingLevel || 0}%`,
        secondaryMetric: `참여도 ${analysis.overallAssessment?.engagementLevel || 0}%`,
        status: analysis.overallAssessment?.readinessForNextTopic ? '✓ 다음 단계 준비됨' : '⚠ 추가 학습 필요'
      }
    } else {
      const analysis = item.analysis as StudentResponseAnalysis
      const individualAnalyses = analysis.individualAnalyses || []
      const avgScore = individualAnalyses.length > 0 
        ? Math.round(
            individualAnalyses.reduce((acc, ind) => acc + (ind?.analysisResults?.comprehensionScore || 0), 0) / 
            individualAnalyses.length
          )
        : 0
      return {
        responseCount: analysis.question?.responseCount || 0,
        mainMetric: `평균 이해도 ${avgScore}%`,
        secondaryMetric: `분석 대상 ${individualAnalyses.length}명`,
        status: `개별 피드백 ${individualAnalyses.length}개`
      }
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">분석 기록을 불러오는 중...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 필터 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📊 AI 분석 기록
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {showAllSessions 
                ? `전체 세션의 분석 기록 (${filteredHistory.length}개)`
                : sessionId 
                  ? `현재 세션의 분석 기록 (${filteredHistory.length}개)`
                  : `모든 분석 기록 (${filteredHistory.length}개)`
              }
            </p>
          </div>
          
          {/* 필터 버튼 */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'comprehensive' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('comprehensive')}
            >
              📋 종합 분석
            </Button>
            <Button
              variant={filter === 'individual' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('individual')}
            >
              👤 개별 분석
            </Button>
          </div>
        </div>
      </Card>

      {/* 분석 기록 목록 */}
      {filteredHistory.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              아직 분석 기록이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              교사 주도 모드에서 AI 분석을 실행하면 기록이 여기에 저장됩니다.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const preview = formatAnalysisPreview(item)
            return (
              <Card 
                key={`${item.session.sessionId}-${item.analysis.analysisId}`}
                className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedAnalysis(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {item.type === 'comprehensive' ? '📋' : '👤'}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.type === 'comprehensive' ? '종합 분석' : '개별 분석'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.session.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.analysis.generatedAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(item.analysis.generatedAt).toLocaleTimeString('ko-KR')}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    📝 {item.question?.text || '질문 정보 없음'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      답변 {preview.responseCount}개
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {preview.mainMetric}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {preview.status}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 선택된 분석 상세 보기 모달 */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  분석 결과 상세보기
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  닫기
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    세션: {selectedAnalysis.session?.title || '제목 없음'}
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    질문: {selectedAnalysis.question?.text || '질문 정보 없음'}
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-xs mt-2">
                    분석 일시: {selectedAnalysis.analysis?.generatedAt ? new Date(selectedAnalysis.analysis.generatedAt).toLocaleString('ko-KR') : '날짜 정보 없음'}
                  </p>
                </div>
                
                {selectedAnalysis.type === 'comprehensive' ? (
                  <div className="space-y-4">
                    {/* 종합 분석 결과 표시 */}
                    <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                      상세한 분석 결과는 해당 세션의 분석 페이지에서 확인하실 수 있습니다.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 개별 분석 결과 표시 */}
                    <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                      상세한 분석 결과는 해당 세션의 분석 페이지에서 확인하실 수 있습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}