'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMenuByDate, getTodayDateString, Food, Menu, MenuResponse } from '../api/MainApi';



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
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = (menuId: number) => {
    setSelectedMenuId(selectedMenuId === menuId ? null : menuId);
  };

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
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #ffffff; 
          overflow-x: hidden; 
          overflow-y: auto; 
        }
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
             <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />



       {/* 헤더 */}
       <header className="bg-white shadow-md py-4">
         <div className="container mx-auto px-4 flex justify-between items-center">
           <Link href="/" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</Link>
           <nav>
             <ul className="flex space-x-6">
               <li><Link href="/" className="text-blue-600 font-bold rounded-lg">홈</Link></li>
               <li><Link href="/main" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">소개</Link></li>
               <li><Link href="/review" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">평가하기</Link></li>
               <li><Link href="/analysis" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">분석보기</Link></li>
               <li><Link href="/mypage" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">마이페이지</Link></li>
             </ul>
           </nav>
         </div>
       </header>

             {/* 메인 컨텐츠 */}
       <main className="flex-grow">
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
       </main>

       {/* 푸터 섹션 */}
       <footer className="bg-gray-800 text-white py-8">
         <div className="container mx-auto px-4 text-center">
           <p>&copy; 2025 오늘의 메뉴. 모든 권리 보유.</p>
           <div className="flex justify-center space-x-6 mt-4">
             <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">개인정보처리방침</a>
             <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">이용약관</a>
             <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">문의</a>
           </div>
         </div>
       </footer>
    </div>
  );
}
