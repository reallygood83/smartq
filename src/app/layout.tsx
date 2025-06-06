import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "SmartQ - 스마트한 다교과 질문 기반 학습 플랫폼",
  description: "모든 질문이 스마트한 학습이 되는 곳. AI 기반 다교과 질문 분석 및 활동 추천 서비스",
  keywords: "교육, 질문, AI, 학습, 다교과, 스마트러닝",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 min-h-screen font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}