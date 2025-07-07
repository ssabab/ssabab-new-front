'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMenuByDate, getTodayDateString, Menu, MenuResponse } from '../api/MainApi';

// 쿠키 관련 유틸리티 함수
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};




// --- 메뉴 카드 컴포넌트 ---
const MenuCard: React.FC<{
  menu: Menu;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ menu, title, isSelected, onClick }) => (
  <div 
    className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 ${
      isSelected ? 'ring-4 ring-rose-400 shadow-2xl scale-105 bg-gradient-to-br from-rose-50 to-white' : ''
    }`}
    onClick={onClick}
  >
    <h3 className={`text-3xl font-bold mb-4 text-center transition-colors duration-300 ${
      isSelected ? 'text-rose-600' : 'hover:text-rose-500'
    }`}>{title}</h3>
    <ul className="menu-list w-full">
      {menu.foods.map(food => (
        <li key={food.foodId} className={`transition-colors duration-200 ${
          isSelected ? 'bg-rose-100' : 'hover:bg-rose-50'
        }`}>
          {food.foodName}
          {food.mainSub !== '일반메뉴' && <span className="text-xs text-gray-500 ml-2">({food.mainSub})</span>}
        </li>
      ))}
    </ul>
  </div>
);

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
        <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-shadow">오늘의 싸밥!!</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
              <span className="ml-4 text-xl font-semibold">메뉴를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16">
              <div className="text-red-100 text-xl font-semibold mb-4">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                다시 시도
              </button>
            </div>
          ) : menuData && menuData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto w-full">
              {menuData.slice(0, 2).map((menu, index) => (
                <MenuCard 
                  key={menu.menuId}
                  menu={menu} 
                  title={`오늘의 메뉴 ${index + 1}`} 
                  isSelected={selectedMenuId === menu.menuId}
                  onClick={() => handleMenuClick(menu.menuId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-16">
              <span className="text-xl font-semibold">메뉴 데이터가 없습니다.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
