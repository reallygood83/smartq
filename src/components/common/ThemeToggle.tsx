// 테마 토글 컴포넌트 - 현재는 라이트 모드로 고정
export default function ThemeToggle() {
  return (
    <div className="relative">
      {/* 모바일 버전 */}
      <button
        className="md:hidden p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        disabled
        title="라이트 모드 (고정)"
      >
        <span className="text-lg">☀️</span>
      </button>

      {/* 데스크톱 버전 */}
      <div className="hidden md:block">
        <button
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-default"
          disabled
        >
          <span className="text-lg">☀️</span>
          <span className="text-sm font-medium text-gray-700">
            라이트 모드
          </span>
        </button>
      </div>
    </div>
  )
}