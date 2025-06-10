import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { database } from '@/lib/firebase'
import { ref, get, set } from 'firebase/database'
import { StudentResponse, TeacherQuestion } from '@/types/teacher-led'
import { Session } from '@/lib/utils'
import { getEducationLevelPrompts } from '@/lib/aiPrompts'
import { EducationLevel } from '@/types/education'

interface ResponseAnalysis {
  responseId: string
  studentId: string
  analysisResults: {
    comprehensionLevel: 'excellent' | 'good' | 'fair' | 'needs_improvement'
    comprehensionScore: number // 0-100
    keyStrengths: string[]
    improvementAreas: string[]
    conceptualGaps: string[]
    nextSteps: string[]
    detailedFeedback: string
  }
}

interface CollectiveAnalysis {
  overallInsights: {
    averageComprehension: number
    commonStrengths: string[]
    commonChallenges: string[]
    conceptualPatterns: string[]
  }
  teachingRecommendations: {
    immediateActions: string[]
    followUpQuestions: string[]
    reinforcementActivities: string[]
    differentiationStrategies: string[]
  }
  questionEffectiveness: {
    clarityScore: number // 0-100
    engagementLevel: number // 0-100
    cognitiveLevel: string
    suggestions: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Individual Analysis API Start ===')
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

    // 개별 답변 분석
    const responseAnalyses: ResponseAnalysis[] = []

    for (const response of targetResponses) {
      const individualAnalysisPrompt = `
${prompts.systemPrompt}

다음 교사 질문에 대한 학생 답변을 분석해주세요:

**교사 질문:** "${targetQuestion.text}"

**학생 답변:** "${response.text}"

**세션 정보:**
- 세션 제목: ${session.title}
- 세션 유형: ${session.sessionType}
- 교과목: ${session.subjects?.join(', ') || '미지정'}
- 학습 목표: ${session.learningGoals || '미지정'}

다음 관점에서 상세히 분석해주세요:

1. **이해도 평가 (0-100점)**
   - 질문의 핵심을 얼마나 잘 파악했는가?
   - 답변의 논리성과 일관성은?
   - 개념적 이해의 깊이는?

2. **강점 분석**
   - 답변에서 드러나는 학습자의 장점
   - 창의적이거나 독창적인 사고
   - 기존 지식과의 연결 능력

3. **개선 영역**
   - 부족하거나 오해하고 있는 부분
   - 논리적 비약이나 근거 부족
   - 추가 학습이 필요한 개념

4. **구체적 피드백**
   - 학습자가 이해할 수 있는 수준의 피드백
   - 격려와 개선 방향을 균형있게 제시
   - 다음 학습 단계 제안

다음 JSON 형식으로 응답해주세요:
{
  "comprehensionLevel": "excellent|good|fair|needs_improvement",
  "comprehensionScore": 숫자(0-100),
  "keyStrengths": ["강점1", "강점2", ...],
  "improvementAreas": ["개선영역1", "개선영역2", ...],
  "conceptualGaps": ["개념적격차1", "개념적격차2", ...],
  "nextSteps": ["다음단계1", "다음단계2", ...],
  "detailedFeedback": "상세한 피드백 메시지"
}
`

      try {
        const result = await model.generateContent(individualAnalysisPrompt)
        const analysisText = result.response.text()
        
        // JSON 파싱 시도
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysisResults = JSON.parse(jsonMatch[0])
          responseAnalyses.push({
            responseId: response.responseId,
            studentId: response.studentId,
            analysisResults
          })
        }
      } catch (error) {
        console.error(`개별 답변 분석 실패 (${response.responseId}):`, error)
        // 실패한 경우 기본 분석 제공
        responseAnalyses.push({
          responseId: response.responseId,
          studentId: response.studentId,
          analysisResults: {
            comprehensionLevel: 'fair',
            comprehensionScore: 70,
            keyStrengths: ['답변 제출 완료'],
            improvementAreas: ['분석 중 오류 발생'],
            conceptualGaps: [],
            nextSteps: ['재분석 필요'],
            detailedFeedback: '답변 분석 중 기술적 문제가 발생했습니다. 다시 시도해주세요.'
          }
        })
      }
    }

