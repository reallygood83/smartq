// SmartQ - 실시간 교육 품질 모니터링 API
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SessionType } from '@/lib/utils';
import { AdultLearnerType, EducationLevel } from '@/types/education';
import { 
  getQualityMonitoringPrompt,
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
      sessionData,
      realTimeData
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

    // 품질 모니터링 프롬프트 생성
    const monitoringPrompt = getQualityMonitoringPrompt(
      sessionType as SessionType,
      sessionData?.participantCount || '미지정',
      sessionData?.duration || '미지정'
    );

    const levelPrompts = getEducationLevelPrompts(
      educationLevel as EducationLevel, 
      adultLearnerType as AdultLearnerType,
      sessionType as SessionType
    );

    const terminology = getTerminology('teacher', educationLevel as EducationLevel);

    const prompt = `
${levelPrompts.systemPrompt}

당신은 교육 품질 분석 전문가입니다. 다음 세션의 실시간 데이터를 바탕으로 교육 품질을 종합적으로 모니터링하고 분석해주세요.

${monitoringPrompt}

${sessionData ? `
세션 정보:
- 제목: ${sessionData.title}
- 참여 인원: ${sessionData.participantCount || '미지정'}
- 진행 시간: ${sessionData.duration || '미지정'}
- 학습 목표: ${sessionData.learningGoals || '미지정'}
- 산업 분야: ${sessionData.industryFocus || '일반'}
- 난이도: ${sessionData.difficultyLevel || '중급'}
` : ''}

${realTimeData ? `
실시간 데이터:
- 활성 참여자: ${realTimeData.activeParticipants}명
- 질문 제출률: ${realTimeData.questionSubmissionRate}%
- 평균 응답 시간: ${realTimeData.avgResponseTime}초
- 세션 진행 시간: ${realTimeData.sessionDuration}분
` : ''}

분석 대상 질문들:
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

다음 품질 지표들을 종합적으로 분석해주세요:

1. **참여도 지표 분석**
   - 질문 제출 빈도와 품질 수준
   - 상호작용 수준과 적극성 정도
   - 집중도와 몰입 상태 평가
   - 참여도 종합 점수 (1-100)

2. **학습 효과성 지표**
   - 핵심 개념 이해도와 습득 정도
   - 실무 연결성 인식도와 적용 가능성
   - 학습 목표 달성 진행률
   - 학습 효과성 종합 점수 (1-100)

3. **만족도 지표 평가**
   - 콘텐츠 적절성과 난이도 수준
   - 진행 방식과 교수법 만족도
   - 기대치 충족 정도와 가치 인식
   - 만족도 종합 점수 (1-100)

4. **개선 신호 감지**
   - 이해 부족 신호와 혼란 지점
   - 관심도 저하 징후와 원인 분석
   - 진행 속도 부적절성과 조정 필요성
   - 즉시 조치가 필요한 문제점들

5. **실시간 개선 방안**
   - 현재 세션에서 바로 적용 가능한 조정 방안
   - 세션 운영 최적화 전략
   - 후속 활동과 보완 계획
   - 지속적 품질 향상 방안

JSON 형식으로 응답해주세요:
{
  "participationMetrics": {
    "submissionFrequency": "질문 제출 빈도 분석",
    "interactionLevel": "상호작용 수준 평가",
    "concentrationLevel": "집중도 분석",
    "overallScore": 85
  },
  "learningEffectiveness": {
    "conceptUnderstanding": "개념 이해도 평가",
    "practicalConnection": "실무 연결성 분석",
    "goalProgress": "학습 목표 진행률",
    "overallScore": 82
  },
  "satisfactionIndicators": {
    "contentAppropriatenesss": "콘텐츠 적절성 평가",
    "deliveryMethod": "진행 방식 만족도",
    "expectationAlignment": "기대치 충족 정도",
    "overallScore": 88
  },
  "improvementSignals": {
    "comprehensionIssues": [
      "이해 부족 신호 1",
      "이해 부족 신호 2"
    ],
    "engagementDecline": [
      "참여도 저하 징후 1",
      "참여도 저하 징후 2"
    ],
    "pacingProblems": [
      "진행 속도 문제 1",
      "진행 속도 문제 2"
    ],
    "immediateActions": [
      "즉시 조치 사항 1",
      "즉시 조치 사항 2"
    ]
  },
  "recommendations": {
    "realTimeAdjustments": [
      "실시간 조정 방안 1",
      "실시간 조정 방안 2"
    ],
    "sessionOptimization": [
      "세션 최적화 방안 1",
      "세션 최적화 방안 2"
    ],
    "followUpActions": [
      "후속 활동 1",
      "후속 활동 2"
    ],
    "qualityEnhancements": [
      "품질 향상 방안 1",
      "품질 향상 방안 2"
    ]
  }
}

**중요**: 모든 점수는 1-100 범위로 평가해주세요. 실시간 모니터링 특성상 즉시 적용 가능한 구체적이고 실행 가능한 개선 방안에 중점을 두어 주세요.
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
        timestamp: new Date().toISOString(),
        monitoring: true
      });
    } catch (e) {
      console.error('JSON parsing error:', e);
      return NextResponse.json(
        { error: 'AI 응답 파싱 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Quality monitoring API error:', error);
    
    return NextResponse.json(
      { 
        error: '품질 모니터링 분석 중 오류가 발생했습니다.',
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