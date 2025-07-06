// src/app/review/page.tsx
'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect } from 'react';
// Next.js에서 페이지 간 이동을 위해 'next/link' 컴포넌트를 사용하는 것이 일반적입니다.
// <a href="..."> 대신 <Link href="...">를 사용하는 것을 권장합니다.
// import Link from 'next/link';

export default function ReviewPage() {
  // --- 상태 관리 ---
  // 현재 활성 섹션: 'preVote' 또는 'evaluation'
  const [activeSection, setActiveSection] = useState<'preVote' | 'evaluation' | null>(null);
  // 사전 투표 섹션의 선택된 메뉴 타입 ('korean' 또는 'western')
  const [selectedPreVoteMenuType, setSelectedPreVoteMenuType] = useState<string | null>(null);
  // 평가 섹션의 선택된 메뉴 타입 ('menu1' 또는 'menu2')
  const [selectedEvalMenuType, setSelectedEvalMenuType] = useState<string | null>(null);
  // 메시지 박스 가시성
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  // 메시지 박스 텍스트
  const [messageBoxText, setMessageBoxText] = useState('');
  // 메시지 박스 확인 콜백 함수
  const [messageBoxOkCallback, setMessageBoxOkCallback] = useState<(() => void) | null>(null);

  // --- 메시지 박스 함수 ---
  const showMessage = (message: string, onOkCallback: (() => void) | null = null) => {
    setMessageBoxText(message);
    setMessageBoxOkCallback(() => onOkCallback); // 콜백 함수를 상태에 저장
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden'; // 본문 스크롤 방지
  };

  const hideMessage = () => {
    setMessageBoxVisible(false);
    setMessageBoxText('');
    setMessageBoxOkCallback(null);
    document.body.style.overflow = 'auto'; // 본문 스크롤 허용
  };

  // --- 섹션 제어 함수 ---
  const hideAllSections = () => {
    setActiveSection(null);
    setSelectedPreVoteMenuType(null);
    setSelectedEvalMenuType(null);
  };

  // --- 초기 로드 시 섹션 결정 (클라이언트 측에서만 실행) ---
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) { // 오전 (12시 미만)
      setActiveSection('preVote');
    } else { // 오후 (12시 이상)
      setActiveSection('evaluation');
    }
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  // --- 사전 투표 섹션 핸들러 ---
  const handlePreVoteMenuSelect = (menuType: string) => {
    setSelectedPreVoteMenuType(menuType);
  };

  const handlePreVoteSubmit = () => {
    if (selectedPreVoteMenuType) {
      showMessage(
        `선택하신 ${selectedPreVoteMenuType === 'korean' ? '한식' : '양식'} 메뉴에 대한 사전 투표가 완료되었습니다!`,
        () => {
          // 메시지 확인 후 main 페이지로 이동
          window.location.href = '/main';
        }
      );
    } else {
      showMessage("먼저 메뉴를 선택해주세요!");
    }
  };

  // --- 평가 섹션 핸들러 ---
  const handleEvalMenuSelect = (menuType: string) => {
    setSelectedEvalMenuType(menuType);
  };

  const handleEvalGoToEvaluate = () => {
    if (selectedEvalMenuType) {
      // 선택된 메뉴 ID에 따라 상세 평가 페이지로 이동 (Next.js 경로에 맞게 수정)
      window.location.href = `/review/${selectedEvalMenuType === 'menu1' ? '1' : '2'}`;
    } else {
      showMessage("먼저 메뉴를 선택해주세요!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/*
        Tailwind CSS CDN 로딩과 폰트 임포트는 Next.js 프로젝트의 'src/app/layout.tsx'
        또는 'src/app/globals.css'에서 전역적으로 처리하는 것이 일반적입니다.
        여기서는 데모를 위해 직접 포함했지만, 실제 프로젝트에서는 옮기는 것을 권장합니다.
      */}
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          background-color: #ffffff; /* 배경색 유지 */
          overflow-x: hidden; /* 가로 스크롤 방지 */
          overflow-y: auto; /* 세로 스크롤 허용 */
        }
        /* More Vibrant Pastel Blue Gradient (사전 투표 섹션) */
        .section-gradient-blue {
            background: linear-gradient(to right, #87CEEB, #ADD8E6); /* Sky Blue to Light Blue */
        }
        /* Sunset Gradient (평가 섹션) */
        .section-gradient-sunset {
            background: linear-gradient(to right, #FF7E5F, #FEB47B); /* Sunset Orange to Peach */
        }
        /* More Vibrant Pastel Orange/Pink Gradient (메인 콘텐츠 양식 섹션) */
        .section-gradient-gold {
            background: linear-gradient(to right, #FFDAB9, #FFC0CB); /* Peach Puff to Pink */
        }
        .text-shadow {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 효과를 더 부드럽게 */
        }
        /* 추가적인 스타일 (선택된 카드 강조) */
        .menu-card.selected {
            border: 4px solid #FF8C42; /* 기존 하이라이팅 색상 (기본값) */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        /* 사전 투표 섹션 내 선택된 카드 강조 (더 짙은 푸른색) */
        #preVoteSection .menu-card.selected {
            border: 4px solid #347BBF; /* 배경과 어울리는 짙은 푸른색 */
        }

        /* 평가 섹션 내 선택된 카드 강조 (더 짙은 노을색) */
        #evaluationSection .menu-card.selected {
            border: 4px solid #CC4444; /* 배경과 어울리는 짙은 노을색 (붉은 계열) */
        }
        
        /* 메뉴 리스트 스타일 */
        .menu-list {
            list-style: none; /* 기본 리스트 스타일 제거 */
            padding: 0;
            margin-top: 1rem;
            text-align: left; /* 텍스트 왼쪽 정렬 */
            width: 100%; /* 부모 너비에 맞춤 */
        }
        .menu-list li {
            background-color: #f5f8fa; /* 더 부드러운 배경색 (거의 흰색) */
            color: #4a5568; /* 텍스트 색상 조정 */
            padding: 0.5rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
        }

        /* 커스텀 메시지 박스 스타일 */
        .message-box-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .message-box-overlay.visible {
            opacity: 1;
            visibility: visible;
        }
        .message-box-content {
            background-color: #fff;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
            transform: scale(0.95);
            transition: transform 0.3s ease;
        }
        .message-box-overlay.visible .message-box-content {
            transform: scale(1);
        }
        .message-box-content p {
            font-size: 1.25rem;
            color: #333;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }
        .message-box-content button {
            background-color: #4CAF50;
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            transition: background-color 0.2s ease;
        }
        .message-box-content button:hover {
            background-color: #45a049;
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />

      {/* Custom Message Box */}
      <div id="messageBoxOverlay" className={`message-box-overlay ${messageBoxVisible ? 'visible' : ''}`} onClick={() => { hideMessage(); if (messageBoxOkCallback) messageBoxOkCallback(); }}>
        <div className="message-box-content">
          <p id="messageBoxText">{messageBoxText}</p>
          <button id="messageBoxOkButton" onClick={() => { hideMessage(); if (messageBoxOkCallback) messageBoxOkCallback(); }}>확인</button>
        </div>
      </div>

      {/* Header Section */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="/main" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</a>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/main" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">홈</a></li>
              <li><a href="/review" className="text-blue-600 font-bold rounded-lg">평가하기</a></li>
              <li><a href="/analysis" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">분석보기</a></li>
              <li><a href="/my" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">마이페이지</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* 사전 투표 섹션 */}
        {activeSection === 'preVote' && (
          <div id="preVoteSection" className="py-16 md:py-24 px-4 section-gradient-blue text-white text-center">
            <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">오늘의 메뉴를 선택하세요!</h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                다양한 맛과 풍미를 자랑하는 오늘의 특별한 메뉴 중 당신의 선택은?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto w-full">
                <div
                  id="preVoteMenuOption1"
                  className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center ${selectedPreVoteMenuType === 'korean' ? 'selected' : ''}`}
                  data-menu="korean"
                  onClick={() => handlePreVoteMenuSelect('korean')}
                >
                  <h3 className="text-3xl font-bold mb-4 text-center">오늘의 한식 메뉴</h3>
                  <ul className="menu-list w-full">
                    <li>불고기</li>
                    <li>비빔밥</li>
                    <li>김치찌개</li>
                    <li>제육볶음</li>
                    <li>순두부찌개</li>
                    <li>삼겹살</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4">
                    전통의 맛과 든든함을 선사하는 한식의 정수.
                  </p>
                </div>

                <div
                  id="preVoteMenuOption2"
                  className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center ${selectedPreVoteMenuType === 'western' ? 'selected' : ''}`}
                  data-menu="western"
                  onClick={() => handlePreVoteMenuSelect('western')}
                >
                  <h3 className="text-3xl font-bold mb-4 text-center">오늘의 양식 메뉴</h3>
                  <ul className="menu-list w-full">
                    <li>스테이크</li>
                    <li>파스타</li>
                    <li>피자</li>
                    <li>샐러드</li>
                    <li>햄버거</li>
                    <li>수프</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4">
                    이국적인 풍미와 세련된 맛의 조화, 양식의 매력.
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <button
                  id="preVoteSubmitButton"
                  className={`bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-colors duration-300 text-xl ${selectedPreVoteMenuType ? '' : 'hidden'}`}
                  onClick={handlePreVoteSubmit}
                >
                  사전 투표 제출하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 평가 섹션 */}
        {activeSection === 'evaluation' && (
          <div id="evaluationSection" className="py-16 md:py-24 px-4 section-gradient-sunset text-white text-center">
            <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">오늘의 메뉴를 평가해주세요!</h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                맛있는 식사를 하셨나요? 오늘 드신 메뉴에 대한 소중한 의견을 남겨주세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto w-full">
                <div
                  id="evalMenuOption1"
                  className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center ${selectedEvalMenuType === 'menu1' ? 'selected' : ''}`}
                  data-menu="menu1"
                  onClick={() => handleEvalMenuSelect('menu1')}
                >
                  <h3 className="text-3xl font-bold mb-4 text-center">오늘의 메뉴 1</h3>
                  <ul className="menu-list w-full">
                    <li>불고기 (주메뉴)</li>
                    <li>된장찌개 (서브메뉴)</li>
                    <li>김치 (반찬)</li>
                    <li>콩나물무침 (반찬)</li>
                    <li>시금치나물 (반찬)</li>
                    <li>어묵볶음 (반찬)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4">
                    전통의 맛과 든든함을 선사하는 한식의 정수.
                  </p>
                </div>

                <div
                  id="evalMenuOption2"
                  className={`menu-card bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center ${selectedEvalMenuType === 'menu2' ? 'selected' : ''}`}
                  data-menu="menu2"
                  onClick={() => handleEvalMenuSelect('menu2')}
                >
                  <h3 className="text-3xl font-bold mb-4 text-center">오늘의 메뉴 2</h3>
                  <ul className="menu-list w-full">
                    <li>스테이크 (주메뉴)</li>
                    <li>양송이 수프 (서브메뉴)</li>
                    <li>샐러드 (반찬)</li>
                    <li>매쉬드 포테이토 (반찬)</li>
                    <li>구운 아스파라거스 (반찬)</li>
                    <li>빵 (반찬)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4">
                    이국적인 풍미와 세련된 맛의 조화, 양식의 매력.
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <button
                  id="evalGoToEvaluateButton"
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-colors duration-300 text-xl ${selectedEvalMenuType ? '' : 'hidden'}`}
                  onClick={handleEvalGoToEvaluate}
                >
                  평가하러 가기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 테스트용 버튼 (실제 배포 시 제거) */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          <button
            id="togglePreVoteSectionBtn"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
            onClick={() => { hideAllSections(); setActiveSection('preVote'); }}
          >
            사전 투표 섹션 보기
          </button>
          <button
            id="toggleEvaluationSectionBtn"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
            onClick={() => { hideAllSections(); setActiveSection('evaluation'); }}
          >
            평가 섹션 보기
          </button>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 오늘의 메뉴. 모든 권리 보유.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-white rounded-lg">개인정보처리방침</a>
            <a href="#" className="text-gray-400 hover:text-white rounded-lg">이용약관</a>
            <a href="#" className="text-gray-400 hover:text-white rounded-lg">문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
