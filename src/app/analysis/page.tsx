// src/app/analysis/page.tsx
'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect } from 'react';
// Next.js에서 페이지 간 이동을 위해 'next/link' 컴포넌트를 사용하는 것이 일반적입니다.
// <a href="..."> 대신 <Link href="...">를 사용하는 것을 권장합니다.
// import Link from 'next/link';

export default function AnalysisPage() {
  // 활성 탭 상태 관리: 'monthly' 또는 'personal'
  const [activeTab, setActiveTab] = useState('monthly');
  // 메시지 박스 상태 관리
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');

  // 더미 데이터 (실제 앱에서는 API 호출 등으로 데이터를 가져옵니다)
  const monthlyAnalysisData = {
    "topFoods": [
      { "name": "음식_7", "reviews": 1, "rating": 4 },
      { "name": "음식_6", "reviews": 1, "rating": 4 },
      { "name": "음식_9", "reviews": 1, "rating": 4 },
      { "name": "음식_5", "reviews": 1, "rating": 4 },
      { "name": "음식_1", "reviews": 1, "rating": 4 }
    ],
    "worstFoods": [
      { "name": "음식_8", "reviews": 1, "rating": 3 },
      { "name": "음식_2", "reviews": 1, "rating": 3 },
      { "name": "음식_7", "reviews": 1, "rating": 4 },
      { "name": "음식_6", "reviews": 1, "rating": 4 },
      { "name": "음식_9", "reviews": 1, "rating": 4 }
    ],
    "monthlyVisitors": {
      "current": 120,
      "previous": 100,
      "totalCumulative": 500,
      "previousMonthCumulative": 400
    },
    "cumulativeEvaluations": {
      "currentMonth": 80,
      "totalCumulative": 350,
      "previousMonthCumulative": 270
    },
    "ratingDistribution": {
      "min": 3,
      "max": 4,
      "avg": 3.83,
      "iqrStart": 4,
      "iqrEnd": 4,
      "variance": 0.15,
      "stdDev": 0.39
    },
    "frequentVisitors": [
      { "name": "김형석v4", "visits": 12, "lastVisit": "2025.06.19" },
      { "name": "이철수", "visits": 10, "lastVisit": "2025.06.18" },
      { "name": "박영희", "visits": 8, "lastVisit": "2025.06.17" }
    ],
    "monthlyOverallRating": {
      "average": 3.83,
      "totalEvaluations": 80
    }
  };

  const personalAnalysisData = {
    "dm_user_summary": {
      "userId": 9,
      "avgScore": 3.1111112,
      "totalReviews": 18,
      "preVoteCount": 3
    },
    "dm_user_food_rating_rank_best": [
      { "userId": 9, "foodName": "단무지", "foodScore": 5.0, "rankOrder": 1, "scoreType": "best" },
      { "userId": 9, "foodName": "갈비찜", "foodScore": 5.0, "rankOrder": 2, "scoreType": "best" },
      { "userId": 9, "foodName": "떡국", "foodScore": 5.0, "rankOrder": 3, "scoreType": "best" },
      { "userId": 9, "foodName": "콩나물무침", "foodScore": 4.5, "rankOrder": 4, "scoreType": "best" },
      { "userId": 9, "foodName": "김치찌개", "foodScore": 4.5, "rankOrder": 5, "scoreType": "best" }
    ],
    "dm_user_food_rating_rank_worst": [
      { "userId": 9, "foodName": "육개장", "foodScore": 1.0, "rankOrder": 1, "scoreType": "worst" },
      { "userId": 9, "foodName": "미역국", "foodScore": 1.0, "rankOrder": 2, "scoreType": "worst" },
      { "userId": 9, "foodName": "깍두기", "foodScore": 1.5, "rankOrder": 3, "scoreType": "worst" },
      { "userId": 9, "foodName": "떡갈비", "foodScore": 2.0, "rankOrder": 4, "scoreType": "worst" },
      { "userId": 9, "foodName": "김치전", "foodScore": 2.0, "rankOrder": 5, "scoreType": "worst" }
    ],
    "dm_user_category_stats": [
      { "userId": 9, "category": "한식", "count": 16 },
      { "userId": 9, "category": "중식", "count": 2 }
    ],
    "dm_user_tag_stats": [
      { "userId": 9, "tag": "고기", "count": 4 },
      { "userId": 9, "tag": "국", "count": 3 },
      { "userId": 9, "tag": "면", "count": 2 },
      { "userId": 9, "tag": "야채", "count": 4 },
      { "userId": 9, "tag": "기타", "count": 5 }
    ],
    "dm_user_review_word": [
      { "userId": 9, "word": "별로", "count": 1 },
      { "userId": 9, "word": "맛있다", "count": 1 },
      { "userId": 9, "word": "우웩", "count": 1 },
      { "userId": 9, "word": "기대하다", "count": 1 },
      { "userId": 9, "word": "도리", "count": 1 }
    ],
    "dm_user_insight": {
      "userId": 9,
      "insight": "- 사용자의 특징을 반영하는 단어와 문구를 사용해 최대한 자연스러운 표현을 사용하세요."
    },
    "dm_user_group_comparison": {
      "userId": 9,
      "groupType": "all",
      "userAvgScore": 3.1111112,
      "userDiversityScore": 2.0,
      "groupAvgScore": 3.0370371,
      "groupDiversityScore": 3.0
    }
  };

  // 메시지 박스 표시 함수
  const showMessage = (message: string) => {
    setMessageBoxText(message);
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  };

  // 메시지 박스 숨기기 함수
  const hideMessage = () => {
    setMessageBoxVisible(false);
    setMessageBoxText('');
    document.body.style.overflow = 'auto'; // 스크롤 허용
  };

  // 월간 분석 콘텐츠 렌더링 함수
  const renderMonthlyAnalysis = (data: typeof monthlyAnalysisData) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="analysis-card col-span-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">월간 통계 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800">
          <p><strong>이번 달 방문자:</strong> {data.monthlyVisitors.current}명 (지난 달 {data.monthlyVisitors.previous}명)</p>
          <p><strong>총 누적 방문자:</strong> {data.monthlyVisitors.totalCumulative}명</p>
          <p><strong>이번 달 평가 수:</strong> {data.cumulativeEvaluations.currentMonth}건</p>
          <p><strong>총 누적 평가 수:</strong> {data.cumulativeEvaluations.totalCumulative}건</p>
          <p><strong>월간 평균 별점:</strong> {data.monthlyOverallRating.average.toFixed(2)} / 5</p>
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">이번 달 TOP 5 음식</h2>
        <div className="space-y-3 text-gray-800">
          {data.topFoods.map((food, index) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.name}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-orange" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.rating}점 ({food.reviews}개 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">이번 달 WORST 5 음식</h2>
        <div className="space-y-3 text-gray-800">
          {data.worstFoods.map((food, index) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.name}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-yellow" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.rating}점 ({food.reviews}개 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card col-span-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">자주 방문한 사용자</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-800">
          {data.frequentVisitors.map((visitor, index) => (
            <li key={index}><strong>{visitor.name}</strong>: {visitor.visits}회 방문 (마지막 방문: {visitor.lastVisit})</li>
          ))}
        </ul>
      </div>
    </div>
  );

  // 개인 분석 콘텐츠 렌더링 함수
  const renderPersonalAnalysis = (data: typeof personalAnalysisData) => {
    const userSummary = data.dm_user_summary;
    const bestFoods = data.dm_user_food_rating_rank_best;
    const worstFoods = data.dm_user_food_rating_rank_worst;
    const categoryStats = data.dm_user_category_stats;
    const tagStats = data.dm_user_tag_stats;
    const reviewWords = data.dm_user_review_word;
    const insight = data.dm_user_insight;
    const groupComparison = data.dm_user_group_comparison;

    // Calculate max count for category and tag stats for scaling bars
    const maxCategoryCount = Math.max(...categoryStats.map(stat => stat.count));
    const maxTagCount = Math.max(...tagStats.map(stat => stat.count));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">내 리뷰 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800">
            <p><strong>평균 점수:</strong> {userSummary.avgScore.toFixed(2)} / 5</p>
            <p><strong>총 리뷰 수:</strong> {userSummary.totalReviews}건</p>
            <p><strong>사전 투표 수:</strong> {userSummary.preVoteCount}회</p>
          </div>
        </div>

        <div className="analysis-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">가장 좋아하는 음식 TOP 5</h2>
          <div className="space-y-3 text-gray-800">
            {bestFoods.map((food, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1/4 text-left font-medium">{food.foodName}</span>
                <div className="w-2/4 graph-bar-container">
                  <div className="graph-bar bar-blue" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{food.foodScore.toFixed(1)}점</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">가장 싫어하는 음식 WORST 5</h2>
          <div className="space-y-3 text-gray-800">
            {worstFoods.map((food, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1/4 text-left font-medium">{food.foodName}</span>
                <div className="w-2/4 graph-bar-container">
                  <div className="graph-bar bar-green" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{food.foodScore.toFixed(1)}점</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">카테고리별 리뷰 통계</h2>
          <div className="space-y-3 text-gray-800">
            {categoryStats.map((stat, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1/4 text-left font-medium">{stat.category}</span>
                <div className="w-2/4 graph-bar-container">
                  <div className="graph-bar bar-blue" style={{ width: `${(stat.count / maxCategoryCount) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{stat.count}회</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">태그별 리뷰 통계</h2>
          <div className="space-y-3 text-gray-800">
            {tagStats.map((stat, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1/4 text-left font-medium">{stat.tag}</span>
                <div className="w-2/4 graph-bar-container">
                  <div className="graph-bar bar-green" style={{ width: `${(stat.count / maxTagCount) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{stat.count}회</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">자주 사용한 리뷰 단어</h2>
          <ul className="list-disc list-inside space-y-2 text-lg flex flex-wrap gap-x-4 text-gray-800">
            {reviewWords.map((word, index) => (
              <li key={index}><strong>{word.word}</strong>: {word.count}회</li>
            ))}
          </ul>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">나의 식습관 인사이트</h2>
          <p className="text-lg text-gray-800">{insight.insight}</p>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">전체 사용자 그룹 비교</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800">
            <p><strong>내 평균 점수:</strong> {groupComparison.userAvgScore.toFixed(2)}</p>
            <p><strong>전체 그룹 평균 점수:</strong> {groupComparison.groupAvgScore.toFixed(2)}</p>
            <p><strong>내 다양성 점수:</strong> {groupComparison.userDiversityScore.toFixed(1)}</p>
            <p><strong>전체 그룹 다양성 점수:</strong> {groupComparison.groupDiversityScore.toFixed(1)}</p>
          </div>
        </div>
      </div>
    );
  };

  // 컴포넌트 마운트 시 초기 분석 데이터 렌더링
  useEffect(() => {
    // 초기 렌더링 시 메시지 박스를 숨깁니다 (HTML에서 기본적으로 숨겨져 있다고 가정)
    // showMessage("분석 데이터를 로드 중입니다..."); // 필요 시 로딩 메시지 표시
    // setTimeout(() => hideMessage(), 1000); // 1초 후 숨기기 (예시)
  }, []);

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
          background-color: #ffffff; /* 기본 배경색 */
          overflow-x: hidden; /* 가로 스크롤 방지 */
          overflow-y: auto; /* 세로 스크롤 허용 */
        }
        .section-gradient-yellow {
          background: linear-gradient(to bottom, #FFD700, #FFE066); /* 황금색에서 더 밝은 노란색으로 */
        }
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 효과를 더 부드럽게 */
        }
        /* 탭 버튼 스타일 */
        .tab-button {
            background-color: #f3f4f6; /* Light gray */
            color: #4b5563; /* Darker gray text */
            border: 1px solid #d1d5db; /* Gray border */
            transition: all 0.2s ease;
        }
        .tab-button.selected {
            background-color: #f97316; /* Orange-500 */
            color: white;
            border-color: #f97316;
            box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3); /* Orange shadow */
        }
        .tab-button:hover:not(.selected) {
            background-color: #e5e7eb; /* Lighter gray on hover */
        }

        /* 분석 카드 스타일 (흰색 배경 유지, 그림자 강화) */
        .analysis-card {
            background-color: #ffffff;
            border-radius: 0.75rem; /* rounded-xl */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* shadow-lg보다 강한 그림자 */
            padding: 1.5rem; /* p-6 */
            transition: transform 0.3s ease-in-out; /* 호버 효과 추가 */
        }
        .analysis-card:hover {
            transform: translateY(-5px); /* 호버 시 살짝 위로 이동 */
        }

        /* 그래프 바 스타일 */
        .graph-bar-container {
            width: 100%;
            background-color: #e5e7eb; /* Light gray background for the bar track */
            border-radius: 9999px; /* rounded-full */
            height: 1.25rem; /* h-5 */
            overflow: hidden;
        }
        .graph-bar {
            height: 100%;
            border-radius: 9999px; /* rounded-full */
            transition: width 0.5s ease-in-out;
        }
        .bar-orange { background-color: #f97316; /* Orange-500 */ }
        .bar-yellow { background-color: #fbbf24; /* Yellow-400 */ }
        .bar-blue { background-color: #3b82f6; /* Blue-500 */ }
        .bar-green { background-color: #10b981; /* Green-600 */ }
        
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
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />

      {/* Header Section */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="/main" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</a>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/main" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">홈</a></li>
              <li><a href="/review" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">평가하기</a></li>
              <li><a href="/analysis" className="text-blue-600 font-bold rounded-lg">분석보기</a></li>
              <li><a href="/mypage" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">마이페이지</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow section-gradient-yellow">
        {/* Custom Message Box */}
        <div id="messageBoxOverlay" className={`message-box-overlay ${messageBoxVisible ? 'visible' : ''}`} onClick={hideMessage}>
          <div className="message-box-content">
            <p id="messageBoxText">{messageBoxText}</p>
          </div>
        </div>

        {/* Main Content: Analysis Page */}
        <div id="analysisPageContent" className="py-16 md:py-24 px-4 text-white text-center">
          <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">
              오늘의 메뉴 데이터 분석
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow">
              맛있는 식사를 하셨나요? 오늘 드신 메뉴에 대한 소중한 의견을 남겨주세요.
            </p>

            {/* Tab Buttons for Monthly and Personal Analysis */}
            <div className="flex justify-center mb-10 space-x-4 w-full max-w-2xl">
              <button
                type="button"
                id="monthlyAnalysisBtn"
                className={`tab-button py-3 px-8 rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex-1 ${activeTab === 'monthly' ? 'selected' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                월간 분석
              </button>
              <button
                type="button"
                id="personalAnalysisBtn"
                className={`tab-button py-3 px-8 rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex-1 ${activeTab === 'personal' ? 'selected' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                개인 분석
              </button>
            </div>

            {/* Analysis Content Area */}
            <div id="analysisContent" className="w-full">
              {activeTab === 'monthly' ? renderMonthlyAnalysis(monthlyAnalysisData) : renderPersonalAnalysis(personalAnalysisData)}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
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
