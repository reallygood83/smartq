import { NextRequest, NextResponse } from 'next/server'
import { analyzeQuestionsMultiSubject } from '@/lib/gemini'
import { SessionType, Subject } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { questions, sessionType, subjects, userApiKey, keywords } = await request.json()

    // 입력 검증
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: '분석할 질문이 없습니다' },
        { status: 400 }
      )
    }

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다' },
        { status: 400 }
      )
    }

    if (!sessionType || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: '세션 유형과 교과목 정보가 필요합니다' },
        { status: 400 }
      )
    }

    // AI 분석 실행
    const result = await analyzeQuestionsMultiSubject(
      questions,
      sessionType as SessionType,
      subjects as Subject[],
      userApiKey,
      keywords || []
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI 분석 오류:', error)
    return NextResponse.json(
      { error: 'AI 분석 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}