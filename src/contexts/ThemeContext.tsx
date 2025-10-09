'use client'

import React, { createContext, useContext } from 'react'

type Theme = 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 항상 light 테마만 제공
  const theme: Theme = 'light'
  const resolvedTheme: 'light' = 'light'
  
  const setTheme = (newTheme: Theme) => {
    // 현재는 light 테마만 지원하므로 아무것도 하지 않음
    console.log('테마 변경이 요청되었지만 현재는 light 모드로 고정되어 있습니다:', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}