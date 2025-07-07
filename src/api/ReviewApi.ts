import axios from 'axios';
import type { DailyMenu } from '@/store/MenuStore';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Axios 인스턴스 생성
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
  withCredentials: true,
});

// Axios 요청 인터셉터: 모든 요청에 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getCookieValue('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 주간 메뉴 데이터를 가져오는 API
 * @returns Promise<{ weeklyMenus: DailyMenu[] }>
 */
export const getWeeklyMenu = async (): Promise<{ weeklyMenus: DailyMenu[] }> => {
  const response = await api.get('/api/menu/weekly');
  return response.data;
};

// --- Interfaces for submission ---
export interface FoodReviewPayload {
  foodId: number;
  foodScore: number;
}

export interface SubmitFoodReviewsPayload {
  menuId: number;
  reviews: FoodReviewPayload[];
}

export interface SubmitMenuReviewPayload {
  menuId: number;
  menuRegret: boolean;
  menuComment: string;
  menuScore: number;
}
export interface ApiResponse {
  message: string;
}

/**
 * 개별 음식 별점을 제출하는 API
 * @param payload 음식 리뷰 페이로드
 */
export const submitFoodReviews = async (payload: SubmitFoodReviewsPayload): Promise<ApiResponse> => {
  const response = await api.post('/api/review/food', payload);
  return response.data;
};

/**
 * 메뉴 전체 리뷰(후회 여부, 코멘트 등)를 제출하는 API
 * @param payload 메뉴 리뷰 페이로드
 */
export const submitMenuReview = async (payload: SubmitMenuReviewPayload): Promise<ApiResponse> => {
  const response = await api.post('/api/review/menu', payload);
  return response.data;
};

// --- Interface for Pre-vote submission ---
export interface SubmitPreVotePayload {
  preVoteId: number;
  userId: number;
  menuId: number;
}

/**
 * 사전 투표 데이터를 제출하는 API
 * @param payload 사전 투표 페이로드
 */
export const submitPreVote = async (payload: SubmitPreVotePayload): Promise<ApiResponse > => {
  const response = await api.post('/api/vote', payload);
  return response.data;
};

export const checkPreVoteStatus = async (date: string): Promise<{ menuId: number | null }> => {
  const token = getCookieValue('accessToken');
  if (!token) return { menuId: null };

  const response = await fetch(`${API_BASE_URL}/api/vote?date=${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { menuId: null };
    }
    console.error('사전 투표 상태 확인 실패:', response);
    return { menuId: null };
  }
  return response.json();
};

export const checkEvaluationStatus = async (date: string): Promise<{ menuId: number | null }> => {
  const token = getCookieValue('accessToken');
  if (!token) return { menuId: null };
  
  const response = await fetch(`${API_BASE_URL}/api/review/menu?date=${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { menuId: null };
    }
    console.error('평가 상태 확인 실패:', response);
    return { menuId: null };
  }
  return response.json();
};