# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start development server with Turbopack (default)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Firebase deployment
firebase deploy --only database    # Deploy database rules only
firebase deploy                   # Deploy all Firebase config
firebase login                    # Login to Firebase CLI (required once)

# Database rules testing
firebase deploy --only database:rules    # Deploy only security rules
```

## Architecture Overview

**SmartQ** is an AI-powered educational platform built with Next.js 15 and Firebase, designed to help teachers collect and analyze student questions using Google Gemini API.

### Core Architecture Patterns

**Education Level Adaptation System**
- All UI/UX adapts to 5 education levels: Elementary, Middle, High, University, Adult
- `EducationLevelContext` provides level-specific terminology, themes, and AI prompts
- Components use `useSmartTerminology()` for adaptive language
- Theme system in `/src/styles/themes.ts` provides level-specific visual styling

**Dual Authentication Model**
- Teachers: Firebase Authentication (Google OAuth)
- Students: Anonymous access via 6-digit session codes
- Security rules enforce teacher-only data modification

**Client-Side API Key Management**
- User-provided Gemini API keys stored encrypted in localStorage
- Never stored on server - encryption/decryption in `/src/lib/encryption.ts`
- API keys are user-specific and tied to Firebase auth UID

**Real-time Data Architecture**
- Firebase Realtime Database for live updates
- Session-based data structure: `/sessions/{sessionId}/`
- Questions, shared content, and AI analyses linked to sessions
- Students write to `/questions/{sessionId}/`, teachers control everything else

### Key Data Structures

**Sessions**: Core teaching units with unique 6-digit access codes
```typescript
{
  sessionId: string,
  title: string,
  accessCode: string,  // 6-digit student access code
  sessionType: 'DEBATE' | 'INQUIRY' | 'PROBLEM' | 'CREATIVE' | 'DISCUSSION' | 'QNA',
  teacherId: string,
  subjects?: Subject[],
  isAdultEducation?: boolean
}
```

**Questions**: Student submissions linked to sessions with like functionality
```typescript
{
  questionId: string,
  sessionId: string,
  text: string,
  studentId: string,  // Anonymous persistent ID
  isAnonymous: boolean,
  studentName?: string,
  likes?: {
    [studentId: string]: boolean  // Like tracking per student
  }
}
```

**AI Analysis Results**: Gemini API analysis of collected questions
```typescript
{
  clusteredQuestions: Array<{
    clusterId: number,
    clusterTitle: string,
    questions: string[],
    combinationGuide: string
  }>,
  recommendedActivities: Activity[],
  conceptDefinitions: Concept[]
}
```

### Critical Implementation Details

**Theme and Dark Mode System**
- Dual context system: `ThemeContext` for light/dark, `EducationLevelContext` for adaptive theming
- Theme system in `/src/styles/themes.ts` provides level-specific colors and styling
- Card components use Tailwind `dark:` classes for backgrounds
- **CRITICAL**: Always use `dark:text-white` for maximum contrast in dark mode - avoid `dark:text-gray-*`
- Use `useFullTheme()` hook to access complete theme object in components

**Firebase Security Rules**
- Teachers can only modify their own sessions
- Students can submit questions anonymously to any session
- Anonymous users can read sessions and submit questions/likes
- Questions have anonymous write access for student participation
- All advanced features (content sharing, analysis) require teacher authentication

**API Integration Pattern**
- `/src/app/api/ai/` contains Next.js API routes that proxy to Gemini
- Client sends encrypted API key in request headers
- Server-side API routes decrypt keys for Gemini API calls
- Never persist API keys on server side

**Navigation and Routing**
- Teachers: `/teacher/dashboard` → `/teacher/session/create` → `/teacher/session/{sessionId}`
- Students: Home page session code input → `/student/session/{sessionCode}`
- Education level adaptation affects all page content and navigation terminology

### Development Patterns

**When modifying UI components:**
- Always check if component uses education level adaptation via `useSmartTerminology()`
- Add dark mode support using Tailwind `dark:` classes - use `dark:text-white` for text
- Override theme system colors with Tailwind classes when needed for dark mode
- Test across different education levels using the level selector
- Student components support anonymous access - no authentication checks required

**When working with Firebase:**
- Security rules are in `database.rules.json` - deploy with `firebase deploy --only database`
- Use `onValue` listeners for real-time updates, not one-time `get()` calls
- Student operations (questions, likes) work anonymously - no auth checks needed
- Teacher operations require authentication state verification
- Questions support real-time like functionality with student-specific tracking

**When adding AI features:**
- API routes go in `/src/app/api/ai/`
- Use the established encryption pattern for API key handling
- Follow the education level prompt enhancement pattern in `/src/lib/aiPrompts.ts`

### Environment Setup Requirements

Required `.env.local` variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

The app gracefully degrades when Firebase config is missing, but authentication and real-time features will be disabled.

### Mobile and Dark Mode Considerations

**Mobile Optimization:**
- All components are mobile-first responsive using Tailwind CSS
- Student session pages optimized for tablet/mobile usage
- Touch-friendly UI elements and proper spacing

**Dark Mode Implementation:**
- Use `dark:text-white` for primary text in dark mode (not gray variants)
- Override theme system colors when they provide insufficient contrast
- Test all text elements on dark backgrounds for readability
- Collapsible sections and interactive elements maintain contrast in both modes

### Student Experience Features

**Real-time Interactions:**
- Questions appear instantly for all session participants
- Like functionality allows students to interact with each other's questions
- Anonymous student IDs persist across browser sessions
- Popular questions (3+ likes) get visual highlighting

**Educational Content:**
- Shared materials support text, links, YouTube videos, and instructions
- Materials section is collapsible to reduce initial page load
- Educational level adaptation affects all content presentation