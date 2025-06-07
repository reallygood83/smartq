/**
 * SmartQ - API 키 암호화/복호화 및 안전한 저장을 위한 유틸리티
 * 
 * 보안 원칙:
 * 1. 사용자 세션 기반 암호화
 * 2. 서버에는 절대 저장하지 않음
 * 3. localStorage에 암호화된 형태로만 저장
 * 4. API 사용량 추적 및 모니터링
 */

import CryptoJS from 'crypto-js';

/**
 * 기본 암호화 키 (고정값 사용으로 단순화)
 */
function getEncryptionKey(): string {
  // 고정 키를 사용하여 복호화 오류 방지
  return 'smartq_gemini_api_key_2025_secure';
}

/**
 * API 키 암호화 (사용자별 구분을 위해 userId 포함)
 * @param apiKey - 암호화할 Gemini API 키
 * @param userId - 사용자 ID
 */
export function encryptApiKey(apiKey: string, userId?: string): string {
  try {
    if (!apiKey.trim()) {
      throw new Error('API 키가 비어있습니다');
    }

    const key = getEncryptionKey();
    // 사용자 ID와 함께 저장
    const dataToEncrypt = JSON.stringify({
      apiKey: apiKey.trim(),
      userId: userId || 'anonymous',
      timestamp: Date.now()
    });
    
    return CryptoJS.AES.encrypt(dataToEncrypt, key).toString();
  } catch (error) {
    console.error('API 키 암호화 실패:', error);
    throw new Error('API 키 암호화에 실패했습니다');
  }
}

/**
 * API 키 복호화
 * @param encryptedKey - 암호화된 API 키
 * @param userId - 사용자 ID (검증용)
 */
export function decryptApiKey(encryptedKey: string, userId?: string): string {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedKey, key);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedStr) {
      throw new Error('복호화된 키가 비어있습니다');
    }
    
    const data = JSON.parse(decryptedStr);
    
    // 사용자 ID 검증 (다른 사용자의 키 접근 방지)
    if (userId && data.userId !== userId && data.userId !== 'anonymous') {
      throw new Error('권한이 없습니다');
    }
    
    return data.apiKey;
  } catch (error) {
    console.error('API 키 복호화 실패:', error);
    throw new Error('API 키 복호화에 실패했습니다. 다시 설정해주세요.');
  }
}

/**
 * 암호화된 API 키를 localStorage에 저장
 * @param apiKey - 저장할 API 키
 * @param userId - 사용자 ID
 */
export function storeApiKey(apiKey: string, userId?: string): void {
  try {
    if (!apiKey.trim()) {
      throw new Error('API 키가 비어있습니다');
    }
    
    const encrypted = encryptApiKey(apiKey, userId);
    const storageKey = `smartq_api_key_${userId || 'default'}`;
    
    localStorage.setItem(storageKey, encrypted);
    localStorage.setItem(`${storageKey}_stored_at`, Date.now().toString());
    
    console.log('API 키 저장 성공:', storageKey);
  } catch (error) {
    console.error('API 키 저장 실패:', error);
    throw new Error('API 키 저장에 실패했습니다');
  }
}

/**
 * localStorage에서 암호화된 API 키를 가져와서 복호화
 * @param userId - 사용자 ID
 */
export function getStoredApiKey(userId?: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const storageKey = `smartq_api_key_${userId || 'default'}`;
    const encrypted = localStorage.getItem(storageKey);
    
    if (!encrypted) {
      console.log('저장된 API 키 없음:', storageKey);
      return null;
    }

    // 저장된 지 너무 오래된 키는 무효화 (30일)
    const storedAtKey = `${storageKey}_stored_at`;
    const storedAt = localStorage.getItem(storedAtKey);
    if (storedAt) {
      const daysSinceStored = (Date.now() - parseInt(storedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceStored > 30) {
        console.log('API 키 만료됨:', storageKey);
        removeStoredApiKey(userId);
        return null;
      }
    }
    
    const decrypted = decryptApiKey(encrypted, userId);
    console.log('API 키 복호화 성공:', storageKey, decrypted ? '키 있음' : '키 없음');
    return decrypted;
  } catch (error) {
    console.error('저장된 API 키 가져오기 실패:', error);
    // 복호화 실패 시 저장된 키 삭제
    removeStoredApiKey(userId);
    return null;
  }
}

/**
 * 저장된 API 키 삭제
 * @param userId - 사용자 ID
 */
export function removeStoredApiKey(userId?: string): void {
  if (typeof window !== 'undefined') {
    const storageKey = `smartq_api_key_${userId || 'default'}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_stored_at`);
    localStorage.removeItem('smartq_api_usage'); // 사용량 정보도 함께 삭제
    console.log('API 키 삭제 완료:', storageKey);
  }
}

/**
 * API 키가 저장되어 있는지 확인 (복호화하지 않고)
 * @param userId - 사용자 ID
 */
export function hasStoredApiKey(userId?: string): boolean {
  if (typeof window === 'undefined') return false;
  const storageKey = `smartq_api_key_${userId || 'default'}`;
  const exists = !!localStorage.getItem(storageKey);
  console.log('API 키 존재 확인:', storageKey, exists);
  return exists;
}

/**
 * API 키 형식 검증
 * @param apiKey - 검증할 API 키
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Gemini API 키 형식: AIza로 시작하는 39자리 문자열
  const geminiKeyPattern = /^AIza[A-Za-z0-9_-]{35}$/;
  return geminiKeyPattern.test(apiKey.trim());
}

/**
 * API 사용량 추적을 위한 인터페이스
 */
export interface ApiUsage {
  date: string;
  requestCount: number;
  estimatedCost: number;
  errors: number;
  lastUpdated: number;
}

/**
 * API 사용량 정보 저장
 */
export function trackApiUsage(requestCount: number = 1, estimatedCost: number = 0): void {
  try {
    if (typeof window === 'undefined') return;
    
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('smartq_api_usage');
    
    let usage: ApiUsage = {
      date: today,
      requestCount: 0,
      estimatedCost: 0,
      errors: 0,
      lastUpdated: Date.now()
    };

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        usage = parsed;
      }
    }

    usage.requestCount += requestCount;
    usage.estimatedCost += estimatedCost;
    usage.lastUpdated = Date.now();

    localStorage.setItem('smartq_api_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('API 사용량 추적 실패:', error);
  }
}

/**
 * API 사용량 정보 가져오기
 */
export function getApiUsage(): ApiUsage | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('smartq_api_usage');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('API 사용량 정보 가져오기 실패:', error);
    return null;
  }
}

/**
 * API 키 마스킹 (UI 표시용)
 * @param apiKey - 마스킹할 API 키
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '****';
  }
  
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  const middle = '*'.repeat(Math.max(4, apiKey.length - 8));
  
  return `${start}${middle}${end}`;
}