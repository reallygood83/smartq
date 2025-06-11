import React from 'react'

// URL 패턴을 감지하는 정규표현식 (더 정교하게 개선)
const URL_REGEX = /(https?:\/\/(?:[-\w.])+(?:[:\/][\w\/%._~:!$&'()*+,;=@-]*)?)/g

// 이메일 패턴도 감지하는 정규표현식 (선택적)
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

// 위험한 도메인 및 프로토콜 감지
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:']
const SUSPICIOUS_DOMAINS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'] // 단축 URL 서비스

// 복합 패턴 (URL과 이메일 모두)
const LINK_REGEX = /(https?:\/\/(?:[-\w.])+(?:[:\/][\w\/%._~:!$&'()*+,;=@-]*)?|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

export interface LinkifyOptions {
  target?: '_blank' | '_self'
  rel?: string
  className?: string
  onClick?: (url: string, type: 'url' | 'email') => void
  showDomainWarning?: boolean // 의심스러운 도메인 경고 표시
  allowSuspiciousLinks?: boolean // 의심스러운 링크 허용 여부
}

/**
 * 텍스트 내의 URL과 이메일을 자동으로 링크로 변환하는 함수
 */
export function linkifyText(
  text: string, 
  options: LinkifyOptions = {}
): React.ReactNode[] {
  const {
    target = '_blank',
    rel = 'noopener noreferrer',
    className = 'text-blue-600 hover:text-blue-800 underline',
    onClick
  } = options

  if (!text) return [text]

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // 정규표현식으로 링크 찾기
  text.replace(LINK_REGEX, (match, url, offset) => {
    // 링크 앞의 일반 텍스트 추가
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset))
    }

    // 링크 타입 판별
    const isEmail = EMAIL_REGEX.test(url)
    const isUrl = URL_REGEX.test(url)

    let href = url
    let linkType: 'url' | 'email' = 'url'

    if (isEmail) {
      href = `mailto:${url}`
      linkType = 'email'
    } else if (isUrl) {
      // http:// 또는 https://가 없는 경우 추가
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        href = `https://${url}`
      }
      linkType = 'url'
    }

    // URL 안전성 검사
    if (!isValidUrl(href)) {
      // 유효하지 않은 URL인 경우 일반 텍스트로 처리
      parts.push(url)
      lastIndex = offset + match.length
      return match
    }

    // 의심스러운 URL 처리
    const isSuspicious = isSuspiciousUrl(href)
    const { showDomainWarning = true, allowSuspiciousLinks = true } = options
    
    if (isSuspicious && !allowSuspiciousLinks) {
      // 의심스러운 링크 차단
      parts.push(
        <span key={`blocked-${offset}`} className="text-red-600 line-through">
          {url} [차단된 링크]
        </span>
      )
      lastIndex = offset + match.length
      return match
    }

    // 링크 컴포넌트 생성
    const linkElement = (
      <span key={`link-wrapper-${offset}`}>
        <a
          href={href}
          target={target}
          rel={rel}
          className={className}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault()
              onClick(url, linkType)
            } else if (isSuspicious && showDomainWarning) {
              // 의심스러운 링크 경고
              const confirmed = confirm(
                `이 링크는 단축 URL 서비스를 사용하고 있습니다.\n실제 대상 주소를 확인하기 어려울 수 있습니다.\n\n그래도 열어보시겠습니까?`
              )
              if (!confirmed) {
                e.preventDefault()
              }
            }
          }}
        >
          {url}
        </a>
        {isSuspicious && showDomainWarning && (
          <span className="ml-1 text-xs text-yellow-600" title="단축 URL - 주의 요망">
            ⚠️
          </span>
        )}
      </span>
    )

    parts.push(linkElement)
    lastIndex = offset + match.length

    return match
  })

  // 마지막 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

/**
 * 안전한 URL 검증 함수
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // 위험한 프로토콜 검사
    if (DANGEROUS_PROTOCOLS.some(protocol => urlObj.protocol.toLowerCase().startsWith(protocol))) {
      return false
    }
    
    // 기본적인 URL 유효성 검사
    return true
  } catch {
    return false
  }
}

/**
 * 의심스러운 URL 감지 함수
 */
export function isSuspiciousUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return SUSPICIOUS_DOMAINS.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * URL에서 도메인 추출
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * URL 미리보기 정보 생성
 */
export function generateUrlPreview(url: string): {
  domain: string
  isSecure: boolean
  displayUrl: string
} {
  const domain = extractDomain(url)
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  const isSecure = fullUrl.startsWith('https://')

  return {
    domain,
    isSecure,
    displayUrl: url.length > 50 ? `${url.substring(0, 47)}...` : url
  }
}

/**
 * React 컴포넌트로 사용할 수 있는 Linkify 컴포넌트
 */
export interface LinkifyProps extends LinkifyOptions {
  children: string
  as?: 'span' | 'div' | 'p'
}

/**
 * 링크 미리보기 컴포넌트 (URL 정보 표시)
 */
export function LinkPreview({ url }: { url: string }) {
  const preview = generateUrlPreview(url)
  
  return (
    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <span>{preview.isSecure ? '🔒' : '⚠️'}</span>
        <span className="font-medium">{preview.domain}</span>
        {isSuspiciousUrl(url) && (
          <span className="text-yellow-600 dark:text-yellow-400">⚠️ 단축 URL</span>
        )}
      </div>
      <div className="text-gray-500 dark:text-gray-400 truncate">
        {preview.displayUrl}
      </div>
    </div>
  )
}

export function Linkify({ 
  children, 
  as: Component = 'span', 
  ...options 
}: LinkifyProps): React.ReactElement {
  const linkedContent = linkifyText(children, {
    // 기본 안전 옵션 설정
    showDomainWarning: true,
    allowSuspiciousLinks: true,
    ...options
  })

  return React.createElement(Component, {}, ...linkedContent)
}

export default Linkify