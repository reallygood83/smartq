// SmartQ - 교수자용 교육 효과성 분석 API
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SessionType } from '@/lib/utils';
import { AdultLearnerType, EducationLevel } from '@/types/education';
import { 
  getBidirectionalAnalysisPrompt,
  getEducationLevelPrompts,
  getTerminology 
} from '@/lib/aiPrompts';

export async function POST(request: NextRequest) {
  try {
    const { 
      questions, 
      sessionType, 
      adultLearnerType,
      userApiKey,
      educationLevel,
      sessionData
    } = await request.json();

    // API 키 검증
    if (!userApiKey) {
      return NextResponse.json(
        { error: '사용자 API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // 필수 데이터 검증
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: '분석할 질문이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!sessionType) {
      return NextResponse.json(
        { error: '세션 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    // 성인 학습자 타입이 있으면 자동으로 adult 레벨 설정
    const effectiveEducationLevel = adultLearnerType ? 'adult' : (educationLevel || 'elementary');

    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 교수자 관점 분석 프롬프트 생성
    const instructorPrompt = getBidirectionalAnalysisPrompt(
      'instructor', 
      sessionType as SessionType, 
      adultLearnerType as AdultLearnerType || AdultLearnerType.PROFESSIONAL
    );

    const levelPrompts = getEducationLevelPrompts(
      effectiveEducationLevel as EducationLevel, 
      adultLearnerType as AdultLearnerType,
      sessionType as SessionType
    );

    const terminology = getTerminology('teacher', effectiveEducationLevel as EducationLevel);

    const prompt = `
${levelPrompts.systemPrompt}

당신은 교육 전문가이자 ${terminology}입니다. 다음 세션에서 ${getTerminology('student', effectiveEducationLevel as EducationLevel)}들이 제출한 질문을 바탕으로 교육 효과성을 종합적으로 분석해주세요.

${instructorPrompt}

${sessionData ? `
세션 정보:
- 제목: ${sessionData.title}
- 참여 인원: ${sessionData.participantCount || '미지정'}
- 진행 시간: ${sessionData.duration || '미지정'}
- 학습 목표: ${sessionData.learningGoals || '미지정'}
- 산업 분야: ${sessionData.industryFocus || '일반'}
- 난이도: ${sessionData.difficultyLevel || '중급'}
` : ''}

분석 대상 질문들:
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

다음 기준으로 교육 효과성을 종합 분석해주세요:

1. **목표 달성도 평가**
   - 설정된 학습 목표와 질문 내용의 연관성
   - ${getTerminology('student', effectiveEducationLevel as EducationLevel)}들의 이해 수준 파악
   - 핵심 개념 습득 정도

2. **참여도 및 몰입도 분석**
   - 질문의 깊이와 사고 수준
   - 능동적 참여 정도
   - 학습에 대한 관심과 열의

3. **실무/학습 적용성**
   - 실제 활용 가능성
   - 전이 학습 효과
   - 지속적 학습 동기

4. **교수법 효과성**
   - 현재 교수법의 강점과 약점
   - ${getTerminology('student', effectiveEducationLevel as EducationLevel)} 반응 분석
   - 개선 필요 영역 식별

JSON 형식으로 응답해주세요:
{
  "sessionEffectiveness": {
    "goalAchievement": "목표 달성도 평가 (구체적 설명)",
    "participantEngagement": "참여자 몰입도 분석 (구체적 설명)",
    "practicalApplication": "실무 적용성 평가 (구체적 설명)",
    "overallScore": 85
  },
  "teachingInsights": {
    "strengthAreas": [
      "강점 영역 1",
      "강점 영역 2"
    ],
    "developmentAreas": [
      "개발 필요 영역 1",
      "개발 필요 영역 2"
    ],
    "pedagogicalTips": [
      "교수법 개선 팁 1",
      "교수법 개선 팁 2"
    ]
  },
  "recommendations": {
    "contentAdjustment": "콘텐츠 조정 방안",
    "deliveryImprovement": "전달 방식 개선 방안",
    "engagementStrategy": "참여도 향상 전략"
  },
  "improvementAreas": [
    "우선 개선 영역 1",
    "우선 개선 영역 2"
  ],
  "nextSteps": [
    "다음 단계 액션 1",
    "다음 단계 액션 2"
  ]
}

**중요**: overallScore는 1-100 점수로 평가해주세요.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      return NextResponse.json({
        success: true,
        data: parsed,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('JSON parsing error:', e);
      return NextResponse.json(
        { error: 'AI 응답 파싱 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Instructor analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: '교수자 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}