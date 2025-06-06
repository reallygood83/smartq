'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // 구글 로그인을 사용하므로 로그인 페이지로 리다이렉트
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">로그인 페이지로 이동 중...</div>
    </div>
  )
}