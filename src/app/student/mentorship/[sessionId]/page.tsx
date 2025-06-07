'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Header } from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import MentorProfileForm from '@/components/mentorship/MentorProfileForm'
import MenteeProfileForm from '@/components/mentorship/MenteeProfileForm'
import { useAuth } from '@/contexts/AuthContext'
import { useEducationLevel, useSmartTerminology, useFullTheme } from '@/contexts/EducationLevelContext'

export default function StudentMentorshipPage() {
  const { sessionId } = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { currentLevel } = useEducationLevel()
  const { adapt } = useSmartTerminology()
  const theme = useFullTheme()
  
  const [activeView, setActiveView] = useState<'intro' | 'mentor' | 'mentee'>('intro')

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'mentor' || type === 'mentee') {
      setActiveView(type)
    }
  }, [searchParams])

  if (!sessionId || typeof sessionId !== 'string') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">잘못된 접근</h2>
            <p className="text-gray-600">유효하지 않은 세션 ID입니다.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 
            className="font-bold mb-4"
            style={{ 
              fontSize: theme.typography.fontSize['3xl'],
              color: theme.colors.text.primary 
            }}
          >
            🤝 {adapt('멘토-멘티 매칭', '전문가 매칭', '동료 학습')}
          </h1>
          <p style={{ color: theme.colors.text.secondary }} className="mb-6">
            {adapt(
              '선배들과 함께 배우고 성장하는 특별한 기회예요!',
              '전문가와의 1:1 멘토링으로 더 빠른 성장을 경험하세요.',
              '동료들과의 협력 학습으로 함께 발전해나가세요.'
            )}
          </p>
        </div>

        {/* 소개 화면 */}
        {activeView === 'intro' && (
          <div className="space-y-8">
            {/* 멘토-멘티 설명 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">
                    {adapt('멘토가 되어보세요', '멘토로 참여하기', '가르치며 성장하기')}
                  </h3>
                  <p className="text-blue-800 mb-4 text-sm">
                    {adapt(
                      '친구들에게 내가 잘하는 것을 알려주고 함께 성장해요!',
                      '후배들에게 경험과 지식을 전수하며 리더십을 키워보세요.',
                      '동료들과 전문 지식을 공유하며 네트워크를 확장하세요.'
                    )}
                  </p>
                  <ul className="text-xs text-blue-700 text-left space-y-1 mb-4">
                    <li>• {adapt('내가 잘하는 분야 공유하기', '전문 분야 지식 전수', '업무 경험 공유')}</li>
                    <li>• {adapt('친구들 도와주며 뿌듯함 느끼기', '후배 성장 지원', '팀 역량 강화')}</li>
                    <li>• {adapt('설명하며 내 실력도 늘리기', '리더십 스킬 개발', '커뮤니케이션 능력 향상')}</li>
                  </ul>
                  <Button 
                    onClick={() => setActiveView('mentor')}
                    className="w-full"
                  >
                    🎯 {adapt('멘토 시작하기', '멘토로 참여하기', '멘토 프로필 작성')}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-3">
                    {adapt('멘티가 되어보세요', '멘티로 참여하기', '학습자로 성장하기')}
                  </h3>
                  <p className="text-green-800 mb-4 text-sm">
                    {adapt(
                      '선배들에게 궁금한 것을 물어보고 많이 배워요!',
                      '전문가의 조언과 가이드로 더 빠르게 성장하세요.',
                      '경험 있는 동료들로부터 실무 지식을 습득하세요.'
                    )}
                  </p>
                  <ul className="text-xs text-green-700 text-left space-y-1 mb-4">
                    <li>• {adapt('궁금한 것 자유롭게 질문하기', '개인 맞춤 학습 가이드', '실무 중심 조언')}</li>
                    <li>• {adapt('선배들의 경험 듣기', '전문가 네트워크 구축', '업계 인사이트 획득')}</li>
                    <li>• {adapt('실수 줄이고 빠르게 성장하기', '효율적 학습 방법', '커리어 발전 전략')}</li>
                  </ul>
                  <Button 
                    onClick={() => setActiveView('mentee')}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                  >
                    🌱 {adapt('멘티 시작하기', '멘티로 참여하기', '멘티 프로필 작성')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* 매칭 과정 설명 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                🤖 {adapt('어떻게 짝을 찾아주나요?', 'AI 매칭 시스템', '지능형 매칭 프로세스')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">📝</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">1. 프로필 작성</h4>
                  <p className="text-xs text-gray-600">
                    {adapt('관심사와 잘하는 것 적기', '전문성과 목표 설정', '역량과 니즈 정의')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🧠</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">2. AI 분석</h4>
                  <p className="text-xs text-gray-600">
                    {adapt('AI가 비슷한 친구들 찾기', '알고리즘 기반 매칭', '다차원 호환성 분석')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🤝</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">3. 매칭 제안</h4>
                  <p className="text-xs text-gray-600">
                    {adapt('최고의 짝꿍 추천받기', '최적 파트너 제안', '맞춤형 매칭 결과')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🚀</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">4. 멘토링 시작</h4>
                  <p className="text-xs text-gray-600">
                    {adapt('함께 배우고 성장하기', '1:1 멘토링 진행', '지속적 피드백 교환')}
                  </p>
                </div>
              </div>
            </Card>

            {/* 성공 사례 또는 혜택 */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  ✨ {adapt('멘토-멘티 활동의 장점', '멘토링의 특별한 혜택', '전문적 멘토링 효과')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-purple-800">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-medium mb-1">
                      {adapt('더 빠른 성장', '전문성 향상', '역량 개발')}
                    </div>
                    <div className="text-xs">
                      {adapt('혼자보다 2배 빠르게!', '개인 맞춤 가이드', '체계적 성장 관리')}
                    </div>
                  </div>
                  <div className="text-purple-800">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-medium mb-1">
                      {adapt('맞춤형 도움', '개인별 솔루션', '전문 컨설팅')}
                    </div>
                    <div className="text-xs">
                      {adapt('내게 딱 맞는 조언', '실무 중심 조언', '경험 기반 가이드')}
                    </div>
                  </div>
                  <div className="text-purple-800">
                    <div className="text-2xl mb-2">🌟</div>
                    <div className="font-medium mb-1">
                      {adapt('자신감 향상', '리더십 개발', '네트워크 확장')}
                    </div>
                    <div className="text-xs">
                      {adapt('성취감과 뿌듯함', '소통 능력 향상', '전문가 네트워크')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 멘토 프로필 폼 */}
        {activeView === 'mentor' && (
          <div>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveView('intro')}
                className="mb-4"
              >
                ← 돌아가기
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 {adapt('멘토 프로필 만들기', '멘토 등록하기', '멘토 프로필 설정')}
              </h2>
              <p className="text-gray-600">
                {adapt(
                  '친구들을 도와줄 수 있는 내 장점들을 알려주세요!',
                  '후배들에게 전수할 수 있는 전문 지식과 경험을 공유해주세요.',
                  '동료들과 나눌 수 있는 전문성과 멘토링 스타일을 설정해주세요.'
                )}
              </p>
            </div>
            <MentorProfileForm 
              sessionId={sessionId}
              onSave={() => {
                alert(adapt(
                  '멘토 프로필이 완성되었어요! 곧 멘티와 매칭될 거예요.',
                  '멘토 프로필이 저장되었습니다! 최적의 멘티와 매칭해드릴게요.',
                  '멘토 프로필이 등록되었습니다. 매칭 결과를 기다려주세요.'
                ))
                setActiveView('intro')
              }}
            />
          </div>
        )}

        {/* 멘티 프로필 폼 */}
        {activeView === 'mentee' && (
          <div>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveView('intro')}
                className="mb-4"
              >
                ← 돌아가기
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🌱 {adapt('멘티 프로필 만들기', '멘티 등록하기', '멘티 프로필 설정')}
              </h2>
              <p className="text-gray-600">
                {adapt(
                  '배우고 싶은 것과 도움이 필요한 부분을 알려주세요!',
                  '학습 목표와 성장하고 싶은 분야를 구체적으로 설정해주세요.',
                  '전문성 개발 목표와 필요한 가이드 영역을 명확히 해주세요.'
                )}
              </p>
            </div>
            <MenteeProfileForm 
              sessionId={sessionId}
              onSave={() => {
                alert(adapt(
                  '멘티 프로필이 완성되었어요! 곧 멘토와 매칭될 거예요.',
                  '멘티 프로필이 저장되었습니다! 최적의 멘토와 매칭해드릴게요.',
                  '멘티 프로필이 등록되었습니다. 매칭 결과를 기다려주세요.'
                ))
                setActiveView('intro')
              }}
            />
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}