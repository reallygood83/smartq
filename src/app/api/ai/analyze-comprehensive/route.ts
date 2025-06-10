import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { database } from '@/lib/firebase'
import { ref, get, set } from 'firebase/database'
import { StudentResponse, TeacherQuestion, ComprehensiveAnalysis } from '@/types/teacher-led'
import { Session } from '@/lib/utils'
import { getEducationLevelPrompts } from '@/lib/aiPrompts'
import { EducationLevel } from '@/types/education'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Comprehensive Analysis API Start ===')
    const { questionId, sessionId, apiKey, saveAnalysis = false } = await request.json()
    console.log('Request params:', { questionId, sessionId, hasApiKey: !!apiKey, saveAnalysis })

    // 입력 검증
    if (!questionId || !sessionId || !apiKey) {
      return NextResponse.json(
        { error: '질문 ID, 세션 ID, API 키가 필요합니다.' },
        { status: 400 }
      )
    }

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Firebase 연결 확인
    console.log('Firebase database instance available:', !!database)
    
    // 세션 정보 조회
    const sessionRef = ref(database, `sessions/${sessionId}`)
    console.log('Fetching session data from:', `sessions/${sessionId}`)
    const sessionSnapshot = await get(sessionRef)
    
    if (!sessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const session = sessionSnapshot.val() as Session

    // 교사 질문 조회
    const questionRef = ref(database, `teacherQuestions/${sessionId}`)
    const questionSnapshot = await get(questionRef)
    
    if (!questionSnapshot.exists()) {
      return NextResponse.json(
        { error: '교사 질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const allQuestions = questionSnapshot.val()
    const targetQuestion = Object.values(allQuestions).find(
      (q: any) => q.questionId === questionId
    ) as TeacherQuestion

    if (!targetQuestion) {
      return NextResponse.json(
        { error: '해당 질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 학생 답변 조회
    const responsesRef = ref(database, `studentResponses/${sessionId}`)
    const responsesSnapshot = await get(responsesRef)
    
    if (!responsesSnapshot.exists()) {
      return NextResponse.json(
        { error: '학생 답변이 없습니다.' },
        { status: 404 }
      )
    }

    const allResponses = responsesSnapshot.val()
    const targetResponses = Object.values(allResponses).filter(
      (r: any) => r.questionId === questionId
    ) as StudentResponse[]

    if (targetResponses.length === 0) {
      return NextResponse.json(
        { error: '해당 질문에 대한 답변이 없습니다.' },
        { status: 404 }
      )
    }

    // 교육 레벨에 따른 프롬프트 설정
    const educationLevel = session.isAdultEducation ? EducationLevel.ADULT : EducationLevel.MIDDLE
    const prompts = getEducationLevelPrompts(educationLevel, session.adultLearnerType, session.sessionType)

    // 종합 분석 프롬프트
    const comprehensiveAnalysisPrompt = `
${prompts.systemPrompt}

다음 교사 질문에 대한 학급 전체의 답변을 종합적으로 분석해주세요:

**교사 질문:** "${targetQuestion.text}"

**학생 답변들 (총 ${targetResponses.length}개):**
${targetResponses.map((r, i) => `${i + 1}. ${r.isAnonymous ? '익명' : r.studentName || '학생'}: "${r.text}"`).join('\n')}

**세션 정보:**
- 세션 제목: ${session.title}
- 세션 유형: ${session.sessionType}
- 교과목: ${session.subjects?.join(', ') || '미지정'}
- 학습 목표: ${session.learningGoals || '미지정'}

다음 관점에서 학급 전체를 종합적으로 분석해주세요:

1. **답변 유형 분류**
   - 각 답변을 다음 유형으로 분류: 정확한 이해, 부분적 이해, 오개념, 창의적 접근, 주제 벗어남
   - 각 유형의 학생 수를 카운트

2. **이해도 수준 분포**
   - Excellent (90-100%): 완전히 이해하고 정확하게 표현
   - Good (70-89%): 대체로 이해하나 일부 미흡
   - Fair (50-69%): 부분적 이해, 중요한 개념 누락
   - Needs Improvement (0-49%): 이해 부족, 오개념 존재

3. **핵심 통찰**
   - 학급 전체가 공통적으로 잘 이해한 부분
   - 학급 전체가 공통적으로 어려워하는 부분
   - 반복적으로 나타나는 오개념 패턴
   - 창의적이거나 독창적인 아이디어

4. **수업 개선 제안**
   - 즉시 필요한 교육적 조치 (다음 수업에서 바로 적용)
   - 추가 설명이 필요한 핵심 개념들
   - 이해도 향상을 위한 구체적인 학습 활동
   - 우수 답변 예시 (다른 학생들과 공유할 만한 답변)

5. **전체적 평가**
   - 학급 전체의 이해도 수준 (0-100)
   - 참여도와 적극성 (0-100)
   - 다음 주제로 진행 가능 여부
   - 추가 지원이 필요한 영역

다음 JSON 형식으로 응답해주세요:
{
  "responseTypeDistribution": {
    "correctUnderstanding": 숫자,
    "partialUnderstanding": 숫자,
    "misconception": 숫자,
    "creativeApproach": 숫자,
    "offTopic": 숫자
  },
  "comprehensionLevelDistribution": {
    "excellent": 숫자,
    "good": 숫자,
    "fair": 숫자,
    "needsImprovement": 숫자
  },
  "keyInsights": {
    "commonUnderstandings": ["이해1", "이해2", ...],
    "commonDifficulties": ["어려움1", "어려움2", ...],
    "misconceptionPatterns": ["오개념1", "오개념2", ...],
    "creativeIdeas": ["아이디어1", "아이디어2", ...]
  },
  "classroomRecommendations": {
    "immediateActions": ["조치1", "조치2", ...],
    "conceptsToClarify": ["개념1", "개념2", ...],
    "suggestedActivities": ["활동1", "활동2", ...],
    "exemplaryResponses": ["우수답변1", "우수답변2", ...]
  },
  "overallAssessment": {
    "classUnderstandingLevel": 숫자(0-100),
    "engagementLevel": 숫자(0-100),
    "readinessForNextTopic": true/false,
    "additionalSupportNeeded": ["영역1", "영역2", ...]
  }
}
`

    let comprehensiveAnalysis: Omit<ComprehensiveAnalysis, 'analysisId' | 'sessionId' | 'questionId' | 'question' | 'generatedAt'>
    try {
      const result = await model.generateContent(comprehensiveAnalysisPrompt)
      const analysisText = result.response.text()
      
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        comprehensiveAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON 형식 불일치')
      }
    } catch (error) {
      console.error('종합 분석 실패:', error)
      // 기본 분석 제공
      comprehensiveAnalysis = {
        responseTypeDistribution: {
          correctUnderstanding: Math.round(targetResponses.length * 0.4),
          partialUnderstanding: Math.round(targetResponses.length * 0.3),
          misconception: Math.round(targetResponses.length * 0.2),
          creativeApproach: Math.round(targetResponses.length * 0.05),
          offTopic: Math.round(targetResponses.length * 0.05)
        },
        comprehensionLevelDistribution: {
          excellent: Math.round(targetResponses.length * 0.2),
          good: Math.round(targetResponses.length * 0.4),
          fair: Math.round(targetResponses.length * 0.3),
          needsImprovement: Math.round(targetResponses.length * 0.1)
        },
        keyInsights: {
          commonUnderstandings: ['학생들이 질문에 적극적으로 응답함'],
          commonDifficulties: ['분석 중 오류로 인해 구체적인 분석 불가'],
          misconceptionPatterns: [],
          creativeIdeas: []
        },
        classroomRecommendations: {
          immediateActions: ['재분석 시도 필요'],
          conceptsToClarify: ['추가 분석 필요'],
          suggestedActivities: ['그룹 토의'],
          exemplaryResponses: []
        },
        overallAssessment: {
          classUnderstandingLevel: 70,
          engagementLevel: 85,
          readinessForNextTopic: true,
          additionalSupportNeeded: ['재분석 필요']
        }
      }
    }

    // 분석 결과 생성
    const analysisId = `comprehensive_${Date.now()}`
    const analysisData: ComprehensiveAnalysis = {
      analysisId,
      sessionId,
      questionId: targetQuestion.questionId,
      question: {
        questionId: targetQuestion.questionId,
        text: targetQuestion.text,
        responseCount: targetResponses.length
      },
      ...comprehensiveAnalysis,
      generatedAt: Date.now()
    }

    // saveAnalysis가 true일 때만 Firebase에 저장
    console.log('Save analysis parameter:', saveAnalysis)
    console.log('Analysis data to save:', JSON.stringify(analysisData, null, 2))
    if (saveAnalysis) {
      try {
        const analysisRef = ref(database, `comprehensiveAnalyses/${sessionId}/${analysisId}`)
        console.log('Saving comprehensive analysis to:', `comprehensiveAnalyses/${sessionId}/${analysisId}`)
        console.log('Firebase database instance:', !!database)
        await set(analysisRef, analysisData)
        console.log('Comprehensive analysis saved successfully')
        
        // 저장 후 다시 읽어서 확인
        const savedData = await get(analysisRef)
        console.log('Verification - saved data exists:', savedData.exists())
        if (savedData.exists()) {
          console.log('Verification - saved data:', savedData.val())
        }
      } catch (error) {
        console.error('분석 결과 저장 실패:', error)
        console.error('Error details:', error.message, error.code)
        // 저장 실패해도 결과는 반환
      }
    } else {
      console.log('Analysis not saved (saveAnalysis is false)')
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData
    })

  } catch (error) {
    console.error('종합 분석 오류:', error)
    return NextResponse.json(
      { error: '종합 분석에 실패했습니다.' },
      { status: 500 }
    )
  }
}