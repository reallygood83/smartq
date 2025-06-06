export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm mr-2">
              Q
            </div>
            <span className="text-lg font-bold">SmartQ</span>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            모든 질문이 스마트한 학습이 되는 곳
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              © 2025 김문정 | 안양 박달초 | 
              <a 
                href="https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 ml-1"
              >
                유튜브 배움의 달인
              </a>
            </p>
            <p className="text-xs text-gray-600">
              Built with ❤️ for education
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}