'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isLoggedIn } from '@/utils/auth';

export default function Header() {
  const pathname = usePathname();
  
  // 🎯 간단한 로그인 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 인증 상태 확인 - 매우 간단!
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(isLoggedIn());
      setIsLoading(false);
    };
    
    checkAuth();
    
    // 주기적으로 인증 상태 확인 (다른 탭에서 로그인/로그아웃 시)
    const interval = setInterval(checkAuth, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // 로그인 상태에 따라 다른 네비게이션 아이템 생성
  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: '홈' },
      { href: '/main', label: '소개' },
      // { href: '/review', label: '평가하기' },
      { href: '/analysis', label: '분석보기' },
    ];

    // 🎯 로딩 중이면 기본 아이템만 반환
    if (isLoading) {
      return baseItems;
    }

    // 로그인 상태에 따라 마지막 아이템 추가
    if (isAuthenticated) {
      return [...baseItems, { href: '/mypage', label: '마이페이지' }];
    } else {
      return [...baseItems, { href: '/login', label: '로그인' }];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</Link>
        <nav>
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`rounded-lg ${
                    isActive(item.href) 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-600 hover:text-blue-600 font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
