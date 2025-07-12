'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuStore, Menu, toYYYYMMDD } from '@/store/MenuStore';
import { submitPreVote, SubmitPreVotePayload, checkPreVoteStatus, checkEvaluationStatus } from '@/api/ReviewApi';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// --- 날짜 네비게이터 컴포넌트 ---
const DateNavigator = () => {
  const { selectedDate, selectDate, weekBoundary } = useMenuStore();

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    selectDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    selectDate(newDate);
  };

  const isPrevDisabled = selectedDate <= weekBoundary.start;
  const isNextDisabled = selectedDate >= weekBoundary.end;

  return (
    <div className="flex items-center justify-center mb-8 space-x-4 text-white">
      <button onClick={handlePrevDay} disabled={isPrevDisabled} className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-2xl font-bold text-shadow">{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</h2>
      <button onClick={handleNextDay} disabled={isNextDisabled} className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed">
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
      <h3 className="text-3xl font-bold text-center">오늘은 점심이 없습니다!</h3>
    </div>
);


export default function ReviewPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'preVote' | 'evaluation' | null>(null);
  const [selectedPreVoteMenuType, setSelectedPreVoteMenuType] = useState<string | null>(null);
  const [selectedEvalMenuId, setSelectedEvalMenuId] = useState<number | null>(null);

  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const [messageBoxOkCallback, setMessageBoxOkCallback] = useState<(() => void) | null>(null);
  
  const { selectedDate, selectedDateMenu, isLoading, error, fetchWeeklyMenu } = useMenuStore();
  const isToday = toYYYYMMDD(selectedDate) === toYYYYMMDD(new Date());

  useEffect(() => {
    fetchWeeklyMenu();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    setActiveSection(currentHour < 11 || (currentHour === 11 && currentMinute < 30) ? 'preVote' : 'evaluation');
  }, [fetchWeeklyMenu]);
  
  const checkVoteStatus = useCallback(async () => {
    if (isToday && selectedDateMenu) {
      const dateStr = toYYYYMMDD(selectedDate);
      
      if (activeSection === 'preVote') {
        const preVoteStatus = await checkPreVoteStatus(dateStr);
        if (preVoteStatus.menuId) {
          if (selectedDateMenu.menu1?.menuId === preVoteStatus.menuId) {
            setSelectedPreVoteMenuType('menu1');
          } else if (selectedDateMenu.menu2?.menuId === preVoteStatus.menuId) {
            setSelectedPreVoteMenuType('menu2');
          }
        }
      } else if (activeSection === 'evaluation') {
        const evalStatus = await checkEvaluationStatus(dateStr);
        if (evalStatus.menuId) {
          setSelectedEvalMenuId(evalStatus.menuId);
        }
      }
    }
  }, [isToday, selectedDateMenu, selectedDate, activeSection]);

  useEffect(() => {
    if (!isLoading && selectedDateMenu) {
      checkVoteStatus();
    }
  }, [isLoading, selectedDateMenu, checkVoteStatus]);
  
  // 날짜가 변경될 때마다 선택 상태 초기화
  useEffect(() => {
    setSelectedEvalMenuId(null);
    setSelectedPreVoteMenuType(null);
  }, [selectedDate]);

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

  const handlePreVoteSelect = (menuType: 'menu1' | 'menu2') => {
    const token = getCookieValue('accessToken');
    if (!token) {
      showMessage("로그인을 해주세요.", () => {
        router.push('/mypage');
      });
    } else {
      setSelectedPreVoteMenuType(menuType);
    }
  };

  const handleEvalSelect = (menuId: number | null) => {
    if (menuId === null) {
      showMessage("선택한 메뉴에 ID가 없어 평가할 수 없습니다.");
      return;
    }
    const token = getCookieValue('accessToken');
    if (!token) {
      showMessage("로그인을 해주세요.", () => {
        router.push('/mypage');
      });
    } else {
      setSelectedEvalMenuId(menuId);
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

    const payload: SubmitPreVotePayload = {
      preVoteId: 0,
      userId: 0, 
      menuId: selectedMenu.menuId,
    };

    try {
      await submitPreVote(payload);
      showMessage(`'${menuTitle}' 메뉴 사전 투표가 완료되었습니다!`, () => {
        router.push('/');
      });
    } catch (error) {
      console.error("사전 투표 제출 실패:", error);
      showMessage("사전 투표 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGoToEvaluate = () => {
    if (selectedEvalMenuId) {
      router.push(`/review/${selectedEvalMenuId}`);
    } else {
      showMessage("먼저 평가할 메뉴를 선택해주세요!");
    }
  };

  return (
    <>
      {messageBoxVisible && (
        <div className="message-box-overlay visible" onClick={handleConfirm}>
          <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
            <p>{messageBoxText}</p>
            <button onClick={handleConfirm}>확인</button>
          </div>
        </div>
      )}

        {isLoading && <div className="text-center py-20 text-xl">메뉴 정보를 불러오는 중입니다...</div>}
        {error && <div className="text-center py-20 text-red-500">{error}</div>}
        
        {!isLoading && !error && activeSection === 'preVote' && (
          <div id="preVoteSection" className="py-16 md:py-24 px-4 section-gradient-blue text-white text-center">
            <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">오늘의 메뉴를 선택하세요!</h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">다양한 맛과 풍미를 자랑하는 오늘의 특별한 메뉴 중 당신의 선택은?</p>
              <DateNavigator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto w-full">
                {selectedDateMenu?.menu1 && (
                  <MenuCard menu={selectedDateMenu.menu1} title="오늘의 메뉴 1" isSelected={selectedPreVoteMenuType === 'menu1'} onSelect={() => handlePreVoteSelect('menu1')} />
                )}
                {selectedDateMenu?.menu2 && (
                  <MenuCard menu={selectedDateMenu.menu2} title="오늘의 메뉴 2" isSelected={selectedPreVoteMenuType === 'menu2'} onSelect={() => handlePreVoteSelect('menu2')} />
                )}
                {!selectedDateMenu?.menu1 && !selectedDateMenu?.menu2 && <NoMenuCard />}
              </div>
              <div className="mt-12">
                {selectedPreVoteMenuType && isToday && <button onClick={handlePreVoteSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-colors duration-300 text-xl">사전 투표 제출하기</button>}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && activeSection === 'evaluation' && (
          <div id="evaluationSection" className="py-8 md:py-24 px-4 section-gradient-sunset text-white text-center">
            <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">오늘의 싸밥</h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">맛있는 식사를 하셨나요? 오늘 드신 메뉴에 대한 소중한 의견을 남겨주세요.</p>
              <DateNavigator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto w-full">
                {selectedDateMenu?.menu1 && (
                  <MenuCard menu={selectedDateMenu.menu1} title="오늘의 메뉴 1" isSelected={selectedEvalMenuId === selectedDateMenu.menu1.menuId} onSelect={() => handleEvalSelect(selectedDateMenu.menu1.menuId)} />
                )}
                {selectedDateMenu?.menu2 && (
                  <MenuCard menu={selectedDateMenu.menu2} title="오늘의 메뉴 2" isSelected={selectedEvalMenuId === selectedDateMenu.menu2.menuId} onSelect={() => handleEvalSelect(selectedDateMenu.menu2.menuId)} />
                )}
                {!selectedDateMenu?.menu1 && !selectedDateMenu?.menu2 && <NoMenuCard />}
              </div>
              <div className="mt-12">
                {selectedEvalMenuId && isToday && <button onClick={handleGoToEvaluate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-colors duration-300 text-xl">평가하러 가기</button>}
              </div>
            </div>
          </div>
        )}
    </>
  );
}