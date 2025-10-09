import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { EducationLevelProvider } from '@/contexts/EducationLevelContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: "SmartQ - AI 기반 질문 분석 및 학습 활동 추천 플랫폼",
  description: "교사와 강사를 위한 스마트 학습 플랫폼. Gemini AI로 학생 질문을 분석하고 맞춤형 학습 활동을 추천합니다. 실시간 협업, 다교과 통합 지원, 무료 사용 가능.",
  keywords: "교육, AI, 질문분석, 학습활동, 교사, 강사, Gemini, 스마트러닝, 다교과, 실시간협업",
  authors: [{ name: "SmartQ Team" }],
  creator: "SmartQ",
  publisher: "SmartQ",
  applicationName: "SmartQ",

  // Open Graph
  openGraph: {
    title: "SmartQ - 교사·강사를 위한 AI 학습 플랫폼",
    description: "학생 질문을 AI로 분석하여 최적의 학습 활동을 추천합니다. 실시간 협업과 다교과 통합 지원.",
    url: "https://smartq.vercel.app",
    siteName: "SmartQ",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "SmartQ - AI 기반 질문 분석 및 학습 활동 추천 플랫폼",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "SmartQ - AI 기반 학습 플랫폼",
    description: "학생 질문을 AI로 분석하여 최적의 학습 활동을 추천합니다.",
    images: ["/og-image.svg"],
    creator: "@smartq",
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Manifest
  manifest: "/manifest.json",

  // Theme
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#1E40AF" },
  ],

  // Verification
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen font-sans">
        <ThemeProvider>
          <AuthProvider>
            <EducationLevelProvider>
              {children}
            </EducationLevelProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}