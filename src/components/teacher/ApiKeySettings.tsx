'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { 
  storeApiKey, 
  getStoredApiKey, 
  removeStoredApiKey, 
  hasStoredApiKey,
  validateApiKeyFormat,
  maskApiKey,
  getApiUsage,
  trackApiUsage,
  type ApiUsage
} from '@/lib/encryption'

interface ApiKeySettingsProps {
  className?: string
}

function ApiKeySettings({ className = '' }: ApiKeySettingsProps) {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [isStored, setIsStored] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [currentKey, setCurrentKey] = useState('')
  const [usage, setUsage] = useState<ApiUsage | null>(null)

  // 컴포넌트 마운트 시 저장된 키 확인
  useEffect(() => {
    checkStoredKey()
    loadUsageStats()
  }, [user])

  const checkStoredKey = async () => {
    try {
      if (!user) return

      const stored = hasStoredApiKey(user.uid)
      setIsStored(stored)

      if (stored) {
        const key = getStoredApiKey(user.uid)
        if (key) {
          setCurrentKey(key)
          setIsValid(true)
        }
      }
    } catch (error) {
      console.error('저장된 키 확인 실패:', error)
    }
  }

  const loadUsageStats = () => {
    const usageData = getApiUsage()
    setUsage(usageData)
  }

  const validateApiKey = async (key: string) => {
    setIsValidating(true)
    setError('')
    setSuccess('')

    try {
      // 1. 형식 검증
      if (!validateApiKeyFormat(key)) {
        throw new Error('올바른 Gemini API 키 형식이 아닙니다. (AIza로 시작하는 39자리)')
      }

      // 2. API 호출 테스트
      const response = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'API 키 검증에 실패했습니다')
      }

      // 사용량 추적
      trackApiUsage(1, 0.001)
      loadUsageStats()

      setIsValid(true)
      setSuccess('✅ API 키가 유효합니다!')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      setError(message)
      setIsValid(false)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveKey = async () => {
    if (!user) {
      setError('로그인이 필요합니다')
      return
    }

    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요')
      return
    }

    try {
      // 키 검증
      const valid = await validateApiKey(apiKey)
      if (!valid) return

      // 저장
      storeApiKey(apiKey, user.uid)
      setCurrentKey(apiKey)
      setIsStored(true)
      setApiKey('')
      setSuccess('✅ API 키가 안전하게 저장되었습니다!')
      
      // 사용량 통계 새로고침
      loadUsageStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : '저장에 실패했습니다'
      setError(message)
    }
  }

  const handleRemoveKey = async () => {
    if (!confirm('정말로 API 키를 삭제하시겠습니까?\n\n삭제하면 AI 기능을 사용할 수 없습니다.')) {
      return
    }

    try {
      removeStoredApiKey(user.uid)
      setIsStored(false)
      setCurrentKey('')
      setIsValid(false)
      setApiKey('')
      setUsage(null)
      setSuccess('✅ API 키가 삭제되었습니다')
    } catch (error) {
      setError('키 삭제에 실패했습니다')
    }
  }

  const handleTestKey = async () => {
    if (!currentKey) return
    await validateApiKey(currentKey)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* API 키 상태 카드 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🔑 Gemini API 키 설정</h3>
              <p className="text-sm text-gray-600 mt-1">
                AI 분석 기능을 사용하려면 개인 Gemini API 키가 필요합니다
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isStored && isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isStored && isValid ? '✅ 설정됨' : '❌ 미설정'}
            </div>
          </div>

          {/* 현재 저장된 키 정보 */}
          {isStored && currentKey && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">현재 저장된 키:</p>
                  <p className="text-sm text-gray-900 font-mono">
                    {showKey ? currentKey : maskApiKey(currentKey)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? '숨기기' : '보기'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestKey}
                    disabled={isValidating}
                  >
                    {isValidating ? '테스트 중...' : '테스트'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveKey}
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 새 API 키 입력 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                {isStored ? '새 API 키로 변경' : 'Gemini API 키 입력'}
              </label>
              <div className="flex space-x-3">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza로 시작하는 39자리 키를 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <Button
                  onClick={handleSaveKey}
                  disabled={isValidating || !apiKey.trim()}
                >
                  {isValidating ? '검증 중...' : isStored ? '변경' : '저장'}
                </Button>
              </div>
            </div>

            {/* 상태 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* API 키 발급 가이드 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 API 키 발급 안내</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
              <div>
                <p className="font-medium">Google AI Studio 접속</p>
                <a 
                  href="https://aistudio.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  https://aistudio.google.com →
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
              <div>
                <p className="font-medium">Google 계정으로 로그인</p>
                <p className="text-gray-600">개인 Google 계정 사용 권장</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
              <div>
                <p className="font-medium">"Get API key" 클릭</p>
                <p className="text-gray-600">좌측 메뉴 또는 홈페이지에서 찾을 수 있습니다</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">4</span>
              <div>
                <p className="font-medium">"Create API key" 선택</p>
                <p className="text-gray-600">새 프로젝트를 생성하거나 기존 프로젝트 선택</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">5</span>
              <div>
                <p className="font-medium">API 키 복사</p>
                <p className="text-gray-600">AIza로 시작하는 39자리 키를 복사하여 위에 입력</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 사용량 통계 */}
      {usage && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 오늘 사용량</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{usage.requestCount}</div>
                <div className="text-sm text-blue-800">API 호출</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${usage.estimatedCost.toFixed(3)}</div>
                <div className="text-sm text-green-800">예상 비용</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{usage.errors}</div>
                <div className="text-sm text-red-800">오류 횟수</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              마지막 업데이트: {new Date(usage.lastUpdated).toLocaleString('ko-KR')}
            </p>
          </div>
        </Card>
      )}

      {/* 보안 안내 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 보안 및 개인정보 보호</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="text-green-600">✅</span>
              <p>API 키는 브라우저에서만 암호화되어 저장됩니다</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600">✅</span>
              <p>서버나 데이터베이스에는 절대 저장되지 않습니다</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600">✅</span>
              <p>사용자 계정과 연결되어 다른 사용자가 접근할 수 없습니다</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600">✅</span>
              <p>30일마다 자동으로 만료되어 보안을 강화합니다</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-orange-600">⚠️</span>
              <p>공공 컴퓨터에서는 사용 후 키를 삭제해주세요</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 무료 사용량 안내 */}
      <Card>
        <div className="p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Gemini API 무료 사용량</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>월 15 USD 크레딧</strong> 무료 제공</p>
            <p>• 일반적인 수업 사용량으로는 <strong>충분한 양</strong></p>
            <p>• 사용량 초과 시 <strong>자동으로 중단</strong>되어 요금 걱정 없음</p>
            <p>• 필요시 Google Cloud Console에서 <strong>사용량 한도</strong> 설정 가능</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export { ApiKeySettings }
export default ApiKeySettings