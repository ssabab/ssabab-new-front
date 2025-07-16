// src/utils/auth.ts
import React from 'react';
import { getCookieValue } from '@/api/MypageApi';

/**
 * 간단한 쿠키 기반 로그인 상태 확인
 * @returns boolean - 로그인 여부
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const accessToken = getCookieValue('accessToken');
  return !!accessToken && accessToken.trim() !== '';
}

/**
 * 실시간 로그인 상태 확인 (토큰 유효성 포함)
 * @returns boolean - 유효한 토큰 보유 여부
 */
export function isValidTokenAvailable(): boolean {
  if (!isLoggedIn()) return false;
  
  try {
    const accessToken = getCookieValue('accessToken');
    if (!accessToken) return false;
    
    // JWT 토큰 기본 형식 확인 (3개 부분으로 구성)
    const parts = accessToken.split('.');
    if (parts.length !== 3) return false;
    
    // Base64 디코딩으로 페이로드 확인
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // 만료 시간 확인
    return payload.exp && payload.exp > now;
  } catch (error) {
    // 토큰 파싱 실패 시 false 반환
    return false;
  }
}

/**
 * 로그인이 필요한 페이지에서 사용하는 가드 함수
 * @param redirectTo - 리다이렉트할 경로 (기본: '/login')
 * @returns boolean - 접근 허용 여부
 */
export function requireAuth(redirectTo: string = '/login'): boolean {
  if (typeof window === 'undefined') return false;
  
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
}

/**
 * 로그아웃 상태에서만 접근 가능한 페이지 가드
 * @param redirectTo - 리다이렉트할 경로 (기본: '/')
 * @returns boolean - 접근 허용 여부  
 */
export function requireGuest(redirectTo: string = '/'): boolean {
  if (typeof window === 'undefined') return true;
  
  if (isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
}

/**
 * 로그인 상태 실시간 감지를 위한 커스텀 훅용 함수
 */
export function useSimpleAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  React.useEffect(() => {
    // 초기 상태 설정
    setIsAuthenticated(isLoggedIn());
    
    // 쿠키 변경 감지를 위한 polling (선택사항)
    const interval = setInterval(() => {
      setIsAuthenticated(isLoggedIn());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { isAuthenticated };
} 