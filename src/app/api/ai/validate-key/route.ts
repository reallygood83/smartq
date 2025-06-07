import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * API 키 유효성 검증 엔드포인트
 * 
 * 사용자가 입력한 Gemini API 키가 유효한지 확인합니다.
 * 실제 API 호출을 통해 키의 작동 여부를 테스트합니다.
 * 
 * @param request - 검증할 API 키를 포함한 요청
 * @returns 키 유효성 결과
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    // 입력 검증
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API 키가 필요합니다' },
        { status: 400 }
      )
    }

    // API 키 형식 기본 검증
    if (!apiKey.startsWith('AIza') || apiKey.length !== 39) {
      return NextResponse.json(
        { error: '올바른 Gemini API 키 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 실제 API 호출 테스트
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 간단한 테스트 요청
    const testPrompt = 'Hello'
    const result = await model.generateContent(testPrompt)
    
    // 응답 확인
    if (!result.response) {
      throw new Error('API 응답이 유효하지 않습니다')
    }

    // 성공 응답
    return NextResponse.json({ 
      valid: true,
      message: 'API 키가 유효합니다',
      model: 'gemini-1.5-flash'
    })

  } catch (error: any) {
    console.error('API 키 검증 오류:', error)

    // 에러 타입별 응답
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다' },
        { status: 400 }
      )
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { error: 'API 키 권한이 없습니다. Gemini API가 활성화되어 있는지 확인해주세요' },
        { status: 403 }
      )
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { error: 'API 사용 한도를 초과했습니다' },
        { status: 429 }
      )
    }

    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return NextResponse.json(
        { error: '요청 속도 제한을 초과했습니다. 잠시 후 다시 시도해주세요' },
        { status: 429 }
      )
    }

    // 네트워크 오류
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: '네트워크 연결을 확인해주세요' },
        { status: 503 }
      )
    }

    // 기타 오류
    return NextResponse.json(
      { error: 'API 키 검증에 실패했습니다. 키를 다시 확인해주세요' },
      { status: 500 }
    )
  }
}