    // 전체 분석 (집합적 인사이트)
    const collectiveAnalysisPrompt = `
${prompts.systemPrompt}

다음 교사 질문에 대한 모든 학생들의 답변을 종합 분석해주세요:

**교사 질문:** "${targetQuestion.text}"

**학생 답변들:**
${targetResponses.map((r, i) => `${i + 1}. ${r.isAnonymous ? '익명' : r.studentName || '학생'}: "${r.text}"`).join('\n')}

**세션 정보:**
- 세션 제목: ${session.title}
- 세션 유형: ${session.sessionType}
- 참여 학생 수: ${targetResponses.length}명

전체적인 관점에서 다음을 분석해주세요:

1. **전체 학습 현황**
   - 평균적인 이해도 수준
   - 공통적으로 잘 이해한 부분
   - 공통적으로 어려워하는 부분
   - 답변에서 나타나는 패턴

2. **교수법 개선 제안**
   - 즉시 적용할 수 있는 교정 방법
   - 추가로 물어볼 만한 질문들
   - 개념 강화를 위한 활동
   - 개별 학습자 지원 전략

3. **질문 효과성 평가**
   - 질문의 명확성 (0-100점)
   - 학습자 참여도 (0-100점)
   - 인지적 수준 (기억/이해/적용/분석/평가/창조)
   - 질문 개선 제안

다음 JSON 형식으로 응답해주세요:
{
  "overallInsights": {
    "averageComprehension": 숫자(0-100),
    "commonStrengths": ["공통강점1", "공통강점2", ...],
    "commonChallenges": ["공통도전1", "공통도전2", ...],
    "conceptualPatterns": ["패턴1", "패턴2", ...]
  },
  "teachingRecommendations": {
    "immediateActions": ["즉시행동1", "즉시행동2", ...],
    "followUpQuestions": ["후속질문1", "후속질문2", ...],
    "reinforcementActivities": ["강화활동1", "강화활동2", ...],
    "differentiationStrategies": ["차별화전략1", "차별화전략2", ...]
  },
  "questionEffectiveness": {
    "clarityScore": 숫자(0-100),
    "engagementLevel": 숫자(0-100),
    "cognitiveLevel": "기억|이해|적용|분석|평가|창조",
    "suggestions": ["제안1", "제안2", ...]
  }
}
`

    let collectiveAnalysis: CollectiveAnalysis
    try {
      const collectiveResult = await model.generateContent(collectiveAnalysisPrompt)
      const collectiveText = collectiveResult.response.text()
      
      const jsonMatch = collectiveText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        collectiveAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON 형식 불일치')
      }
    } catch (error) {
      console.error('전체 분석 실패:', error)
      // 기본 분석 제공
      collectiveAnalysis = {
        overallInsights: {
          averageComprehension: 75,
          commonStrengths: ['참여도가 높음'],
          commonChallenges: ['분석 중 오류 발생'],
          conceptualPatterns: ['다양한 답변 스타일']
        },
        teachingRecommendations: {
          immediateActions: ['재분석 시도'],
          followUpQuestions: ['추가 질문 고려'],
          reinforcementActivities: ['개념 복습'],
          differentiationStrategies: ['개별 지원']
        },
        questionEffectiveness: {
          clarityScore: 80,
          engagementLevel: 85,
          cognitiveLevel: '이해',
          suggestions: ['질문 명확화']
        }
      }
    }

    // 분석 결과 생성
    const analysisId = `analysis_${Date.now()}`
    const analysisData = {
      analysisId,
      sessionId,
      questionId: targetQuestion.questionId,
      question: {
        questionId: targetQuestion.questionId,
        text: targetQuestion.text,
        responseCount: targetResponses.length
      },
      individualAnalyses: responseAnalyses,
      collectiveAnalysis,
      generatedAt: Date.now()
    }

    // 서버사이드에서 저장하지 않음 - 클라이언트에서 처리
    console.log('Save analysis parameter:', saveAnalysis)
    console.log('Analysis will be saved on client side if requested')

    return NextResponse.json({
      success: true,
      analysis: analysisData
    })

  } catch (error) {
    console.error('학생 답변 분석 오류:', error)
    return NextResponse.json(
      { error: '학생 답변 분석에 실패했습니다.' },
      { status: 500 }
    )
  }
}