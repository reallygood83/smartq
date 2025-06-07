// SmartQ - 성인 교육 세션 분석 API
import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeAdultEducationSession,
  analyzePracticalQuestions,
  recommendExperienceBasedActivities,
  generateExpertiseLevelExplanations
} from '@/lib/gemini';
import { SessionType } from '@/lib/utils';
import { AdultLearnerType } from '@/types/education';

export async function POST(request: NextRequest) {
  try {
    const { 
      questions, 
      sessionType, 
      adultLearnerType,
      userApiKey,
      analysisType = 'comprehensive',
      industryFocus,
      difficultyLevel,
      participantCount,
      duration,
      concepts
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

    if (!sessionType || !adultLearnerType) {
      return NextResponse.json(
        { error: '세션 유형과 학습자 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (analysisType) {
      case 'comprehensive':
        // 종합 분석 - 모든 분석 기능 실행
        const [
          sessionAnalysis,
          practicalAnalysis,
          activityRecommendations
        ] = await Promise.all([
          analyzeAdultEducationSession(
            questions,
            sessionType as SessionType,
            adultLearnerType as AdultLearnerType,
            userApiKey,
            industryFocus,
            difficultyLevel,
            participantCount,
            duration
          ),
          analyzePracticalQuestions(
            questions,
            sessionType as SessionType,
            adultLearnerType as AdultLearnerType,
            userApiKey,
            industryFocus,
            difficultyLevel
          ),
          recommendExperienceBasedActivities(
            questions,
            sessionType as SessionType,
            adultLearnerType as AdultLearnerType,
            userApiKey,
            participantCount,
            duration,
            industryFocus
          )
        ]);

        result = {
          analysisType: 'comprehensive',
          sessionAnalysis,
          practicalAnalysis,
          activityRecommendations,
          timestamp: new Date().toISOString()
        };
        break;

      case 'practical':
        // 실무 중심 분석
        result = await analyzePracticalQuestions(
          questions,
          sessionType as SessionType,
          adultLearnerType as AdultLearnerType,
          userApiKey,
          industryFocus,
          difficultyLevel
        );
        result.analysisType = 'practical';
        break;

      case 'activities':
        // 활동 추천
        result = await recommendExperienceBasedActivities(
          questions,
          sessionType as SessionType,
          adultLearnerType as AdultLearnerType,
          userApiKey,
          participantCount,
          duration,
          industryFocus
        );
        result.analysisType = 'activities';
        break;

      case 'explanations':
        // 전문성 수준별 설명
        if (!concepts || !Array.isArray(concepts)) {
          return NextResponse.json(
            { error: '설명할 개념이 필요합니다.' },
            { status: 400 }
          );
        }
        
        result = await generateExpertiseLevelExplanations(
          concepts,
          difficultyLevel as 'beginner' | 'intermediate' | 'advanced' | 'expert' || 'intermediate',
          sessionType as SessionType,
          adultLearnerType as AdultLearnerType,
          userApiKey,
          industryFocus
        );
        result.analysisType = 'explanations';
        break;

      case 'session':
        // 세션 분석
        result = await analyzeAdultEducationSession(
          questions,
          sessionType as SessionType,
          adultLearnerType as AdultLearnerType,
          userApiKey,
          industryFocus,
          difficultyLevel,
          participantCount,
          duration
        );
        result.analysisType = 'session';
        break;

      default:
        return NextResponse.json(
          { error: '지원하지 않는 분석 유형입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Adult session analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: '성인 교육 세션 분석 중 오류가 발생했습니다.',
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