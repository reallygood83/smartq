# SmartQ (스마트큐) 🍎📚

> **모든 질문이 스마트한 학습이 되는 곳**  
> AI 기반 다교과 질문 분석 및 활동 추천 교육 플랫폼

## ✨ 주요 기능

### 🍎 교사용 기능
- **구글 로그인**: 안전하고 편리한 인증
- **세션 관리**: 다양한 교과/유형별 학습 세션 생성
- **실시간 모니터링**: 학생 질문 실시간 확인
- **AI 분석**: Gemini API를 통한 질문 그룹화 및 활동 추천
- **대시보드**: 세션 현황 및 통계 관리

### 📚 학생용 기능
- **세션 참여**: 6자리 코드로 간편 접속
- **질문 제출**: 익명/실명 선택하여 질문 작성
- **실시간 피드백**: 세션 유형별 맞춤 가이드
- **질문 공유**: 다른 학생들의 질문 확인

### 🤖 AI 지원 기능
- **질문 분석**: 유사한 질문들 자동 그룹화
- **활동 추천**: 교과별 맞춤 교육 활동 제안
- **다교과 지원**: 국어, 수학, 과학, 사회, 영어 등
- **용어 정의**: 어려운 개념 쉬운 설명

## 🏗️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase Authentication, Firebase Realtime Database
- **AI**: Google Gemini API (사용자 개인 키)
- **배포**: Vercel

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/reallygood83/smartq.git
cd smartq
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
```

### 4. Firebase 설정

#### Authentication 설정
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Authentication → Sign-in method → Google 활성화
3. 프로젝트 지원 이메일 설정

#### Realtime Database 설정
1. Realtime Database → 데이터베이스 만들기
2. 테스트 모드로 시작 (개발용)
3. 지역: 아시아-동북아시아 선택

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 SmartQ를 확인하세요!

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 관련 페이지
│   ├── teacher/           # 교사용 페이지
│   ├── student/           # 학생용 페이지
│   ├── guide/             # 사용 가이드
│   └── api/               # API 라우트
├── components/            # 재사용 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   ├── teacher/          # 교사용 컴포넌트
│   └── student/          # 학생용 컴포넌트
├── contexts/             # React Context
└── lib/                  # 유틸리티 및 라이브러리
```

## 🔧 Vercel 배포

### 환경변수 설정
Vercel 대시보드에서 다음 환경변수를 설정하세요:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
```

## 💡 사용 가이드

### 교사 사용법
1. 구글 계정으로 로그인
2. 개인 Gemini API 키 설정 ([발급 방법](https://aistudio.google.com/app/apikey))
3. 새 세션 생성 (교과/유형 선택)
4. 세션 코드를 학생들에게 공유
5. 학생 질문 수집 후 AI 분석 실행

### 학생 사용법
1. SmartQ 홈페이지 접속
2. 6자리 세션 코드 입력
3. 질문 작성 및 제출
4. 다른 학생들의 질문 확인

## 🎯 세션 유형

- **💬 토론/논제 발굴**: 다양한 관점에서 토론할 수 있는 주제 찾기
- **🔬 탐구 활동**: 과학적 탐구와 실험 설계
- **🧮 문제 해결**: 수학적 사고와 논리적 문제 해결
- **🎨 창작 활동**: 창의적 표현과 상상력 발휘
- **💭 토의/의견 나누기**: 협력적 토의와 의견 공유
- **❓ 일반 Q&A**: 자유로운 질문과 답변

## 🔒 보안 정책

- API 키는 클라이언트 사이드에서 암호화 저장
- Firebase 보안 규칙을 통한 데이터 접근 제어
- 사용자 개인 Gemini API 키 사용으로 서버 비용 최소화

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 [Issues](https://github.com/reallygood83/smartq/issues)에서 해주세요.

---

**개발**: Claude (Anthropic) & 안양 박달초 김문정  
**Live Demo**: https://smartq-tau.vercel.app  
**GitHub**: https://github.com/reallygood83/smartq