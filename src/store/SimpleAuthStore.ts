// src/store/SimpleAuthStore.ts
import React from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { isLoggedIn } from '@/utils/auth';
import { getCookieValue, removeCookie } from '@/api/MypageApi';

interface SimpleAuthState {
  isAuthenticated: boolean;
  checkAuth: () => boolean;
  logout: () => void;
  login: (accessToken: string, refreshToken: string) => void;
}

/**
 * 간단한 인증 상태 관리 스토어
 * - 복잡한 상태 없음
 * - 쿠키 기반 확인
 * - 최소한의 기능만 제공
 */
export const useSimpleAuthStore = create<SimpleAuthState>()(
  devtools(
    (set, get) => ({
      isAuthenticated: false,

      // 인증 상태 확인 및 업데이트
      checkAuth: () => {
        const loggedIn = isLoggedIn();
        set({ isAuthenticated: loggedIn });
        return loggedIn;
      },

      // 로그인 처리
      login: (accessToken: string, refreshToken: string) => {
        // 쿠키는 이미 서버에서 설정됨
        set({ isAuthenticated: true });
      },

      // 로그아웃 처리
      logout: () => {
        removeCookie('accessToken');
        removeCookie('refreshToken');
        set({ isAuthenticated: false });
        
        // 서버에 로그아웃 알림 (선택사항)
        fetch('/api/account/logout', {
          method: 'POST',
          credentials: 'include'
        }).catch(() => {
          // 실패해도 무시
        });
      },
    }),
    {
      name: 'simple-auth-store',
    }
  )
);

// 간단한 훅
export const useSimpleAuth = () => {
  const { isAuthenticated, checkAuth, logout, login } = useSimpleAuthStore();
  
  // 초기 로드 시 한 번만 확인
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return { isAuthenticated, checkAuth, logout, login };
}; 