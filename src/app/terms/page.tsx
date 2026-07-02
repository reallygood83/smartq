import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">SmartQ</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">이용약관</h1>
          <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
            SmartQ는 교사가 학생 질문을 수집하고 수업 활동을 준비하는 데 사용하는 교육 지원 도구입니다.
            사용자는 수업 목적에 맞게 세션을 만들고, 학생에게 참여 코드를 공유할 수 있습니다.
          </p>

          <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">서비스 이용</h2>
              <p className="mt-2 leading-7">
                사용자는 수업 운영, 질문 수집, 학습 분석 등 교육적 목적 안에서 서비스를 이용해야 합니다.
                타인의 권리를 침해하거나 부적절한 콘텐츠를 게시하는 행위는 제한될 수 있습니다.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">계정과 API 키</h2>
              <p className="mt-2 leading-7">
                교사용 기능은 Google 로그인과 개인 Gemini API 키 설정을 사용할 수 있습니다.
                API 키와 계정 정보 관리는 사용자 책임이며, 공유 기기에서는 로그아웃과 저장 정보 확인을 권장합니다.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">책임 범위</h2>
              <p className="mt-2 leading-7">
                AI 분석 결과는 수업 의사결정을 돕는 참고 자료입니다.
                최종 수업 운영과 학생 지도 판단은 담당 교사가 교육 맥락에 맞게 결정해야 합니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
