'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MonthlyAnalysisSection, { MonthlyAnalysisData } from '@/component/analysis/MonthlyAnalysisSection';
import PersonalAnalysisSection, { PersonalAnalysisData } from '@/component/analysis/PersonalAnalysisSection';
import MessageBox from '@/component/analysis/MessageBox';

// 쿠키에서 특정 키의 값을 가져오는 함수 (useAnalysisData 훅 내부에서 사용)
function getCookieValue(key: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

// useAnalysisData 훅 정의
interface UseAnalysisDataResult {
  monthlyData: MonthlyAnalysisData | null;
  personalData: PersonalAnalysisData | null;
  isLoading: boolean;
  error: string | null;
  fetchMonthlyAnalysisData: () => Promise<void>;
  fetchPersonalAnalysisData: () => Promise<void>;
  showMessage: (message: string) => void;
  hideMessage: () => void;
  messageBoxVisible: boolean;
  messageBoxText: string;
}

function useAnalysisData(): UseAnalysisDataResult {
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalysisData | null>(null);
  const [personalData, setPersonalData] = useState<PersonalAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');

  const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const showMessage = useCallback((message: string) => {
    setMessageBoxText(message);
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const hideMessage = useCallback(() => {
    setMessageBoxVisible(false);
    setMessageBoxText('');
    document.body.style.overflow = 'auto';
  }, []);

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
      showMessage('월간 분석 데이터를 가져오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_API_BASE_URL, showMessage]);

  const fetchPersonalAnalysisData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = getCookieValue('accessToken');
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
      const errorData = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 404 && errorData?.error === 'DataNotFound') {
            throw new Error('DataNotFound');
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
  }, [BACKEND_API_BASE_URL, showMessage]);

  return {
    monthlyData,
    personalData,
    isLoading,
    error,
    fetchMonthlyAnalysisData,
    fetchPersonalAnalysisData,
    showMessage,
    hideMessage,
    messageBoxVisible,
    messageBoxText,
  };
}


export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('monthly');
  const {
    monthlyData,
    personalData,
    isLoading,
    error,
    fetchMonthlyAnalysisData,
    fetchPersonalAnalysisData,
    hideMessage,
    messageBoxVisible,
    messageBoxText,
  } = useAnalysisData();

  // 탭 변경 시 데이터 로딩
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyAnalysisData();
    } else { // activeTab === 'personal'
      fetchPersonalAnalysisData();
    }
  }, [activeTab, fetchMonthlyAnalysisData, fetchPersonalAnalysisData]);

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

      <div className="section-gradient-yellow">
        <MessageBox isVisible={messageBoxVisible} message={messageBoxText} onClose={hideMessage} />

        <div id="analysisPageContent" className="py-16 md:py-24 px-4 text-white text-center">
          <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">
              오늘의 메뉴 데이터 분석
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow">
              맛있는 식사를 하셨나요? 오늘 드신 메뉴에 대한 소중한 의견을 남겨주세요.
            </p>

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

            <div id="analysisContent" className="w-full">
              {isLoading && <p className="text-gray-800 text-xl">데이터를 로드 중입니다...</p>}
              {error && <p className="text-red-600 text-xl">{error}</p>}
              {!isLoading && !error && (
                activeTab === 'monthly' ? <MonthlyAnalysisSection data={monthlyData} /> : <PersonalAnalysisSection data={personalData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}