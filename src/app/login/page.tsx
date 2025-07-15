'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { redirectToGoogleLogin } from '@/api/MypageApi';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthInitialized } = useAuthStore();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthInitialized && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isAuthInitialized, router]);

  const handleGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  if (!isAuthInitialized || isAuthenticated) {
    return (
      <>
        <style jsx global>{`
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
          .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        
        <div className="min-h-screen section-gradient-blue flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-shadow">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
        .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        .login-card { 
          background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        .google-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 25px rgba(66, 133, 244, 0.3); 
        }
        .google-btn {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen section-gradient-blue flex items-center justify-center px-4">
        <div className="login-card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-shadow">SSABAB 로그인</h1>
            <p className="text-gray-600 text-lg">싸피 식단 평가 서비스에 오신 것을 환영합니다</p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="google-btn w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-50 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 로그인</span>
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              신규 사용자는 자동으로 회원가입 페이지로 안내됩니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 