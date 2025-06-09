import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, set, get } from 'firebase/database'

export async function POST(request: NextRequest) {
  try {
    const { 
      questionId, 
      sessionId, 
      text, 
      studentId, 
      isAnonymous = true, 
      studentName 
    } = await request.json()

    // 입력 검증
    if (!questionId || !sessionId || !text || !studentId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: '답변 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: '답변은 2000자 이내로 작성해주세요.' },
        { status: 400 }
      )
    }

    // 세션 존재 확인
    const sessionRef = ref(database, `sessions/${sessionId}`)
    const sessionSnapshot = await get(sessionRef)
    
    if (!sessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 교사 질문 존재 확인
    const questionRef = ref(database, `teacherQuestions/${sessionId}/${questionId}`)
    const questionSnapshot = await get(questionRef)
    
    if (!questionSnapshot.exists()) {
      return NextResponse.json(
        { error: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const questionData = questionSnapshot.val()
    
    // 질문이 활성화되어 있는지 확인
    if (questionData.status !== 'active') {
      return NextResponse.json(
        { error: '현재 답변을 받지 않는 질문입니다.' },
        { status: 400 }
      )
    }

    // 응답 ID 생성
    const responseId = `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 응답 데이터 생성
    const responseData = {
      responseId,
      questionId,
      sessionId,
      text: text.trim(),
      studentId,
      isAnonymous,
      createdAt: Date.now()
    }

    // 익명이 아닌 경우 학생 이름 추가
    if (!isAnonymous && studentName) {
      responseData.studentName = studentName.trim()
    }

    // Firebase에 저장
    const responseRef = ref(database, `studentResponses/${sessionId}/${responseId}`)
    await set(responseRef, responseData)

    return NextResponse.json({
      success: true,
      response: responseData
    })

  } catch (error) {
    console.error('답변 제출 오류:', error)
    return NextResponse.json(
      { error: '답변 제출에 실패했습니다.' },
      { status: 500 }
    )
  }
}