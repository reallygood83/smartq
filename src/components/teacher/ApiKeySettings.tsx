'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { storeApiKey, getStoredApiKey, removeStoredApiKey } from '@/lib/encryption'
import { validateApiKey } from '@/lib/gemini'

function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [hasStoredKey, setHasStoredKey] = useState(false)

  useEffect(() => {
    // Check if there's a stored API key
    const storedKey = getStoredApiKey()
    if (storedKey) {
      setHasStoredKey(true)
      setApiKey('••••••••••••••••••••••••••••••••••••••••')
      setIsValid(true)
    }
  }, [])

  const handleValidateKey = async () => {
    if (!apiKey || apiKey.includes('•')) return

    setIsValidating(true)
    try {
      const valid = await validateApiKey(apiKey)
      setIsValid(valid)
      
      if (valid) {
        storeApiKey(apiKey)
        setHasStoredKey(true)
        alert('API 키가 성공적으로 저장되었습니다!')
      } else {
        alert('유효하지 않은 API 키입니다. 다시 확인해주세요.')
      }
    } catch (error) {
      console.error('API key validation error:', error)
      setIsValid(false)
      alert('API 키 검증 중 오류가 발생했습니다.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveKey = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      removeStoredApiKey()
      setApiKey('')
      setIsValid(null)
      setHasStoredKey(false)
      setShowKey(false)
      alert('API 키가 삭제되었습니다.')
    }
  }

  const handleShowStoredKey = () => {
    const storedKey = getStoredApiKey()
    if (storedKey) {
      setApiKey(storedKey)
      setShowKey(true)
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Gemini API 설정">
        <div className="space-y-6">
          {/* API Key Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isValid === true ? 'bg-green-500' : 
              isValid === false ? 'bg-red-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium">
              {isValid === true ? '✅ API 키 등록됨' : 
               isValid === false ? '❌ 유효하지 않은 키' : '⚪ 미등록'}
            </span>
          </div>

          {/* API Key Input */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API 키
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                id="apiKey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="AIzaSy... (Gemini API 키를 입력하세요)"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setIsValid(null)
                }}
                disabled={isValidating}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowKey(!showKey)}
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleValidateKey}
              disabled={!apiKey || apiKey.includes('•') || isValidating}
              isLoading={isValidating}
            >
              {hasStoredKey ? 'API 키 업데이트' : 'API 키 저장'}
            </Button>

            {hasStoredKey && !showKey && (
              <Button
                variant="outline"
                onClick={handleShowStoredKey}
              >
                저장된 키 보기
              </Button>
            )}

            {hasStoredKey && (
              <Button
                variant="danger"
                onClick={handleRemoveKey}
              >
                키 삭제
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* API Key Guide */}
      <Card title="API 키 발급 안내">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            SmartQ는 사용자 개인의 Gemini API 키를 사용하여 AI 기능을 제공합니다. 
            이를 통해 서비스를 무료로 이용하실 수 있습니다.
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
                </a>에 접속
              </li>
              <li>'Create API Key' 버튼 클릭</li>
              <li>생성된 API 키를 복사하여 위에 입력</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">💡 무료 사용량:</h4>
            <p className="text-sm text-green-800">
              Gemini API는 월 15 USD 크레딧을 무료로 제공합니다. 
              일반적인 교실 사용 시 충분한 양입니다.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">🔒 보안 안내:</h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>API 키는 브라우저에 암호화되어 저장됩니다</li>
              <li>서버에는 저장되지 않으며, AI 분석 시에만 사용됩니다</li>
              <li>다른 사용자와 API 키를 공유하지 마세요</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Usage Monitor */}
      {hasStoredKey && (
        <Card title="사용량 모니터링">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              API 사용량은 Google AI Studio에서 확인하실 수 있습니다.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              사용량 확인하기
            </a>
          </div>
        </Card>
      )}
    </div>
  )
}

export { ApiKeySettings }
export default ApiKeySettings