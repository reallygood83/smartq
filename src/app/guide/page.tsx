'use client'

import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SmartQ 완전 사용 가이드
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            AI 기반 스마트한 교육 활동을 위한 완벽 가이드
          </p>
          
          {/* 서비스 개발 취지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-left max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 SmartQ를 만든 이유
            </h2>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              교실에서 학생들의 질문은 가장 소중한 학습의 출발점입니다. 하지만 수업 시간의 제약으로 모든 질문을 충분히 다루기 어려웠습니다. 
              SmartQ는 <strong>학생들의 질문을 체계적으로 수집하고 AI로 분석</strong>하여, 교사가 더 효과적인 수업을 설계할 수 있도록 돕습니다. 
              또한 <strong>실시간 소통과 개별 맞춤 피드백</strong>을 통해 모든 학생이 적극적으로 참여하는 교실을 만들어갑니다.
            </p>
          </div>
        </div>

        {/* 교사용 가이드 */}
        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🍎</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">교사용 가이드</h2>
          </div>

          <div className="space-y-8">
            {/* Step 1: 로그인 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1단계: 구글 계정으로 간편 로그인
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  SmartQ는 구글 계정을 통한 안전하고 간편한 로그인을 제공합니다. 
                  교육용 구글 계정이나 개인 구글 계정 모두 사용 가능합니다.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">로그인 방법:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>SmartQ 홈페이지에서 '교사용 시작하기' 클릭</li>
                    <li>'Google로 로그인' 버튼 클릭</li>
                    <li>구글 계정 선택 및 권한 승인</li>
                    <li>자동으로 대시보드로 이동</li>
                  </ol>
                </div>
                <Link href="/auth/login">
                  <Button>구글로 로그인하기</Button>
                </Link>
              </div>
            </div>

            {/* Step 2: API 키 설정 */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2단계: Gemini AI 기능 활성화 (선택사항)
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  SmartQ의 강력한 AI 분석 기능을 사용하려면 개인 Gemini API 키가 필요합니다. 
                  API 키 없이도 기본 기능은 모두 사용 가능합니다.
                </p>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">💰 비용 정보:</h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Gemini API는 <strong>월 15만원 상당의 무료 크레딧</strong> 제공</li>
                    <li>• 일반적인 교실 사용 시 충분한 양</li>
                    <li>• 사용량 초과 시에만 추가 비용 발생</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">API 키 발급 방법:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        Google AI Studio
                      </a>에 구글 계정으로 로그인
                    </li>
                    <li>'Create API Key' 버튼 클릭</li>
                    <li>생성된 API 키를 복사</li>
                    <li>SmartQ 설정 페이지에서 API 키 등록</li>
                  </ol>
                </div>
                <Link href="/teacher/settings">
                  <Button>API 키 설정하러 가기</Button>
                </Link>
              </div>
            </div>

            {/* Step 3: 세션 생성 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3단계: 학습 세션 생성하기
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  수업 목적에 맞는 세션을 생성하고 학생들을 초대하세요. 
                  <strong>자유 질문 모드</strong>와 <strong>교사 주도 모드</strong> 중 선택할 수 있습니다.
                </p>
                
                {/* 세션 모드 설명 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">💬 자유 질문 모드</h4>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• 학생들이 자유롭게 질문 제출</li>
                      <li>• 수업 후 AI 분석으로 종합 정리</li>
                      <li>• 토론, 탐구 활동에 적합</li>
                      <li>• 창의적 사고 촉진</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🎯 교사 주도 모드</h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• 교사가 준비한 질문으로 수업 진행</li>
                      <li>• 학생 답변 실시간 수집 및 분석</li>
                      <li>• 체계적인 수업 흐름 관리</li>
                      <li>• 즉석 질문 추가 가능</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">세션 유형 선택</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>💬 토론/논제 발굴</li>
                      <li>🔬 탐구 활동</li>
                      <li>🧮 문제 해결</li>
                      <li>🎨 창작 활동</li>
                      <li>💭 토의/의견 나누기</li>
                      <li>❓ 일반 Q&A</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">추가 설정</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• 단일 또는 다중 교과목 선택</li>
                      <li>• 학습 목표 입력 (선택)</li>
                      <li>• 키워드 설정 (선택)</li>
                      <li>• 성인 교육 모드 (대학생/성인용)</li>
                    </ul>
                  </div>
                </div>
                <Link href="/teacher/session/create">
                  <Button variant="outline">새 세션 만들기</Button>
                </Link>
              </div>
            </div>

            {/* Step 4: 학생 초대 - 업데이트됨 */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4단계: 학생 초대하기 (3가지 방법)
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  생성된 세션에 학생들을 초대하는 방법은 3가지가 있습니다. 상황에 맞게 선택하세요.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔗 방법 1: 직접 링크 공유 (추천)</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>1. '학생 링크 복사' 버튼 클릭</li>
                      <li>2. 카카오톡, 클래스룸 등으로 링크 공유</li>
                      <li>3. 학생들이 링크 클릭만으로 바로 참여</li>
                      <li>✅ <strong>가장 간편한 방법!</strong></li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🔢 방법 2: 접속 코드 안내</h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>1. 6자리 접속 코드를 학생들에게 알려줌</li>
                      <li>2. 학생들이 SmartQ 홈페이지 방문</li>
                      <li>3. 접속 코드 입력하여 세션 참여</li>
                      <li>📝 칠판에 코드 적기 좋음</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📱 방법 3: QR 코드 (준비 중)</h4>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• QR 코드 생성 기능</li>
                      <li>• 스마트폰으로 스캔하여 참여</li>
                      <li>• 곧 업데이트 예정</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">💡 학생 초대 팁</h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• <strong>링크 공유가 가장 편리</strong>하며 실수가 적습니다</li>
                    <li>• 접속 코드는 6자리 숫자로 기억하기 쉽게 만들어졌습니다</li>
                    <li>• 학생들은 별도 가입 없이 바로 참여 가능합니다</li>
                    <li>• 모바일, 태블릿, 컴퓨터 모든 기기에서 접속 가능합니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5: 콘텐츠 공유 - 새로운 기능 */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5단계: 강의 자료 공유하기
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  세션 진행 중 다양한 형태의 강의 자료를 실시간으로 학생들과 공유할 수 있습니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">📄 지원하는 콘텐츠 유형</h4>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                      <li>• 📝 텍스트 - 설명, 안내사항</li>
                      <li>• 🔗 링크 - 웹사이트, 자료 링크</li>
                      <li>• 🎬 유튜브 - 교육 영상</li>
                      <li>• 📋 안내사항 - 중요 공지</li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">✨ 스마트 기능</h4>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                      <li>• <strong>URL 자동 링크 변환</strong></li>
                      <li>• 유튜브 동영상 자동 임베드</li>
                      <li>• 실시간 자료 공유</li>
                      <li>• 모바일 최적화 표시</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔗 URL 링크 기능 (NEW!)</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    텍스트에 URL을 입력하면 자동으로 클릭 가능한 링크로 변환됩니다. 
                    질문, 답변, 강의 자료 어디에서든 사용 가능합니다!
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    예: "https://www.youtube.com/watch?v=example 이 영상을 참고하세요" → 링크가 자동으로 활성화됩니다
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6: AI 분석 활용 - 업데이트됨 */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6단계: AI 분석으로 수업 개선하기
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  SmartQ의 강력한 AI 분석 기능으로 학생들의 학습 상태를 파악하고 맞춤형 교육 전략을 수립하세요.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">📊 종합 분석 (추천)</h4>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• 빠르고 효율적인 전체 현황 파악</li>
                      <li>• 학급 단위 이해도 및 참여도 분석</li>
                      <li>• 즉시 필요한 교수법 제안</li>
                      <li>• 토큰 사용량 최적화</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">👤 개별 분석</h4>
                    <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                      <li>• 학생별 상세 피드백</li>
                      <li>• 개인 맞춤 학습 방향 제시</li>
                      <li>• 세밀한 이해도 평가</li>
                      <li>• 심화 분석 시 활용</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🔍 질문 그룹 분석</h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• 유사 질문 자동 그룹화</li>
                      <li>• 핵심 주제 요약</li>
                      <li>• 토론 논제 추천</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🎯 맞춤 활동 제안</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• 교과별 활동 추천</li>
                      <li>• 난이도별 구분</li>
                      <li>• 구체적 실행 방법</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📈 성장 추적</h4>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• 시간별 변화 분석</li>
                      <li>• 학습 진전도 측정</li>
                      <li>• 장기 학습 계획 수립</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7: 고급 기능 - 새로운 섹션 */}
            <div className="border-l-4 border-pink-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7단계: 고급 기능 활용하기
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  SmartQ의 고급 기능들을 활용하여 더욱 풍부한 교육 경험을 제공하세요.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-pink-900 dark:text-pink-100 mb-2">🤝 멘토-멘티 매칭 (성인 교육)</h4>
                    <ul className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                      <li>• 대학생/성인 대상 세션에서 활용</li>
                      <li>• 전문 분야별 매칭 시스템</li>
                      <li>• 1:1 및 그룹 멘토링 지원</li>
                      <li>• 장기 학습 관계 형성</li>
                    </ul>
                  </div>
                  
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-2">💬 피드백 시스템</h4>
                    <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-1">
                      <li>• 학생 간 상호 피드백</li>
                      <li>• AI 기반 피드백 품질 분석</li>
                      <li>• 피드백 성장 과정 추적</li>
                      <li>• 협력 학습 문화 조성</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">🔄 실시간 모니터링</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 학생 참여도 실시간 확인</li>
                    <li>• 질문 제출 현황 모니터링</li>
                    <li>• 세션 활동 상태 추적</li>
                    <li>• 즉석 대응 가능</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 학생용 가이드 - 업데이트됨 */}
        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">학생용 가이드</h2>
          </div>

          <div className="space-y-6">
            {/* 참여 방법 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🚀 세션 참여 방법 (2가지)
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">방법 1: 링크로 바로 참여 (추천)</h4>
                    <ol className="text-xs text-blue-800 dark:text-blue-200 list-decimal list-inside">
                      <li>선생님이 보내준 링크 클릭</li>
                      <li>자동으로 세션 페이지 이동</li>
                      <li>바로 질문 작성 시작!</li>
                    </ol>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded">
                    <h4 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">방법 2: 접속 코드로 참여</h4>
                    <ol className="text-xs text-green-800 dark:text-green-200 list-decimal list-inside">
                      <li>SmartQ 홈페이지 방문</li>
                      <li>'학생용 참여하기' 클릭</li>
                      <li>6자리 코드 입력</li>
                      <li>'세션 참여하기' 클릭</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ✍️ 좋은 질문 작성 팁
                </h3>
                <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside text-sm">
                  <li><strong>구체적으로</strong> - "이게 뭐예요?" 보다 "원의 넓이는 어떻게 구하나요?"</li>
                  <li><strong>솔직하게</strong> - 정말 궁금한 점을 편하게 물어보세요</li>
                  <li><strong>자세히</strong> - 어떤 부분이 어려운지 설명해보세요</li>
                  <li><strong>안전하게</strong> - 익명 또는 실명 선택 가능</li>
                  <li><strong>링크 포함</strong> - 웹사이트 주소도 함께 공유 가능</li>
                </ul>
              </div>
            </div>

            {/* 세션 모드별 안내 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📖 세션 모드별 이용 방법
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">💬 자유 질문 모드</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• 언제든 자유롭게 질문 작성</li>
                    <li>• 다른 친구들 질문에 ❤️ 좋아요</li>
                    <li>• 익명/실명 선택 가능</li>
                    <li>• 창의적 사고 표현</li>
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🎯 교사 주도 모드</h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• 선생님 질문에 답변 작성</li>
                    <li>• 친구들 답변 실시간 확인</li>
                    <li>• 체계적인 학습 진행</li>
                    <li>• 수정 및 보완 언제든 가능</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 세션 유형별 질문 예시 */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                💡 세션 유형별 질문 예시
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💬 토론 세션</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    "학교에서 스마트폰 사용을 허용해야 할까요? 왜 그렇게 생각하나요?"
                  </p>
                  
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔬 탐구 세션</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    "식물이 밤에도 호흡을 하나요? 어떻게 확인할 수 있을까요?"
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🧮 문제 해결</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    "분수 2/3 ÷ 1/4를 계산할 때 왜 1/4를 뒤집어서 곱하나요?"
                  </p>
                  
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🎨 창작 활동</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    "환경을 보호하는 새로운 발명품을 만든다면 어떤 것이 좋을까요?"
                  </p>
                </div>
              </div>
            </div>

            {/* 새로운 기능 안내 */}
            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                ✨ 새로운 기능들
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔗 URL 링크</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    질문에 웹사이트 주소를 넣으면 자동으로 링크가 됩니다!
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">❤️ 좋아요</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    친구들의 좋은 질문에 좋아요를 눌러주세요.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📱 모바일 최적화</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    스마트폰, 태블릿에서도 편하게 사용 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 자주 묻는 질문 - 업데이트됨 */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">자주 묻는 질문</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. SmartQ 사용에 비용이 발생하나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                SmartQ 플랫폼 자체는 완전 무료입니다. AI 기능 사용을 위해 개인 Gemini API 키가 필요하지만, 
                Google에서 <strong>월 15만원 상당의 무료 크레딧</strong>을 제공하여 일반 교실 사용 시 충분합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. API 키 없이도 사용할 수 있나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                네! 세션 생성, 질문 수집, 강의 자료 공유, 실시간 소통 등 모든 기본 기능은 API 키 없이도 사용 가능합니다. 
                AI 분석 기능만 API 키가 필요합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. 학생들이 회원가입을 해야 하나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                아니요! 학생들은 <strong>별도 가입 없이</strong> 접속 코드나 링크만으로 바로 참여할 수 있습니다. 
                개인정보 수집을 최소화하여 안전하게 이용할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. 한 번에 몇 명의 학생이 참여할 수 있나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Firebase 실시간 데이터베이스를 사용하여 <strong>수십 명의 학생이 동시 참여</strong> 가능합니다. 
                일반적인 교실 환경(20-40명)에서는 전혀 문제없이 사용할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. 모바일에서도 잘 작동하나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                네! SmartQ는 <strong>모바일 우선 설계</strong>로 제작되어 스마트폰, 태블릿, 컴퓨터 모든 기기에서 
                최적화된 경험을 제공합니다. 학생들이 자신의 기기로 편리하게 참여할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. 데이터는 어떻게 보관되나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                세션과 질문 데이터는 Google Firebase에 안전하게 암호화되어 저장됩니다. 
                API 키는 서버에 저장되지 않고 <strong>브라우저에만 암호화되어 보관</strong>됩니다. 
                개인정보보호법을 준수하여 운영됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Q. 교사 주도 모드와 자유 질문 모드의 차이는?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>교사 주도 모드</strong>는 선생님이 준비한 질문으로 체계적인 수업을 진행하고, 
                <strong>자유 질문 모드</strong>는 학생들이 자유롭게 질문을 올리는 방식입니다. 
                수업 목적에 따라 선택하여 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA - 업데이트됨 */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 지금 바로 SmartQ와 함께 시작하세요!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            학생들의 질문이 살아있는 교실, AI가 도우는 스마트한 수업을 경험해보세요. 
            설치나 복잡한 설정 없이 5분만에 시작할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                🍎 교사용 시작하기
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                📚 학생용 체험하기
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">5분만에 세션 시작</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">무료로 모든 기능 이용</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">모든 기기에서 접속</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}