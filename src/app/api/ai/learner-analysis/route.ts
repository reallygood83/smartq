// SmartQ - 학습자용 성과 및 방향 분석 API
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
      educationLevel = 'elementary',
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

    const genAI = new GoogleGenerativeAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 학습자 관점 분석 프롬프트 생성
    const learnerPrompt = getBidirectionalAnalysisPrompt(
      'learner', 
      sessionType as SessionType, 
      adultLearnerType as AdultLearnerType || AdultLearnerType.PROFESSIONAL
    );

    const levelPrompts = getEducationLevelPrompts(
      educationLevel as EducationLevel, 
      adultLearnerType as AdultLearnerType,
      sessionType as SessionType
    );

    const terminology = getTerminology('student', educationLevel as EducationLevel);

    const prompt = `
${levelPrompts.systemPrompt}

당신은 학습 상담 전문가입니다. 다음 세션에서 ${getTerminology('student', educationLevel as EducationLevel)}이 제출한 질문을 바탕으로 학습자의 성과와 향후 학습 방향을 분석해주세요.

${learnerPrompt}

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

다음 기준으로 학습자의 성과와 향후 방향을 분석해주세요:

1. **학습 성과 평가**
   - 지식 습득 정도와 이해력 수준
   - 실무/학습 기술 발전 양상
   - 개인적 성장과 자신감 변화
   - 전반적인 학습 성취도 (1-100점)

2. **학습 진행 상황 분석**
   - 현재 학습 수준과 단계
   - 강점 영역과 우수한 부분
   - 개선이 필요한 도전 영역
   - 구체적인 진전 지표

3. **맞춤형 학습 방향 제시**
   - 단계별 다음 학습 목표
   - 추가 학습 자료 및 리소스
   - 실습 및 적용 활동 제안
   - 자기 성찰을 위한 질문

4. **동기 유발 및 지속성**
   - 내재적 학습 동기 분석
   - 외적 동기 요인 파악
   - 참여도 및 몰입 수준
   - 지속적 학습을 위한 전략

JSON 형식으로 응답해주세요:
{
  "learningOutcomes": {
    "knowledgeGain": "지식 습득에 대한 구체적 평가",
    "skillDevelopment": "기술 발전에 대한 구체적 평가",
    "personalGrowth": "개인 성장에 대한 구체적 평가",
    "overallScore": 85
  },
  "learningProgress": {
    "currentLevel": "현재 학습 수준 (초급/중급/고급 등)",
    "strengthAreas": [
      "강점 영역 1",
      "강점 영역 2"
    ],
    "challengeAreas": [
      "도전 영역 1",
      "도전 영역 2"
    ],
    "progressIndicators": [
      "진전 지표 1",
      "진전 지표 2"
    ]
  },
  "recommendations": {
    "nextSteps": [
      "다음 단계 1",
      "다음 단계 2"
    ],
    "additionalResources": [
      "추가 자료 1",
      "추가 자료 2"
    ],
    "practiceActivities": [
      "실습 활동 1",
      "실습 활동 2"
    ],
    "selfReflectionQuestions": [
      "성찰 질문 1",
      "성찰 질문 2"
    ]
  },
  "motivationFactors": {
    "intrinsicMotivation": "내재적 동기에 대한 분석",
    "extrinsicFactors": [
      "외적 동기 요인 1",
      "외적 동기 요인 2"
    ],
    "engagementLevel": "참여 수준에 대한 평가",
    "sustainabilityTips": [
      "지속성 팁 1",
      "지속성 팁 2"
    ]
  }
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
    console.error('Learner analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: '학습자 분석 중 오류가 발생했습니다.',
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