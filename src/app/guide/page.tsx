'use client'

import { Header } from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SmartQ 사용 가이드
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-200">
            AI 기반 스마트한 교육 활동을 위한 완벽 가이드
          </p>
        </div>

        {/* 교사용 가이드 */}
        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🍎</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">교사용 가이드</h2>
          </div>

          <div className="space-y-8">
            {/* Step 1: API 키 설정 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1단계: 구글 계정으로 로그인
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  SmartQ는 구글 계정을 통한 안전한 로그인을 제공합니다. 
                  교육용 구글 계정이나 개인 구글 계정을 사용하실 수 있습니다.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">로그인 방법:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2단계: Gemini API 키 설정
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  SmartQ의 AI 기능을 사용하기 위해 개인 Gemini API 키가 필요합니다.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">API 키 발급 방법:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                      >
                        Google AI Studio
                      </a>에 Google 계정으로 로그인
                    </li>
                    <li>'Create API Key' 버튼 클릭</li>
                    <li>생성된 API 키를 복사</li>
                    <li>SmartQ 설정 페이지에서 API 키 등록</li>
                  </ol>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>💡 무료 사용량:</strong> Gemini API는 월 15 USD 크레딧을 무료로 제공하여, 
                    일반적인 교실 사용 시 충분합니다.
                  </p>
                </div>
                <Link href="/teacher/settings">
                  <Button>API 키 설정하러 가기</Button>
                </Link>
              </div>
            </div>

            {/* Step 3: 세션 생성 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3단계: 학습 세션 생성
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  수업에 맞는 세션을 생성하고 학생들을 초대하세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">세션 유형 선택</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
                      <li>💬 토론/논제 발굴</li>
                      <li>🔬 탐구 활동</li>
                      <li>🧮 문제 해결</li>
                      <li>🎨 창작 활동</li>
                      <li>💭 토의/의견 나누기</li>
                      <li>❓ 일반 Q&A</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">교과목 설정</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
                      <li>• 단일 또는 다중 교과목 선택</li>
                      <li>• 학습 목표 입력 (선택)</li>
                      <li>• 키워드 설정 (선택)</li>
                      <li>• 학습 자료 업로드 (선택)</li>
                    </ul>
                  </div>
                </div>
                <Link href="/teacher/session/create">
                  <Button variant="outline">새 세션 만들기</Button>
                </Link>
              </div>
            </div>

            {/* Step 4: 학생 초대 및 관리 */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4단계: 학생 초대 및 세션 관리
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  생성된 세션의 접속 코드를 학생들에게 공유하고 실시간으로 질문을 모니터링하세요.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">학생 초대 방법:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>1. 세션 생성 후 6자리 접속 코드 확인</li>
                    <li>2. 학생들에게 <code className="bg-white px-1 rounded">smartq.ai/student</code> 접속 안내</li>
                    <li>3. 접속 코드 입력하여 세션 참여</li>
                    <li>4. 또는 '학생 링크 복사' 버튼으로 직접 링크 공유</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5: AI 분석 활용 */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                5단계: AI 분석 결과 활용
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  학생들의 질문이 수집되면 AI 분석을 실행하여 맞춤형 교육 활동을 제안받으세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">질문 그룹 분석</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• 유사한 질문들을 자동 그룹화</li>
                      <li>• 각 그룹의 핵심 주제 요약</li>
                      <li>• 통합 활동 제안</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">활동 추천</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• 교과별 맞춤 활동 제안</li>
                      <li>• 난이도별 구분</li>
                      <li>• 필요 자료 및 시간 안내</li>
                      <li>• 구체적인 실행 방법 제시</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 학생용 가이드 */}
        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">학생용 가이드</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  세션 참여 방법
                </h3>
                <ol className="text-gray-700 dark:text-gray-200 space-y-2 list-decimal list-inside">
                  <li>선생님이 제공한 6자리 접속 코드 확인</li>
                  <li>SmartQ 홈페이지 방문</li>
                  <li>'학생용 참여하기' 버튼 클릭</li>
                  <li>접속 코드 입력 후 '세션 참여하기' 클릭</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  질문 작성 팁
                </h3>
                <ul className="text-gray-700 dark:text-gray-200 space-y-2 list-disc list-inside">
                  <li>구체적이고 명확한 질문 작성</li>
                  <li>궁금한 점을 솔직하게 표현</li>
                  <li>익명 또는 실명 선택 가능</li>
                  <li>세션 유형에 맞는 질문 작성</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                세션 유형별 질문 예시
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">💬 토론 세션</h4>
                  <p className="text-sm text-blue-700">
                    "환경보호를 위해 일회용품 사용을 금지해야 할까요?"
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">🔬 탐구 세션</h4>
                  <p className="text-sm text-blue-700">
                    "식물은 어떻게 물을 뿌리에서 잎까지 빨아올릴까요?"
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">🧮 문제 해결</h4>
                  <p className="text-sm text-blue-700">
                    "분수의 나눗셈이 왜 곱셈으로 바뀌나요?"
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">🎨 창작 활동</h4>
                  <p className="text-sm text-blue-700">
                    "우리 반만의 특별한 이야기를 만들려면 어떻게 해야 할까요?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 자주 묻는 질문 */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Q. SmartQ 사용에 비용이 발생하나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-200">
                SmartQ 플랫폼 자체는 무료입니다. 다만 AI 기능 사용을 위해 개인 Gemini API 키가 필요하며, 
                Google에서 월 15 USD의 무료 크레딧을 제공합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Q. API 키 없이도 사용할 수 있나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-200">
                세션 생성, 질문 수집 등 기본 기능은 API 키 없이도 사용 가능합니다. 
                AI 분석 기능만 API 키가 필요합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 한 번에 몇 명의 학생이 참여할 수 있나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-200">
                Firebase 실시간 데이터베이스를 사용하여 수십 명의 학생이 동시 참여 가능합니다. 
                정확한 제한은 네트워크 환경에 따라 달라질 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 데이터는 어떻게 보관되나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-200">
                세션과 질문 데이터는 Firebase에 안전하게 저장됩니다. 
                API 키는 암호화되어 브라우저에만 저장되며, 서버에는 저장되지 않습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-6">
            SmartQ로 더 스마트한 교육을 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teacher/dashboard">
              <Button size="lg">교사용 시작하기</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}