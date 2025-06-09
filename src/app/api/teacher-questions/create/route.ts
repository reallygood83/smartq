import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, set, get } from 'firebase/database'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, text, source = 'realtime', order } = await request.json()

    // 입력 검증
    if (!sessionId || !text || text.trim().length === 0) {
      return NextResponse.json(
        { error: '세션 ID와 질문 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: '질문은 500자 이내로 작성해주세요.' },
        { status: 400 }
      )
    }

    // 인증 헤더에서 사용자 정보 추출 (간단한 구현)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 실제 구현에서는 Firebase Admin SDK로 토큰 검증
    const teacherId = authHeader.replace('Bearer ', '')

    // 세션 소유권 확인
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const sessionSnapshot = await get(sessionRef)
    
    if (!sessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sessionData = sessionSnapshot.val()
    if (sessionData.teacherId !== teacherId) {
      return NextResponse.json(
        { error: '이 세션에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 질문 ID 생성
    const questionId = `tq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // order 자동 계산 (제공되지 않은 경우)
    let finalOrder = order
    if (!finalOrder) {
      const questionsRef = ref(database, `teacherQuestions/${sessionId}`)
      const questionsSnapshot = await get(questionsRef)
      const existingQuestions = questionsSnapshot.val() || {}
      finalOrder = Object.keys(existingQuestions).length + 1
    }

    // 질문 데이터 생성
    const questionData = {
      questionId,
      sessionId,
      text: text.trim(),
      teacherId,
      order: finalOrder,
      source,
      status: 'waiting',
      createdAt: Date.now()
    }

    // Firebase에 저장
    const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
    await set(questionRef, questionData)

    return NextResponse.json({
      success: true,
      question: questionData
    })

  } catch (error) {
    console.error('질문 생성 오류:', error)
    return NextResponse.json(
      { error: '질문 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}