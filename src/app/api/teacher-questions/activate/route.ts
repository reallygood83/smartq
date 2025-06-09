import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, update, get } from 'firebase/database'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId } = await request.json()

    // 입력 검증
    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: '세션 ID와 질문 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 인증 헤더에서 사용자 정보 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

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

    // 질문 존재 확인
    const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
    const questionSnapshot = await get(questionRef)
    
    if (!questionSnapshot.exists()) {
      return NextResponse.json(
        { error: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const questionData = questionSnapshot.val()
    if (questionData.teacherId !== teacherId) {
      return NextResponse.json(
        { error: '이 질문에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 현재 활성화된 질문들 찾기
    const allQuestionsRef = ref(database, `teacherQuestions/${sessionId}`)
    const allQuestionsSnapshot = await get(allQuestionsRef)
    const allQuestions = allQuestionsSnapshot.val() || {}

    // 업데이트 객체 생성
    const updates: { [key: string]: any } = {}

    // 기존 활성 질문들을 완료 상태로 변경
    Object.entries(allQuestions).forEach(([qId, question]: [string, any]) => {
      if (question.status === 'active' && qId !== questionId) {
        updates[`teacherQuestions/${sessionId}/${qId}/status`] = 'completed'
        updates[`teacherQuestions/${sessionId}/${qId}/completedAt`] = Date.now()
      }
    })

    // 새 질문을 활성화
    updates[`teacherQuestions/${sessionId}/${questionId}/status`] = 'active'
    updates[`teacherQuestions/${sessionId}/${questionId}/activatedAt`] = Date.now()

    // 세션에 현재 활성 질문 ID 저장
    updates[`sessions/${sessionId}/activeTeacherQuestionId`] = questionId

    // 모든 업데이트를 한 번에 실행
    await update(ref(database), updates)

    return NextResponse.json({
      success: true,
      message: '질문이 활성화되었습니다.',
      activeQuestionId: questionId
    })

  } catch (error) {
    console.error('질문 활성화 오류:', error)
    return NextResponse.json(
      { error: '질문 활성화에 실패했습니다.' },
      { status: 500 }
    )
  }
}