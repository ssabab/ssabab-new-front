'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookieValue } from '@/api/MypageApi';
import { isLoggedIn } from '@/utils/auth';  // 새로운 간단한 함수 사용
import MonthlyAnalysis from '@/component/analysis/MonthlyAnalysis'; // 월간 분석 컴포넌트 임포트
import PersonalAnalysis from '@/component/analysis/PersonalAnalysis'; // 개인 분석 컴포넌트 임포트

// =================================================================
// 월간 분석 (Monthly Analysis) 관련 타입
// =================================================================

/** (공용) Top/Worst 음식 DTO */
export interface TopFood {
  name: string;
  reviews: number;
  rating: number;
}

/** 월간 방문자 DTO */
export interface MonthlyVisitors {
  current: number;
  previous: number;
  totalCumulative: number;
  previousMonthCumulative: number;
}

/** 누적 평가 DTO */
export interface CumulativeEvaluations {
  currentMonth: number;
  totalCumulative: number;
  previousMonthCumulative: number;
}

/** 평점 분포 DTO */
export interface RatingDistribution {
  min: number;
  max: number;
  avg: number;
  iqrStart: number;
  iqrEnd: number;
  variance: number;
  stdDev: number;
}

/** 자주 방문한 사용자 DTO */
export interface FrequentVisitor {
  name: string;
  visits: number;
  lastVisit: string;
}

/** 월간 전체 평점 DTO */
export interface MonthlyOverallRating {
  average: number;
  totalEvaluations: number;
}

/** 월간 분석 전체 응답 데이터 타입 */
export interface MonthlyAnalysisData {
  topFoods: TopFood[];
  worstFoods: TopFood[];
  monthlyVisitors: MonthlyVisitors;
  cumulativeEvaluations: CumulativeEvaluations;
  ratingDistribution: RatingDistribution;
  frequentVisitors: FrequentVisitor[];
  monthlyOverallRating: MonthlyOverallRating;
}


// =================================================================
// 개인 분석 (Personal Analysis) 관련 타입
// =================================================================

/** 개인 평점 요약 DTO (dm_user_summary) */
export interface RatingData {
  userId: number;
  avgScore: number;
  totalReviews: number;
  preVoteCount: number;
}

/** 개인 음식 평점 순위 DTO (dm_user_food_rating_rank) */
export interface FoodRatingRank {
  userId: number;
  foodName: string;
  foodScore: number;
  rankOrder: number;
  scoreType: 'best' | 'worst';
}

/** 개인 카테고리 통계 DTO (dm_user_category_stats) */
export interface CategoryStats {
  userId: number;
  category: string;
  count: number;
}

/** 개인 태그 통계 DTO (dm_user_tag_stats) */
export interface TagStats {
  userId: number;
  tag: string;
  count: number;
}

/** 개인 리뷰 키워드 DTO (dm_user_review_word) */
export interface ReviewWord {
  userId: number;
  word: string;
  count: number;
}

/** 개인 식습관 인사이트 DTO (dm_user_insight) */
export interface UserInsight {
  userId: number;
  insight: string | null; // 백엔드에서 null일 수 있음
}

/** 개인-그룹 비교 DTO (dm_user_group_comparison) */
export interface UserGroupComparison {
  userId: number;
  groupType: string;
  userAvgScore: number | null;
  userDiversityScore: number | null;
  groupAvgScore: number | null;
  groupDiversityScore: number | null;
}

/** 개인 분석 전체 응답 데이터 타입 */
export interface PersonalAnalysisData {
  dm_user_summary: RatingData;
  dm_user_food_rating_rank_best: FoodRatingRank[];
  dm_user_food_rating_rank_worst: FoodRatingRank[];
  dm_user_category_stats: CategoryStats[];
  dm_user_tag_stats: TagStats[];
  dm_user_review_word: ReviewWord[];
  dm_user_insight: UserInsight;
  dm_user_group_comparison: UserGroupComparison;
}


