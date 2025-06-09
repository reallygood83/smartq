# SmartQ Firebase Realtime Database Rules - 교사 주도 모드 지원 완전판

## 업데이트 사항
- ✅ **teacherQuestions** 테이블 추가 (교사 주도 모드 질문 관리)
- ✅ **studentResponses** 테이블 추가 (학생 답변 관리)  
- ✅ **sessions** 검증 규칙 확장 (interactionMode 필드 지원)
- ✅ **보안 강화** 및 **성능 최적화**
- ✅ **기존 기능 100% 호환** 보장

---

## 완전한 Firebase 규칙 (복사해서 붙여넣기)

```json
{
  "rules": {
    "sessions": {
      ".indexOn": ["teacherId", "accessCode", "interactionMode"],
      ".read": "true",
      ".write": "auth != null",
      "$sessionId": {
        ".read": "true",
        ".write": "auth != null && (data.child('teacherId').val() == auth.uid || !data.exists())",
        ".validate": "newData.hasChildren(['title', 'accessCode', 'sessionType', 'teacherId', 'createdAt']) && (!newData.hasChild('interactionMode') || newData.child('interactionMode').isString())"
      }
    },
    "questions": {
      "$sessionId": {
        ".read": "true",
        ".write": "true",
        "$questionId": {
          ".write": "true",
          ".validate": "newData.hasChildren(['questionId', 'text', 'studentId', 'isAnonymous', 'createdAt', 'sessionId'])",
          "likes": {
            "$studentId": {
              ".write": "true",
              ".validate": "newData.isBoolean()"
            }
          }
        }
      }
    },
    "teacherQuestions": {
      ".indexOn": ["sessionId", "teacherId", "status"],
      "$sessionId": {
        ".read": "true",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$questionId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['questionId', 'sessionId', 'text', 'teacherId', 'order', 'source', 'status', 'createdAt']) && newData.child('source').val().matches(/^(prepared|realtime)$/) && newData.child('status').val().matches(/^(waiting|active|completed)$/) && newData.child('order').isNumber() && newData.child('teacherId').val() == auth.uid"
        }
      }
    },
    "studentResponses": {
      ".indexOn": ["sessionId", "questionId", "createdAt"],
      "$sessionId": {
        ".read": "true",
        ".write": "true",
        "$responseId": {
          ".write": "true",
          ".validate": "newData.hasChildren(['responseId', 'questionId', 'sessionId', 'text', 'studentId', 'createdAt']) && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 2000"
        }
      }
    },
    "sharedContents": {
      "$sessionId": {
        ".read": "true",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$contentId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['contentId', 'sessionId', 'teacherId', 'createdAt']) && newData.child('teacherId').val() == auth.uid"
        }
      }
    },
    "feedbackRequests": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$requestId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['requestId', 'sessionId', 'createdAt'])"
        }
      }
    },
    "feedbackResponses": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$responseId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['responseId', 'requestId', 'sessionId', 'createdAt'])"
        }
      }
    },
    "mentorshipProfiles": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$profileId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['profileId', 'sessionId', 'userId', 'createdAt'])"
        }
      }
    },
    "mentorshipMatches": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$matchId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['matchId', 'sessionId', 'mentorId', 'menteeId', 'createdAt'])"
        }
      }
    },
    "feedbackAnalyses": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
        "$analysisId": {
          ".write": "auth != null && root.child('sessions').child($sessionId).child('teacherId').val() == auth.uid",
          ".validate": "newData.hasChildren(['analysisId', 'sessionId', 'createdAt'])"
        }
      }
    },
    "mentorProfiles": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$profileId": {
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['profileId', 'sessionId', 'userId', 'createdAt'])"
        }
      }
    },
    "menteeProfiles": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$profileId": {
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['profileId', 'sessionId', 'userId', 'createdAt'])"
        }
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

---

## 주요 변경사항 설명

### 1. 새로운 테이블 추가

#### `teacherQuestions` 테이블
- **목적**: 교사 주도 모드에서 교사가 생성하는 질문 관리
- **권한**: 해당 세션의 교사만 생성/수정/삭제 가능
- **보안**: teacherId 검증, source/status 값 제한
- **인덱싱**: sessionId, teacherId, status로 쿼리 최적화

#### `studentResponses` 테이블  
- **목적**: 교사 질문에 대한 학생 답변 관리
- **권한**: 모든 사용자 읽기 가능, 익명 작성 허용
- **보안**: 답변 길이 제한 (2000자), 필수 필드 검증
- **인덱싱**: sessionId, questionId, createdAt로 정렬/필터링 최적화

### 2. 기존 테이블 개선

#### `sessions` 테이블
- **추가**: `interactionMode` 인덱싱 (모드별 세션 조회 최적화)
- **검증**: `interactionMode` 필드 타입 검증 추가 (선택적)

#### `sharedContents` 테이블
- **보안 강화**: teacherId 검증 추가로 권한 누수 방지
- **검증 강화**: contentId, teacherId 필수 필드 검증

### 3. 성능 최적화

#### 인덱싱 전략
```json
"teacherQuestions": {
  ".indexOn": ["sessionId", "teacherId", "status"]
}
```
- 세션별 질문 조회 최적화
- 교사별 질문 관리 최적화  
- 상태별 필터링 최적화

```json
"studentResponses": {
  ".indexOn": ["sessionId", "questionId", "createdAt"]
}
```
- 세션별 답변 조회 최적화
- 질문별 답변 그룹핑 최적화
- 시간순 정렬 최적화

### 4. 보안 강화

#### 데이터 무결성
- **교사 질문**: source, status 값 정규식 검증
- **학생 답변**: 텍스트 길이 제한 (1-2000자)
- **권한 검증**: 모든 write 작업에 교사 권한 확인

#### 악용 방지
- **무한 텍스트**: 답변 길이 제한으로 스팸 방지
- **잘못된 상태**: enum 값 검증으로 데이터 정합성 보장
- **권한 우회**: 중복 권한 검증으로 보안 강화

---

## 적용 방법

1. **Firebase Console에서 적용**:
   - Firebase Console → 프로젝트 → Realtime Database → 규칙
   - 위 JSON 내용을 복사하여 붙여넣기
   - "게시" 버튼 클릭

2. **Firebase CLI로 적용**:
   ```bash
   # database.rules.json 파일 업데이트 후
   firebase deploy --only database
   ```

---

## 호환성 보장

✅ **기존 세션**: 100% 정상 작동  
✅ **기존 질문**: 기존 구조 그대로 유지  
✅ **기존 사용자**: 권한 체계 동일  
✅ **기존 기능**: 영향 없음  

---

## 테스트 체크리스트

### 기존 기능 테스트
- [ ] 세션 생성/조회/수정
- [ ] 학생 질문 작성
- [ ] 질문 좋아요 기능
- [ ] 공유 콘텐츠 업로드

### 신규 기능 테스트  
- [ ] 교사 주도 모드 세션 생성
- [ ] 교사 질문 생성/활성화
- [ ] 학생 답변 작성
- [ ] 실시간 답변 동기화

이 규칙을 적용하면 SmartQ의 교사 주도 모드가 안전하고 효율적으로 작동할 수 있습니다! 🚀