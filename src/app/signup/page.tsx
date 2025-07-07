// src/app/signup/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { setCookie } from '@/api/MypageApi'; // setCookie만 명시적으로 사용

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // initializeAuth를 AuthStore에서 가져와 사용합니다.
    const { initializeAuth } = useAuthStore();

    useEffect(() => {
        console.log('SignupPage useEffect started.');

        const urlAccessToken = searchParams.get('accessToken');
        const urlRefreshToken = searchParams.get('refreshToken');

        // URL에서 소셜 데이터 파싱 (initializeAuth가 내부적으로 다시 파싱하겠지만, 명시적으로 추출)
        const currentSocialData: {
            email?: string;
            provider?: string;
            providerId?: string;
            profileImage?: string;
            name?: string;
            username?: string;
            ssafyRegion?: string;
        } = {};
        if (searchParams.has('email')) currentSocialData.email = searchParams.get('email') || undefined;
        if (searchParams.has('provider')) currentSocialData.provider = searchParams.get('provider') || undefined;
        if (searchParams.has('providerId')) currentSocialData.providerId = searchParams.get('providerId') || undefined;
        if (searchParams.has('profileImage')) currentSocialData.profileImage = searchParams.get('profileImage') || undefined;
        if (searchParams.has('name')) currentSocialData.name = searchParams.get('name') || undefined;
        if (searchParams.has('username')) currentSocialData.username = searchParams.get('username') || undefined;
        if (searchParams.has('ssafyRegion')) currentSocialData.ssafyRegion = searchParams.get('ssafyRegion') || undefined;

        console.log('URL Parsed Tokens:', { urlAccessToken, urlRefreshToken });
        console.log('URL Parsed Social Data:', currentSocialData);

        // 액세스 및 리프레시 토큰이 URL에 존재한다면 쿠키에 저장
        if (urlAccessToken) {
            setCookie('accessToken', urlAccessToken);
            console.log('Access token set in cookie.');
        }
        if (urlRefreshToken) {
            setCookie('refreshToken', urlRefreshToken);
            console.log('Refresh token set in cookie.');
        }

        // AuthStore 초기화 로직 호출
        // 이 함수 내부에서 URL 파라미터를 다시 한 번 확인하고, 토큰/소셜 데이터를 스토어에 설정하며, URL을 정리합니다.
        initializeAuth();
        console.log('AuthStore initializeAuth called. URL should be cleaned.');

        // 모든 정보 처리가 완료된 후 마이페이지로 리다이렉션
        const targetPath = '/mypage';
        console.log(`Attempting to redirect to: ${targetPath}`);
        router.replace(targetPath); // URL에서 파라미터는 이미 initializeAuth에 의해 정리되었을 것으로 예상

        // 이 return 함수는 컴포넌트 언마운트 시 또는 useEffect가 재실행되기 전에 실행됩니다.
        return () => {
            console.log('SignupPage useEffect cleanup.');
        };
    }, [router, searchParams, initializeAuth]); // 의존성 배열에 router, searchParams, initializeAuth 포함

    // 사용자가 이 페이지에 잠시 머무르는 동안 보여줄 UI
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
            <p className="text-xl font-semibold text-gray-700">회원가입 정보 처리 중...</p>
            <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-500">잠시 후 마이페이지로 이동합니다.</p>
        </div>
    );
}