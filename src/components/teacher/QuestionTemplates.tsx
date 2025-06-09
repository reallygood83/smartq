'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Subject, SessionType } from '@/lib/utils'

interface QuestionTemplate {
  id: string
  category: string
  title: string
  template: string
  description: string
  subjects: Subject[]
  sessionTypes: SessionType[]
  difficulty: 'elementary' | 'middle' | 'high' | 'adult'
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
}

interface QuestionTemplatesProps {
  onSelectTemplate: (template: string) => void
  sessionType?: SessionType
  subjects?: Subject[]
  onClose?: () => void
}

export default function QuestionTemplates({ 
  onSelectTemplate, 
  sessionType,
  subjects = [],
  onClose 
}: QuestionTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // 질문 템플릿 데이터베이스
  const templates: QuestionTemplate[] = [
    // 기본 이해도 확인 질문
    {
      id: 'understanding-1',
      category: '이해도 확인',
      title: '핵심 개념 이해',
      template: '오늘 배운 [핵심개념]에 대해 여러분만의 말로 설명해보세요.',
      description: '학생들이 핵심 개념을 자신의 언어로 표현할 수 있는지 확인',
      subjects: [Subject.KOREAN, Subject.MATH, Subject.SCIENCE, Subject.SOCIAL],
      sessionTypes: [SessionType.GENERAL, SessionType.INQUIRY],
      difficulty: 'elementary',
      cognitiveLevel: 'understand'
    },
    {
      id: 'understanding-2', 
      category: '이해도 확인',
      title: '실생활 연결',
      template: '[오늘 배운 내용]이 우리 실생활에서 어떻게 사용되고 있는지 예를 들어보세요.',
      description: '학습 내용과 실생활의 연결고리를 찾는 능력 확인',
      subjects: [Subject.SCIENCE, Subject.MATH, Subject.SOCIAL],
      sessionTypes: [SessionType.GENERAL, SessionType.INQUIRY],
      difficulty: 'middle',
      cognitiveLevel: 'apply'
    },
    {
      id: 'critical-1',
      category: '비판적 사고',
      title: '다양한 관점',
      template: '[주제]에 대해 찬성하는 입장과 반대하는 입장을 각각 설명하고, 여러분의 의견은 무엇인가요?',
      description: '다양한 관점에서 문제를 바라보는 능력 개발',
      subjects: [Subject.SOCIAL, Subject.KOREAN],
      sessionTypes: [SessionType.DEBATE, SessionType.DISCUSSION],
      difficulty: 'high',
      cognitiveLevel: 'evaluate'
    },
    {
      id: 'creative-1',
      category: '창의적 사고',
      title: '새로운 해결책',
      template: '만약 [현재 상황]에서 [제약조건]이 있다면, 어떤 창의적인 해결방법을 제안하시겠습니까?',
      description: '제약 조건 하에서 창의적 문제해결 능력 평가',
      subjects: [Subject.SCIENCE, Subject.MATH, Subject.ART],
      sessionTypes: [SessionType.PROBLEM, SessionType.CREATIVE],
      difficulty: 'high',
      cognitiveLevel: 'create'
    },
    {
      id: 'inquiry-1',
      category: '탐구 질문',
      title: '가설 설정',
      template: '[현상/문제]에 대한 여러분만의 가설을 세우고, 이를 검증하기 위한 방법을 제안해보세요.',
      description: '과학적 사고 과정과 탐구 설계 능력 확인',
      subjects: [Subject.SCIENCE],
      sessionTypes: [SessionType.INQUIRY],
      difficulty: 'middle',
      cognitiveLevel: 'create'
    },
    {
      id: 'reflection-1',
      category: '성찰 질문',
      title: '학습 성찰',
      template: '오늘 학습한 내용 중 가장 어려웠던 부분은 무엇이고, 어떻게 극복할 수 있을까요?',
      description: '메타인지 능력과 자기주도 학습 태도 확인',
      subjects: [Subject.KOREAN, Subject.MATH, Subject.SCIENCE, Subject.SOCIAL, Subject.ENGLISH],
      sessionTypes: [SessionType.GENERAL],
      difficulty: 'elementary',
      cognitiveLevel: 'evaluate'
    },
    {
      id: 'application-1',
      category: '적용 질문',
      title: '문제 해결 적용',
      template: '지금까지 배운 [방법/공식/개념]을 사용해서 [새로운 상황]의 문제를 해결해보세요.',
      description: '학습한 내용을 새로운 상황에 적용하는 능력 평가',
      subjects: [Subject.MATH, Subject.SCIENCE],
      sessionTypes: [SessionType.PROBLEM, SessionType.INQUIRY],
      difficulty: 'middle',
      cognitiveLevel: 'apply'
    },
    {
      id: 'collaboration-1',
      category: '협력 질문',
      title: '팀워크 경험',
      template: '모둠 활동에서 여러분이 기여한 부분은 무엇이고, 다른 친구들에게서 배운 점은 무엇인가요?',
      description: '협업 능력과 동료 학습 경험 성찰',
      subjects: [Subject.KOREAN, Subject.SOCIAL, Subject.ART],
      sessionTypes: [SessionType.DISCUSSION, SessionType.CREATIVE],
      difficulty: 'elementary',
      cognitiveLevel: 'evaluate'
    }
  ]

  // 카테고리 목록
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]
  const difficulties = ['all', 'elementary', 'middle', 'high', 'adult']

  // 필터링된 템플릿
  const filteredTemplates = templates.filter(template => {
    // 카테고리 필터
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false
    }
    
    // 난이도 필터
    if (selectedDifficulty !== 'all' && template.difficulty !== selectedDifficulty) {
      return false
    }
    
    // 세션 타입 필터 (선택사항)
    if (sessionType && !template.sessionTypes.includes(sessionType)) {
      return false
    }
    
    // 교과목 필터 (선택사항)
    if (subjects.length > 0 && !subjects.some(subject => template.subjects.includes(subject))) {
      return false
    }
    
    return true
  })

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      elementary: '초등',
      middle: '중등', 
      high: '고등',
      adult: '성인'
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  const getCognitiveLevelLabel = (level: string) => {
    const labels = {
      remember: '기억',
      understand: '이해',
      apply: '적용',
      analyze: '분석',
      evaluate: '평가',
      create: '창조'
    }
    return labels[level as keyof typeof labels] || level
  }

  const getCognitiveLevelColor = (level: string) => {
    const colors = {
      remember: 'bg-gray-100 text-gray-800',
      understand: 'bg-blue-100 text-blue-800',
      apply: 'bg-green-100 text-green-800',
      analyze: 'bg-yellow-100 text-yellow-800',
      evaluate: 'bg-orange-100 text-orange-800',
      create: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📝 질문 템플릿 라이브러리
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            교육학적으로 검증된 질문 템플릿을 활용하여 효과적인 질문을 만들어보세요
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} size="sm">
            ✕ 닫기
          </Button>
        )}
      </div>

      {/* 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
            카테고리
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">전체 카테고리</option>
            {categories.filter(c => c !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
            학급 수준
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">모든 수준</option>
            {difficulties.filter(d => d !== 'all').map(difficulty => (
              <option key={difficulty} value={difficulty}>{getDifficultyLabel(difficulty)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              선택한 조건에 맞는 템플릿이 없습니다.
            </p>
          </Card>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {template.title}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getCognitiveLevelColor(template.cognitiveLevel)}`}>
                      {getCognitiveLevelLabel(template.cognitiveLevel)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {template.description}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-3">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                      {template.template}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <span>📚 {template.subjects.join(', ')}</span>
                      <span>🎯 {getDifficultyLabel(template.difficulty)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onSelectTemplate(template.template)}
                  size="sm"
                  className="ml-4"
                >
                  사용하기
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 도움말 */}
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600">
        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          💡 템플릿 사용 팁
        </h4>
        <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• 대괄호 [  ] 안의 내용을 구체적인 내용으로 바꿔주세요</li>
          <li>• 학급 수준과 상황에 맞게 언어를 조정하세요</li>
          <li>• 여러 템플릿을 조합하여 더 풍부한 질문을 만들 수 있어요</li>
          <li>• 인지 수준 태그를 참고하여 학습 목표에 맞는 질문을 선택하세요</li>
        </ul>
      </Card>
    </div>
  )
}