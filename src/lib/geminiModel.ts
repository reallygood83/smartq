import { GoogleGenerativeAI } from '@google/generative-ai';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';

export function getGeminiModelName(): string {
  return process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getGeminiModel(genAI: GoogleGenerativeAI) {
  return genAI.getGenerativeModel({ model: getGeminiModelName() });
}
