// SmartQ - API Key Encryption/Decryption Utilities
import CryptoJS from 'crypto-js';

// Generate a simple encryption key based on user session
function getEncryptionKey(): string {
  // Use a combination of timestamp and browser data for encryption
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'server';
  const timeKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Changes daily
  return CryptoJS.SHA256(userAgent + timeKey).toString();
}

export function encryptApiKey(apiKey: string): string {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(apiKey, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

export function decryptApiKey(encryptedKey: string): string {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedKey, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt API key');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

export function storeApiKey(apiKey: string): void {
  try {
    const encrypted = encryptApiKey(apiKey);
    localStorage.setItem('smartq_gemini_api_key', encrypted);
  } catch (error) {
    console.error('Failed to store API key:', error);
    throw new Error('Failed to store API key securely');
  }
}

export function getStoredApiKey(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const encrypted = localStorage.getItem('smartq_gemini_api_key');
    if (!encrypted) return null;
    
    return decryptApiKey(encrypted);
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    // Clear invalid key
    localStorage.removeItem('smartq_gemini_api_key');
    return null;
  }
}

export function removeStoredApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smartq_gemini_api_key');
  }
}