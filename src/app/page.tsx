'use client';

import FriendsReviewList from '@/component/home/FriendReview';
import ReviewVotePage from '@/component/home/ReviewVote';
import MenuReviewCount from '@/component/home/TotalReview';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMenuByDate, getTodayDateString, MenuResponse } from '../api/MainApi';

// 쿠키 관련 유틸리티 함수
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

export default function Home() {
  const router = useRouter();
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = (menuId: number) => {
    setSelectedMenuId(selectedMenuId === menuId ? null : menuId);
  };

  // 토큰 처리 로직
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // 쿠키에 토큰 저장 (7일 만료)
      setCookie('accessToken', accessToken, 7);
      setCookie('refreshToken', refreshToken, 7);
      
      console.log('토큰이 쿠키에 저장되었습니다.');
      
      // URL에서 토큰 파라미터 제거하고 리다이렉트
      router.replace('/');
    }
  }, [router]);

  // API를 통해 메뉴 데이터 가져오기
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const todayDate = getTodayDateString();
        const data = await getMenuByDate(todayDate);
        setMenuData(data);
        setError(null);
      } catch (err) {
        setError('메뉴 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('메뉴 데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <>
      <style jsx global>{`
        .section-gradient-pastel { 
          background: linear-gradient(to bottom, #60a5fa, #93c5fd, #bfdbfe); 
        }
        .text-shadow { 
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); 
        }
        .menu-list { 
          list-style: none; 
          padding: 0; 
          margin-top: 1rem; 
          text-align: left; 
          width: 100%; 
        }
        .menu-list li { 
          background-color: #f5f8fa; 
          color: #4a5568; 
          padding: 0.5rem 1rem; 
          margin-bottom: 0.5rem; 
          border-radius: 0.5rem; 
          font-size: 1rem; 
          font-weight: 500;
        }
      `}</style>

      <div className="py-16 md:py-24 px-4 section-gradient-pastel text-white text-center">
        <ReviewVotePage />
        <FriendsReviewList date={getTodayDateString()} />
        <MenuReviewCount />
      </div>
    </>
  );
}
