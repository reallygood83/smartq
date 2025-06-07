'use client'

import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Session, Question } from '@/lib/utils'
import { getStoredApiKey } from '@/lib/encryption'

interface AIAnalysisPanelProps {
  session: Session
  questions: Question[]
  sessionId: string
}

type AnalysisType = 'quick' | 'detailed'

export default function AIAnalysisPanel({ session, questions, sessionId }: AIAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const hasApiKey = !!getStoredApiKey()
  const canAnalyze = hasApiKey && questions.length > 0


  return (
    <Card className="mb-6">
      <div className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI 분석 시스템</h3>
              <p className="text-sm text-gray-600">
                {canAnalyze 
                  ? '질문을 분석하여 교육 인사이트를 제공합니다'
                  : !hasApiKey 
                    ? 'API 키 설정이 필요합니다' 
                    : '질문이 제출되면 분석할 수 있습니다'
                }
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6">
                {/* API 키 미설정 경고 */}
                {!hasApiKey && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      AI 분석을 사용하려면 Gemini API 키가 필요합니다.
                      <a href="/teacher/settings" className="ml-2 font-medium underline">
                        설정하기 →
                      </a>
                    </p>
                  </div>
                )}

                {/* AI 분석 도구 - 단순화된 네비게이션 */}
                <div className="space-y-4">
                  {/* 현재 상태 요약 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">질문 현황</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          총 {questions.length}개의 질문이 제출되었습니다
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                        <div className="text-xs text-gray-500">개 질문</div>
                      </div>
                    </div>
                  </div>

                  {/* 분석 도구 바로가기 */}
                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">🔍 AI 분석 도구</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {/* 종합 분석 */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">📊 종합 분석</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                질문 패턴, 학습 수준, 교육 효과를 종합적으로 분석합니다
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = `/teacher/session/${sessionId}/comprehensive-analysis`}
                            >
                              분석하기
                            </Button>
                          </div>
                        </div>

                        {/* 실시간 모니터링 */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">📡 실시간 모니터링</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                세션 진행 상황과 참여도를 실시간으로 모니터링합니다
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/teacher/session/${sessionId}/real-time-monitoring`}
                            >
                              모니터링
                            </Button>
                          </div>
                        </div>

                        {/* 교육자 분석 - 성인 교육 세션만 */}
                        {session.isAdultEducation && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">👨‍🏫 교육자 분석</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  교육 효과성과 개선 방안을 분석합니다
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = `/teacher/session/${sessionId}/instructor-analysis`}
                              >
                                분석하기
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        질문을 기다리고 있습니다
                      </h3>
                      <p className="text-gray-600">
                        학생들이 질문을 제출하면 AI 분석을 시작할 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}