export default function AnalysisPage() {
  const router = useRouter();
  
  // 🎯 간단한 로그인 상태 확인
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // 활성 탭 상태 관리: 'monthly' 또는 'personal'
  const [activeTab, setActiveTab] = useState('monthly');
  // 메시지 박스 상태 관리
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');

  // API 데이터 상태 관리
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalysisData | null>(null);
  const [personalData, setPersonalData] = useState<PersonalAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드 API 기본 URL (환경 변수 또는 기본값)
  const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  // 🚀 인증 상태 확인 - 매우 간단!
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isLoggedIn();
      setIsAuthenticated(authenticated);
      setIsAuthChecked(true);
    };
    
    checkAuth();
  }, []);

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

  // API 호출 함수: 월간 분석 데이터
  const fetchMonthlyAnalysisData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/analysis/monthly`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MonthlyAnalysisData = await response.json();
      setMonthlyData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError('월간 분석 데이터를 가져오는 데 실패했습니다: ' + message);
      showMessage('월간 분석 데이터를 가져오는 데 실패했습니다: ' + message);
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_API_BASE_URL]);

  // API 호출 함수: 개인 분석 데이터
  const fetchPersonalAnalysisData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = getCookieValue('accessToken'); // 쿠키에서 Access Token을 가져옵니다.
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${BACKEND_API_BASE_URL}/api/analysis/personal`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 401) {
        throw new Error('인증되지 않았습니다. 다시 로그인해주세요.');
      }
      const errorData = await response.json().catch(() => null); // JSON 파싱 실패를 대비
      if (!response.ok) {
        // 응답 본문을 확인하여 "DataNotFound" 에러인지 확인합니다.
        if (response.status === 404 && errorData?.error === 'DataNotFound') {
            throw new Error('DataNotFound'); // 특별한 에러 타입으로 던집니다.
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PersonalAnalysisData = errorData;
      setPersonalData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === 'DataNotFound') {
        setError('아직 데이터가 수집되지 않았습니다.');
      } else {
        setError('개인 분석 데이터를 가져오는 데 실패했습니다: ' + message);
        showMessage('개인 분석 데이터를 가져오는 데 실패했습니다: ' + message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_API_BASE_URL]);

  // 🎯 개인 분석 탭 클릭 시 인증 확인 - 간단해졌습니다!
  const handleTabChange = (tab: string) => {
    if (tab === 'personal') {
      if (!isAuthChecked) {
        showMessage('인증 상태를 확인하고 있습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      if (!isAuthenticated) {
        showMessage('개인 분석을 보려면 로그인이 필요합니다.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
    }
    setActiveTab(tab);
  };

  // 탭 변경 시 데이터 로딩
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyAnalysisData();
    } else if (activeTab === 'personal') {
      // 개인 분석은 인증된 사용자만 접근 가능
      if (isAuthChecked && isAuthenticated) {
        fetchPersonalAnalysisData();
      }
    }
  }, [activeTab, isAuthChecked, isAuthenticated, fetchMonthlyAnalysisData, fetchPersonalAnalysisData]);


  return (
    <>
      <style jsx global>{`
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

      <div className="min-h-screen section-gradient-yellow">
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
              SSABAB 데이터 분석
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
                onClick={() => handleTabChange('monthly')}
              >
                월간 분석
              </button>
              <button
                type="button"
                id="personalAnalysisBtn"
                className={`tab-button py-3 px-8 rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex-1 ${activeTab === 'personal' ? 'selected' : ''}`}
                onClick={() => handleTabChange('personal')}
              >
                개인 분석
              </button>
            </div>

            {/* Analysis Content Area */}
            <div id="analysisContent" className="w-full">
              {isLoading && <p className="text-gray-800 text-xl">데이터를 로드 중입니다...</p>}
              {error && <p className="text-red-600 text-xl">{error}</p>}
              {!isLoading && !error && (
                activeTab === 'monthly' ? (
                  <MonthlyAnalysis data={monthlyData} />
                ) : (
                  <PersonalAnalysis data={personalData} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
