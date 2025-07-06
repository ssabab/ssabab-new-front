// src/api/MypageApi.ts
import axios, { AxiosResponse } from 'axios';

/**
 * 쿠키에서 특정 키의 값을 가져오는 함수
 * @param key 가져올 쿠키의 키
 * @returns 쿠키 값 또는 undefined
 */
export function getCookieValue(key: string): string | undefined {
  if (typeof document === 'undefined') return;
  const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * 쿠키를 설정하는 함수
 * @param name 설정할 쿠키의 이름
 * @param value 설정할 쿠키의 값
 * @param days 쿠키 유효 기간 (일, 기본값 7일)
 */
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; Path=/; SameSite=None; Secure; Expires=${expires}`;
}

/**
 * Axios 인스턴스 생성 - 기본 설정 포함
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/**
 * 요청 전 인터셉터 - accessToken, refreshToken을 헤더에 포함
 */
api.interceptors.request.use(config => {
  const token = getCookieValue('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const refreshToken = getCookieValue('refreshToken');
  if (refreshToken) {
    config.headers['X-Refresh-Token'] = refreshToken;
  }
  return config;
});

// --- 인터페이스 정의 ---

/** 사용자 정보 데이터 인터페이스 */
export interface UserInfoData {
  userId: number;
  username: string;
  classNum: string;
  email: string;
  provider: string;
  providerId: string;
  profileImage: string;
  name: string;
  ssafyYear: string;
  ssafyRegion: string;
  gender: string;
  birthDate: string;
}

/** 회원가입 요청 페이로드 인터페이스 */
export interface SignupPayload {
  email: string;
  provider: string;
  providerId: string;
  profileImage: string;
  name: string;
  username: string;
  ssafyYear: string;
  classNum: string;
  ssafyRegion: string;
  gender: 'M' | 'F';
  birthDate: string; // YYYY-MM-DD
}

/** 회원 정보 수정 요청 페이로드 인터페이스 */
export interface UpdateUserInfoPayload {
  username?: string;
  classNum?: string;
  // 필요한 경우 다른 필드 추가
}

// --- API 함수 정의 ---

// 1. 인증 및 계정 관련 API
/**
 * 구글 로그인 리다이렉트 (프론트엔드에서 직접 호출)
 */
export const redirectToGoogleLogin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/login`;
  }
};

/**
 * 회원가입을 처리하는 함수
 * @param payload 회원가입 페이로드
 * @returns Promise<AxiosResponse<any>>
 */
export const signup = (payload: SignupPayload): Promise<AxiosResponse<any>> => {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/signup`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * 로그아웃을 처리하는 함수
 * @returns Promise<AxiosResponse<void>>
 */
export const logout = (): Promise<AxiosResponse<void>> =>
  api.post('/account/logout', null, { withCredentials: true });

/**
 * 액세스 토큰을 재발급하는 함수
 * @returns Promise<{ accessToken: string; refreshToken: string }> 새 토큰 정보
 * @throws Error 리프레시 토큰이 없는 경우
 */
export const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const refreshToken = getCookieValue('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await api.post('/account/refresh', { refreshToken });

  // 새 토큰을 쿠키에 저장
  setCookie('accessToken', data.token.accessToken);
  setCookie('refreshToken', data.token.refreshToken);

  return data.token;
};

/**
 * 사용자 정보를 조회하는 함수
 * @returns Promise<AxiosResponse<UserInfoData>>
 */
export const getAccountInfo = (): Promise<AxiosResponse<UserInfoData>> =>
  api.get('/account/info');

/**
 * 회원 정보를 수정하는 함수
 * @param payload 수정할 사용자 정보 페이로드
 * @returns Promise<AxiosResponse<any>>
 */
export const updateAccountInfo = (payload: UpdateUserInfoPayload): Promise<AxiosResponse<any>> =>
  api.put('/account/update', payload);

// 6. 소셜 (친구) API
/**
 * 친구 목록을 조회하는 함수
 * @returns Promise<AxiosResponse<{ friends: UserInfoData[] }>>
 */
export const getFriends = (): Promise<AxiosResponse<{ friends: UserInfoData[] }>> =>
  api.get('/friends');

/**
 * 친구를 추가하는 함수
 * @param username 추가할 친구의 사용자 이름
 * @returns Promise<AxiosResponse<any>>
 */
export const addFriend = (username: string): Promise<AxiosResponse<any>> =>
  api.post('/friends', { username });

/**
 * 친구를 삭제하는 함수
 * @param friendId 삭제할 친구의 ID
 * @returns Promise<AxiosResponse<void>>
 */
export const deleteFriend = (friendId: number): Promise<AxiosResponse<void>> =>
  api.delete(`/friends/${friendId}`);

// axios 인스턴스 기본 export (MypageApi만 사용할 경우 이 인스턴스를 통해 요청)
export default api;