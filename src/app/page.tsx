'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuStore, Menu, toYYYYMMDD, DailyMenu } from '@/store/MenuStore';
import { 
  submitPreVote, 
  SubmitPreVotePayload, 
  checkPreVoteStatus, 
  checkEvaluationStatus,
  submitFoodReviews,
  submitMenuReview,
  SubmitFoodReviewsPayload,
  SubmitMenuReviewPayload,
  getWeeklyMenu
} from '@/api/ReviewApi';

import FoodRatings from '@/component/review/FoodRatings';
import RegretQuestion from '@/component/review/RegretQuestion';
import ReviewText from '@/component/review/ReviewText';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// --- 날짜 네비게이터 컴포넌트 ---
const DateNavigator = ({ selectedDate, setSelectedDate, weeklyMenus }: { 
  selectedDate: Date; 
  setSelectedDate: (date: Date) => void; 
  weeklyMenus: DailyMenu[] 
}) => {
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  // Calculate boundaries from weeklyMenus data
  const availableDates = weeklyMenus.map(menu => new Date(menu.date)).sort((a, b) => a.getTime() - b.getTime());
  const weekStart = availableDates.length > 0 ? availableDates[0] : selectedDate;
  const weekEnd = availableDates.length > 0 ? availableDates[availableDates.length - 1] : selectedDate;
  
  const isPrevDisabled = selectedDate <= weekStart;
  const isNextDisabled = selectedDate >= weekEnd;

  return (
    <div className="flex items-center justify-center mb-8 space-x-4 text-white">
      <button onClick={handlePrevDay} disabled={isPrevDisabled} className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-2xl font-bold text-shadow">{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</h2>
      <button onClick={handleNextDay} disabled={isNextDisabled} className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

// --- 메뉴 카드 컴포넌트 ---
const MenuCard: React.FC<{
  menu: Menu;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}> = ({ menu, title, isSelected, onSelect, className = '' }) => (
  <div
    className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center ${isSelected ? 'selected' : ''} ${className}`}
    onClick={onSelect}
  >
    <h3 className="text-3xl font-bold mb-4 text-center">{title}</h3>
    <ul className="menu-list w-full">
      {menu.foods.map(food => (
        <li key={food.foodId}>
          {food.foodName}
          {food.mainSub !== '일반메뉴' && <span className="text-xs text-gray-500 ml-2">({food.mainSub})</span>}
        </li>
      ))}
    </ul>
  </div>
);

// --- 메뉴 없음 카드 ---
const NoMenuCard = () => (
    <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center col-span-full h-full">
      <h3 className="text-3xl font-bold text-center">오늘은 싸밥이 없어요!!</h3>
    </div>
);

// 공휴일과 주말 체크 함수
const isHolidayOrWeekend = (date: Date): boolean => {
  const day = date.getDay(); // 0: 일요일, 6: 토요일
  return day === 0 || day === 6;
};

// 오늘 날짜인지 확인하는 함수
const isTodayDate = (date: Date): boolean => {
  const today = new Date();
  return toYYYYMMDD(date) === toYYYYMMDD(today);
};

export default function Home() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'preVote' | 'evaluation' | null>(null);
  const [selectedPreVoteMenuType, setSelectedPreVoteMenuType] = useState<string | null>(null);
  const [selectedEvalMenuId, setSelectedEvalMenuId] = useState<number | null>(null);

  // Weekly menu data management
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenu[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hydration 문제 해결을 위한 클라이언트 전용 상태
  const [isClient, setIsClient] = useState(false);
  
  const isToday = isClient ? isTodayDate(selectedDate) : false;
  
  // Get current date's menu from weekly data
  const selectedDateMenu = weeklyMenus.find(dailyMenu => 
    dailyMenu.date === toYYYYMMDD(selectedDate)
  );
  
  // 메뉴가 전혀 없는 날인지 확인 (공휴일과 주말)
  const isNoMenuDay = isClient && (isHolidayOrWeekend(selectedDate) || 
    !selectedDateMenu || 
    (!selectedDateMenu.menu1?.foods?.length && !selectedDateMenu.menu2?.foods?.length));
  
  // 실제 activeSection 결정 (오늘만 가능)
  const currentActiveSection = isToday ? activeSection : null;

  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const [messageBoxOkCallback, setMessageBoxOkCallback] = useState<(() => void) | null>(null);
  
  // For detailed review
  const [selectedEvalMenu, setSelectedEvalMenu] = useState<Menu | null>(null);
  const [selectedMenuTitle, setSelectedMenuTitle] = useState<string>(''); // 메뉴 제목 상태 추가
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [wouldRegret, setWouldRegret] = useState<boolean | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const showMessage = (message: string, onOkCallback: (() => void) | null = null) => {
    setMessageBoxText(message);
    setMessageBoxOkCallback(() => onOkCallback);
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden';
  };

  const handleConfirm = () => {
    setMessageBoxVisible(false);
    document.body.style.overflow = 'auto';
    if (messageBoxOkCallback) {
      messageBoxOkCallback();
    }
  };
  
  // 클라이언트 전용 초기화
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 토큰 처리 로직 (클라이언트 전용)
  useEffect(() => {
    if (!isClient) return;
    
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken) {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; samesite=strict; secure`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; samesite=strict; secure`;
      console.log('토큰이 쿠키에 저장되었습니다.');
      router.replace('/');
    }
  }, [router, isClient]);
  
  // Fetch weekly menu data
  const fetchWeeklyMenuData = async () => {
    try {
      setIsLoading(true);
      const data = await getWeeklyMenu();
      console.log('받아온 주간 메뉴 데이터:', data);
      console.log('weeklyMenus:', data.weeklyMenus);
      setWeeklyMenus(data.weeklyMenus);
      setError(null);
    } catch (err) {
      setError('메뉴 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('주간 메뉴 데이터 로딩 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isClient) return;
    
    fetchWeeklyMenuData();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    setActiveSection(currentHour < 11 || (currentHour === 11 && currentMinute < 30) ? 'preVote' : 'evaluation');
  }, [isClient]);
  
  const checkVoteStatus = useCallback(async () => {
    if (isToday && selectedDateMenu) {
      const dateStr = toYYYYMMDD(selectedDate);
      if (currentActiveSection === 'preVote') {
        const preVoteStatus = await checkPreVoteStatus(dateStr);
        if (preVoteStatus.menuId) {
          if (selectedDateMenu.menu1?.menuId === preVoteStatus.menuId) setSelectedPreVoteMenuType('menu1');
          else if (selectedDateMenu.menu2?.menuId === preVoteStatus.menuId) setSelectedPreVoteMenuType('menu2');
        }
      } else if (currentActiveSection === 'evaluation') {
        const evalStatus = await checkEvaluationStatus(dateStr);
        if (evalStatus.menuId) {
          setSelectedEvalMenuId(evalStatus.menuId);
        }
      }
    }
  }, [isToday, selectedDateMenu, selectedDate, currentActiveSection]);

  useEffect(() => {
    if (!isLoading && selectedDateMenu) {
      checkVoteStatus();
    }
  }, [isLoading, selectedDateMenu, checkVoteStatus]);
  
  // 날짜가 변경될 때마다 선택 상태 초기화
  useEffect(() => {
    console.log('선택된 날짜:', toYYYYMMDD(selectedDate));
    console.log('선택된 날짜의 메뉴:', selectedDateMenu);
    setSelectedEvalMenuId(null);
    setSelectedPreVoteMenuType(null);
    setSelectedEvalMenu(null);
    setSelectedMenuTitle('');
    setRatings({});
    setWouldRegret(null);
    setReviewText('');
  }, [selectedDate, selectedDateMenu]);

  const handlePreVoteSelect = (menuType: 'menu1' | 'menu2') => {
    if (!isToday) {
      showMessage("오늘 날짜에서만 사전투표가 가능합니다.");
      return;
    }
    if (!getCookieValue('accessToken')) {
      showMessage("로그인을 해주세요.", () => router.push('/login'));
    } else {
      setSelectedPreVoteMenuType(menuType);
    }
  };

  const handleEvalSelect = (menuId: number | null) => {
    if (!isToday) {
      showMessage("오늘 날짜에서만 평가가 가능합니다.");
      return;
    }
    if (menuId === null) {
      showMessage("선택한 메뉴에 ID가 없어 평가할 수 없습니다.");
      return;
    }
    if (!getCookieValue('accessToken')) {
      showMessage("로그인을 해주세요.", () => router.push('/login'));
    } else {
      setSelectedEvalMenuId(menuId);
    }
  };

  const handleGoToEvaluate = () => {
    if (selectedEvalMenuId && selectedDateMenu) {
      // Find the selected menu and set it for detailed review
      const menu = selectedDateMenu.menu1?.menuId === selectedEvalMenuId ? selectedDateMenu.menu1 : selectedDateMenu.menu2;
      const menuTitle = selectedDateMenu.menu1?.menuId === selectedEvalMenuId ? '메뉴 1' : '메뉴 2';
      
      if (menu) {
        setSelectedEvalMenu(menu);
        setSelectedMenuTitle(menuTitle);
        // Scroll to review section
        setTimeout(() => {
          const reviewSection = document.getElementById('detailed-review-section');
          if (reviewSection) {
            reviewSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        showMessage("선택한 메뉴를 찾을 수 없습니다. 다시 시도해주세요.");
      }
    } else {
      showMessage("먼저 평가할 메뉴를 선택해주세요!");
    }
  };

  const handlePreVoteSubmit = async () => {
    if (!selectedPreVoteMenuType || !selectedDateMenu) {
      showMessage("먼저 메뉴를 선택해주세요!");
      return;
    }
    const selectedMenu = selectedPreVoteMenuType === 'menu1' ? selectedDateMenu.menu1 : selectedDateMenu.menu2;
    const menuTitle = selectedPreVoteMenuType === 'menu1' ? '오늘의 메뉴 1' : '오늘의 메뉴 2';

    if (!selectedMenu || selectedMenu.menuId === null) {
      showMessage("선택된 메뉴 정보를 찾을 수 없거나 메뉴 ID가 없습니다.");
      return;
    }
    const payload: SubmitPreVotePayload = { preVoteId: 0, userId: 0, menuId: selectedMenu.menuId };
    try {
      await submitPreVote(payload);
      showMessage(`'${menuTitle}' 메뉴 사전 투표가 완료되었습니다!`, () => {
        // 투표 완료 후 상태 초기화
        setSelectedPreVoteMenuType(null);
      });
    } catch (error) {
      console.error("사전 투표 제출 실패:", error);
      showMessage("사전 투표 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvalMenu || selectedEvalMenu.menuId === null) return;
    if (wouldRegret === null) {
      showMessage("해당 메뉴 선택에 만족하시나요? 질문에 답변해주세요!");
      return;
    }
    const finalRatings: Record<number, number> = {};
    let hasZeroRating = false;
    selectedEvalMenu.foods.forEach(food => {
      const rating = ratings[food.foodId] || 0;
      finalRatings[food.foodId] = rating;
      if (rating === 0) hasZeroRating = true;
    });

    if (hasZeroRating && !window.confirm("0점인 음식이 존재합니다. 정말 제출하시겠습니까?")) return;

    setIsSubmitting(true);
    try {
      const foodReviewsPayload: SubmitFoodReviewsPayload = {
        menuId: selectedEvalMenu.menuId,
        reviews: Object.entries(finalRatings).map(([foodId, foodScore]) => ({ foodId: Number(foodId), foodScore })),
      };
      await submitFoodReviews(foodReviewsPayload);

      const totalScore = Object.values(finalRatings).reduce((sum, score) => sum + score, 0);
      const averageScore = selectedEvalMenu.foods.length > 0 ? totalScore / selectedEvalMenu.foods.length : 0;

      const menuReviewPayload: SubmitMenuReviewPayload = {
        menuId: selectedEvalMenu.menuId,
        menuRegret: wouldRegret,
        menuComment: reviewText.trim(),
        menuScore: parseFloat(averageScore.toFixed(2)),
      };
      await submitMenuReview(menuReviewPayload);
      setSubmissionSuccess(true);
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error("평가 제출 실패:", error);
      showMessage("평가 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 컴포넌트 언마운트 시 스크롤 복구
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
        .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
        .section-gradient-sunset { background: linear-gradient(to right, #FF7E5F, #FEB47B); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        .menu-card.selected { border: 4px solid #FF8C42; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        #preVoteSection .menu-card.selected { border-color: #347BBF; }
        #evaluationSection .menu-card.selected { border-color: #CC4444; }
        .menu-list { list-style: none; padding: 0; margin-top: 1rem; text-align: left; width: 100%; }
        .menu-list li { background-color: #f5f8fa; color: #4a5568; padding: 0.5rem 1rem; margin-bottom: 0.5rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; }
        
        /* 별점 관련 스타일 */
        .star-rating-item .star {
          transition: all 0.2s ease;
          color: #d1d5db;
          cursor: pointer;
        }
        .star-rating-item .star:hover {
          color: #fbbf24;
          transform: scale(1.1);
        }
        .star-rating-item .star.filled {
          color: #f59e0b;
        }
        .star-rating-item .star:hover ~ .star {
          color: #d1d5db;
        }
        
        .message-box-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .message-box-overlay.visible { opacity: 1; visibility: visible; }
        .message-box-content { background-color: #fff; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 20px rgba(0,0,0,0.2); text-align: center; max-width: 400px; width: 90%; transform: scale(0.95); transition: transform 0.3s ease; }
        .message-box-overlay.visible .message-box-content { transform: scale(1); }
        .message-box-content p { font-size: 1.25rem; color: #333; margin-bottom: 1.5rem; font-weight: 600; }
        .message-box-content button { background-color: #4CAF50; color: white; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: bold; transition: background-color 0.2s ease; }
        .message-box-content button:hover { background-color: #45a049; }
        
        .success-dialog-button { background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: bold; transition: background-color 0.2s ease; }
        .success-dialog-button.secondary { background-color: #6b7280; }
        .success-dialog-button:hover { background-color: #2563eb; }
        .success-dialog-button.secondary:hover { background-color: #4b5563; }

        .analysis-card { background-color: #ffffff; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0,0,0,0.15); padding: 1.5rem; transition: transform 0.3s ease-in-out; }
        .analysis-card:hover { transform: translateY(-5px); }
        .section-gradient-green { background: linear-gradient(to bottom, #BFF090, #FFFFFF); }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />

      {messageBoxVisible && (
        <div className="message-box-overlay visible" onClick={handleConfirm}>
          <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
            <p>{messageBoxText}</p>
            <button onClick={handleConfirm}>확인</button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="message-box-overlay visible">
          <div className="message-box-content">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>제출 중입니다...</p>
          </div>
        </div>
      )}

      {submissionSuccess && (
         <div className="message-box-overlay visible">
           <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
             <p className="text-2xl font-bold text-green-600 mb-2">🚀</p>
             <p>평가가 성공적으로 제출되었습니다!<br/>소중한 의견 감사합니다.</p>
             <div className="flex justify-center space-x-4 mt-6">
               <button onClick={() => { 
                 setSubmissionSuccess(false); 
                 document.body.style.overflow = 'auto'; 
                 setSelectedEvalMenu(null);
                 setSelectedMenuTitle('');
               }} className="success-dialog-button secondary">
                 닫기
               </button>
               <button onClick={() => {
                 document.body.style.overflow = 'auto';
                 router.push('/analysis');
               }} className="success-dialog-button">
                 분석 보러가기
               </button>
             </div>
           </div>
         </div>
      )}

      <div className={`min-h-screen transition-all duration-500 ${currentActiveSection === 'preVote' ? 'section-gradient-blue' : 'section-gradient-sunset'}`}>
        <div className="container mx-auto px-4 py-12 md:py-20">
          <DateNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} weeklyMenus={weeklyMenus} />

          {!isClient && <div className="text-center py-20 text-xl text-white">페이지를 불러오는 중입니다...</div>}
          {isClient && isLoading && <div className="text-center py-20 text-xl text-white">메뉴 정보를 불러오는 중입니다...</div>}
          {isClient && error && <div className="text-center py-20 text-red-500">{error}</div>}
          
          {isClient && !isLoading && !error && isNoMenuDay && (
            <section>
              <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-white text-shadow">오늘은 싸밥이 없어요!!</h1>
              <div className="flex justify-center">
                <div className="menu-card bg-white/90 text-gray-700 rounded-lg shadow-xl p-16 flex flex-col items-center justify-center max-w-md">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-bold text-center mb-2">공휴일과 주말</h3>
                  <p className="text-gray-500 text-center">공휴일과 주말에는<br/>급식이 제공되지 않습니다.</p>
                </div>
              </div>
            </section>
          )}
          
          {isClient && !isLoading && !error && !isNoMenuDay && currentActiveSection === 'preVote' && (
           <section id="preVoteSection">
             <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 text-white text-shadow">점심 사전투표</h1>
             <p className="text-center text-white text-lg mb-10">오전 11시 30분까지 진행됩니다. 가장 기대되는 메뉴에 투표해주세요!</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-start max-w-4xl mx-auto">
                {selectedDateMenu?.menu1 && selectedDateMenu.menu1.foods && selectedDateMenu.menu1.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu1} title="오늘의 메뉴 1" isSelected={selectedPreVoteMenuType === 'menu1'} onSelect={() => handlePreVoteSelect('menu1')} />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center">
                      <h3 className="text-3xl font-bold text-center">메뉴 1이 없습니다</h3>
                    </div>
                }
                {selectedDateMenu?.menu2 && selectedDateMenu.menu2.foods && selectedDateMenu.menu2.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu2} title="오늘의 메뉴 2" isSelected={selectedPreVoteMenuType === 'menu2'} onSelect={() => handlePreVoteSelect('menu2')} />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center">
                      <h3 className="text-3xl font-bold text-center">메뉴 2가 없습니다</h3>
                    </div>
                }
              </div>

             {selectedPreVoteMenuType && (
               <div className="mt-10 text-center">
                   <button onClick={handlePreVoteSubmit} className="bg-white text-blue-600 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 active:scale-95 text-lg">
                       투표 완료하기
                   </button>
               </div>
             )}
           </section>
         )}

          {isClient && !isLoading && !error && !isNoMenuDay && currentActiveSection === 'evaluation' && (
            <section id="evaluationSection">
             <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 text-white text-shadow">점심 식사 평가</h1>
             <p className="text-center text-white text-lg mb-10">오늘 드신 메뉴를 평가해주세요. 더 좋은 식사를 만드는 데 큰 도움이 됩니다!</p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-start max-w-4xl mx-auto">
                {selectedDateMenu?.menu1 && selectedDateMenu.menu1.foods && selectedDateMenu.menu1.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu1} title="오늘의 메뉴 1" isSelected={selectedEvalMenuId === selectedDateMenu.menu1.menuId} onSelect={() => handleEvalSelect(selectedDateMenu.menu1?.menuId || null)} />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center">
                      <h3 className="text-3xl font-bold text-center">메뉴 1이 없습니다</h3>
                    </div>
                }
                {selectedDateMenu?.menu2 && selectedDateMenu.menu2.foods && selectedDateMenu.menu2.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu2} title="오늘의 메뉴 2" isSelected={selectedEvalMenuId === selectedDateMenu.menu2.menuId} onSelect={() => handleEvalSelect(selectedDateMenu.menu2?.menuId || null)} />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center">
                      <h3 className="text-3xl font-bold text-center">메뉴 2가 없습니다</h3>
                    </div>
                }
               </div>
             
             {selectedEvalMenuId && (
               <div className="mt-10 text-center">
                   <button onClick={handleGoToEvaluate} className="bg-white text-red-600 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 active:scale-95 text-lg">
                       이 메뉴 평가하기
                   </button>
               </div>
             )}
            </section>
         )}

          {isClient && !isLoading && !error && !isNoMenuDay && !currentActiveSection && (
           <section>
             <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 text-white text-shadow">선택한 날짜의 메뉴</h1>
             <p className="text-center text-white text-lg mb-10">이 날짜의 메뉴를 확인해보세요. {!isToday && "과거/미래 날짜에서는 투표와 평가가 불가능합니다."}</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-start max-w-4xl mx-auto">
                {selectedDateMenu?.menu1 && selectedDateMenu.menu1.foods && selectedDateMenu.menu1.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu1} title="메뉴 1" isSelected={false} onSelect={() => {}} className="opacity-80 cursor-default" />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center opacity-80">
                      <h3 className="text-3xl font-bold text-center">메뉴 1이 없습니다</h3>
                    </div>
                }
                {selectedDateMenu?.menu2 && selectedDateMenu.menu2.foods && selectedDateMenu.menu2.foods.length > 0
                  ? <MenuCard menu={selectedDateMenu.menu2} title="메뉴 2" isSelected={false} onSelect={() => {}} className="opacity-80 cursor-default" />
                  : <div className="menu-card bg-white/80 text-gray-700 rounded-lg shadow-xl p-10 flex flex-col items-center justify-center opacity-80">
                      <h3 className="text-3xl font-bold text-center">메뉴 2가 없습니다</h3>
                    </div>
                }
              </div>
           </section>
         )}

       </div>
     </div>
      
      {selectedEvalMenu && (
        <section id="detailed-review-section" className="py-16 md:py-24 px-4 section-gradient-green text-center">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-800">
                    "{selectedMenuTitle}" 어떠셨나요?
                </h2>
                <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-gray-600">
                    각 음식에 대한 별점과 전반적인 평가를 남겨주세요.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-8 w-full">
                    <FoodRatings
                        menu={selectedEvalMenu}
                        ratings={ratings}
                        onRatingChange={(foodId, rating) => setRatings(prev => ({ ...prev, [foodId]: rating }))}
                    />
                    <RegretQuestion
                        wouldRegret={wouldRegret}
                        setWouldRegret={setWouldRegret}
                    />
                    <ReviewText
                        reviewText={reviewText}
                        setReviewText={setReviewText}
                    />
                    <div className="text-center mt-10">
                        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                           {isSubmitting ? '제출 중...' : '평가 제출하기'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
      )}
    </>
  );
}
