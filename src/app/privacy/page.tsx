import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">SmartQ</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">개인정보처리방침</h1>
          <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
            SmartQ는 수업 질문 수집과 분석에 필요한 최소한의 정보만 사용하도록 설계된 교육 도구입니다.
            학생은 세션 코드로 참여할 수 있으며, 교사가 요구하지 않는 한 실명 입력이 필요하지 않습니다.
          </p>

          <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">수집 및 사용 정보</h2>
              <p className="mt-2 leading-7">
                교사 계정의 로그인 정보, 세션 정보, 학생이 제출한 질문과 반응 데이터가 수업 운영을 위해 저장될 수 있습니다.
                저장된 데이터는 세션 관리, 질문 분석, 학습 활동 추천에 사용됩니다.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">외부 서비스</h2>
              <p className="mt-2 leading-7">
                SmartQ는 인증과 데이터 저장을 위해 Firebase를, AI 분석을 위해 사용자가 설정한 Gemini API를 사용할 수 있습니다.
                각 외부 서비스의 처리 기준은 해당 제공자의 정책을 따릅니다.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">보호 조치</h2>
              <p className="mt-2 leading-7">
                수업 세션 데이터는 교육 목적에 맞게 관리되어야 하며, 교사는 학생 개인정보가 포함된 질문을 공유하거나 보관할 때 학교와 기관의 개인정보 보호 기준을 따라야 합니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
