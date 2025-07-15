'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/AuthStore';

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null;
} 