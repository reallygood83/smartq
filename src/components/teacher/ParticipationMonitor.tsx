'use client'

import { useState, useEffect } from 'react'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Card } from '@/components/common/Card'
import { StudentResponse } from '@/types/teacher-led'

interface ParticipationMetrics {
  totalConnectedStudents: number
  totalResponsesForCurrentQuestion: number
  participationRate: number
  avgResponseLength: number
  responseDistribution: {
    short: number    // < 20자
    medium: number   // 20-100자
    long: number     // > 100자
  }
}

interface ParticipationMonitorProps {
  sessionId: string
  activeQuestionId: string | null
}

export default function ParticipationMonitor({ sessionId, activeQuestionId }: ParticipationMonitorProps) {
  const [metrics, setMetrics] = useState<ParticipationMetrics>({
    totalConnectedStudents: 0,
    totalResponsesForCurrentQuestion: 0,
    participationRate: 0,
    avgResponseLength: 0,
    responseDistribution: { short: 0, medium: 0, long: 0 }
  })

  const [studentConnections, setStudentConnections] = useState<Set<string>>(new Set())

  // 현재 활성 질문에 대한 답변 모니터링
  useEffect(() => {
    if (!sessionId || !activeQuestionId) {
      setMetrics(prev => ({
        ...prev,
        totalResponsesForCurrentQuestion: 0,
        participationRate: 0,
        avgResponseLength: 0,
        responseDistribution: { short: 0, medium: 0, long: 0 }
      }))
      return
    }

    const responsesRef = ref(database, `studentResponses/${sessionId}`)
    const unsubscribe = onValue(responsesRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        try {
          // 현재 활성 질문에 대한 답변만 필터링
          const currentQuestionResponses = Object.values(data)
            .filter((response: any) => response && response.questionId === activeQuestionId) as StudentResponse[]

          const responseCount = currentQuestionResponses.length
          const totalStudents = Math.max(studentConnections.size, responseCount) // 최소한 답변한 학생 수는 보장

          // 답변 길이 분석
          const lengths = currentQuestionResponses.map(r => r?.text?.length || 0)
          const avgLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0

          // 답변 길이별 분포 (성능 최적화)
          const distribution = { short: 0, medium: 0, long: 0 }
          lengths.forEach(len => {
            if (len < 20) distribution.short++
            else if (len <= 100) distribution.medium++
            else distribution.long++
          })

          setMetrics({
            totalConnectedStudents: totalStudents,
            totalResponsesForCurrentQuestion: responseCount,
            participationRate: totalStudents > 0 ? (responseCount / totalStudents) * 100 : 0,
            avgResponseLength: Math.round(avgLength),
            responseDistribution: distribution
          })
        } catch (error) {
          console.error('참여도 모니터링 데이터 처리 오류:', error)
          setMetrics(prev => ({
            ...prev,
            totalResponsesForCurrentQuestion: 0,
            participationRate: 0,
            avgResponseLength: 0,
            responseDistribution: { short: 0, medium: 0, long: 0 }
          }))
        }
      } else {
        setMetrics(prev => ({
          ...prev,
          totalResponsesForCurrentQuestion: 0,
          participationRate: 0,
          avgResponseLength: 0,
          responseDistribution: { short: 0, medium: 0, long: 0 }
        }))
      }
    })

    return unsubscribe
  }, [sessionId, activeQuestionId, studentConnections.size])

  // 학생 질문 제출로 접속 학생 수 추정 (간접적 방법)
  useEffect(() => {
    if (!sessionId) return

    const questionsRef = ref(database, `questions/${sessionId}`)
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const questions = Object.values(data) as any[]
        const uniqueStudents = new Set(questions.map(q => q.studentId))
        setStudentConnections(uniqueStudents)
        
        setMetrics(prev => ({
          ...prev,
          totalConnectedStudents: Math.max(prev.totalConnectedStudents, uniqueStudents.size)
        }))
      }
    })

    return unsubscribe
  }, [sessionId])

  const getParticipationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getParticipationStatus = (rate: number) => {
    if (rate >= 80) return '🟢 활발'
    if (rate >= 60) return '🟡 보통'
    return '🔴 저조'
  }

  if (!activeQuestionId) {
    return (
      <Card className="p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
          📊 실시간 참여도
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          활성화된 질문이 없습니다.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">
        📊 실시간 참여도
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 참여율 */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getParticipationColor(metrics.participationRate)}`}>
            {Math.round(metrics.participationRate)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getParticipationStatus(metrics.participationRate)}
          </div>
        </div>
        
        {/* 답변 수 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.totalResponsesForCurrentQuestion}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            답변 수
          </div>
        </div>
      </div>

      {/* 세부 정보 */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">접속 학생:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            약 {metrics.totalConnectedStudents}명
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">평균 답변 길이:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metrics.avgResponseLength}자
          </span>
        </div>
        
        {/* 답변 길이 분포 */}
        {metrics.totalResponsesForCurrentQuestion > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">답변 길이 분포:</div>
            <div className="flex space-x-2 text-xs">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                짧음 {metrics.responseDistribution.short}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                보통 {metrics.responseDistribution.medium}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                상세 {metrics.responseDistribution.long}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}