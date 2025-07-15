// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { isLoggedIn, isValidTokenAvailable } from '@/utils/auth';
import { getCookieValue, removeCookie } from '@/api/MypageApi';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => boolean;
  logout: () => void;
  refreshAuthStatus: () => void;
}

/**
 * 간단하고 안정적인 인증 상태 관리 훅
 * - 기본적으로 쿠키 존재 여부만 확인 (빠름)
 * - 필요시에만 토큰 유효성 검증 (정확함)
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 빠른 인증 상태 확인 (쿠키 기반)
  const checkAuthStatus = useCallback(() => {
    const loggedIn = isLoggedIn();
    setIsAuthenticated(loggedIn);
    return loggedIn;
  }, []);

  // 정밀한 인증 상태 확인 (토큰 유효성 포함)
  const validateAuthStatus = useCallback(() => {
    if (!isLoggedIn()) {
      setIsAuthenticated(false);
      return false;
    }

    // 토큰이 있지만 유효하지 않은 경우
    if (!isValidTokenAvailable()) {
      // 자동으로 쿠키 제거 (만료된 토큰)
      removeCookie('accessToken');
      removeCookie('refreshToken');
      setIsAuthenticated(false);
      return false;
    }

    setIsAuthenticated(true);
    return true;
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    removeCookie('accessToken');
    removeCookie('refreshToken');
    setIsAuthenticated(false);
    
    // 서버에 로그아웃 알림 (선택사항)
    fetch('/api/account/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {
      // 로그아웃 API 실패는 무시
    });
  }, []);

  // 외부에서 인증 상태 새로고침
  const refreshAuthStatus = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      validateAuthStatus();
      setIsLoading(false);
    }, 100);
  }, [validateAuthStatus]);

  // 초기 로드 및 주기적 상태 확인
  useEffect(() => {
    // 초기 상태 설정
    checkAuthStatus();
    setIsLoading(false);

    // 포커스 시 상태 재확인
    const handleFocus = () => {
      validateAuthStatus();
    };

    // 스토리지 이벤트 감지 (다른 탭에서 로그아웃 시)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    // 주기적 토큰 유효성 검사 (5분마다)
    const interval = setInterval(() => {
      if (isLoggedIn()) {
        validateAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuthStatus, validateAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    logout,
    refreshAuthStatus
  };
} 