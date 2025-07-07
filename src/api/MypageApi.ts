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
export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  // `SameSite=None; Secure;`는 크로스사이트 요청에 필수
  document.cookie = `${name}=${value}; Path=/; SameSite=None; Secure; Expires=${expires}`;
}

/**
 * 쿠키를 제거하는 함수
 * @param name 제거할 쿠키의 이름
 */
export function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure;`;
}

/**
 * Axios 인스턴스 생성 - 기본 설정 포함
 * MypageApi라는 이름으로 export default 하기 위해 이름을 변경
 */
const MypageApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/**
 * 요청 전 인터셉터 - accessToken, refreshToken을 헤더에 포함
 */
MypageApi.interceptors.request.use(config => {
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
  // 백엔드 DTO에 맞춰 재조정된 필드들
  email: string;
  provider: string;
  providerId: string;
  profileImage: string;
  name: string;
  username: string;
  ssafyYear: string; // `SignupRequestDTO`의 `ssafyYear`에 매핑
  classNum: string;  // `SignupRequestDTO`의 `classNum`에 매핑
  ssafyRegion: string;
  gender: 'M' | 'F';
  birthDate: string; //YYYY-MM-DD
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
    // 백엔드 로그인 엔드포인트로 리다이렉트 (콜백 URL은 백엔드가 처리)
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/login`;
  }
};

export interface SignupResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * 회원가입을 처리하는 함수
 * @param payload 회원가입 페이로드
 * @returns Promise<AxiosResponse<SignupResponseData>>
 */
export const signup = (payload: SignupPayload): Promise<AxiosResponse<SignupResponseData>> => {
  // 회원가입 API는 /account/signup으로 Post 요청
  return MypageApi.post('/account/signup', payload);
};

/**
 * 로그아웃을 처리하는 함수
 * @returns Promise<AxiosResponse<void>>
 */
export const logout = (): Promise<AxiosResponse<void>> =>
  MypageApi.post('/account/logout', null); // withCredentials는 Axios 인스턴스에 이미 설정됨

/**
 * 액세스 토큰을 재발급하는 함수
 * @returns Promise<{ accessToken: string; refreshToken: string }> 새 토큰 정보
 * @throws Error 리프레시 토큰이 없는 경우
 */
export const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const refreshToken = getCookieValue('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  // 리프레시 토큰은 요청 헤더에 자동으로 추가되므로, 바디에는 포함하지 않음 (백엔드 설계에 따라 다름)
  const { data } = await MypageApi.post('/account/refresh', {});

  // 새 토큰을 쿠키에 저장
  setCookie('accessToken', data.accessToken); // 백엔드 응답에 따라 key 조정 필요 (data.token.accessToken 또는 data.accessToken)
  setCookie('refreshToken', data.refreshToken); // 백엔드 응답에 따라 key 조정 필요

  return data; // 새로운 accessToken과 refreshToken을 포함한 객체 반환
};

/**
 * 사용자 정보를 조회하는 함수
 * @returns Promise<AxiosResponse<UserInfoData>>
 */
export const getAccountInfo = (): Promise<AxiosResponse<UserInfoData>> =>
  MypageApi.get('/account/info');

/**
 * 회원 정보를 수정하는 함수
 * @param payload 수정할 사용자 정보 페이로드
 * @returns Promise<AxiosResponse<unknown>>
 */
export const updateAccountInfo = (payload: UpdateUserInfoPayload): Promise<AxiosResponse<UpdateUserInfoPayload>> =>
  MypageApi.put('/account/update', payload);

/**
 * 사용자 이름 중복을 체크하는 함수
 * @param username 중복을 확인할 사용자 이름
 * @returns Promise<AxiosResponse<boolean>> true이면 존재, false이면 존재하지 않음
 */
export const checkUsernameExists = (username: string): Promise<AxiosResponse<boolean>> =>
  MypageApi.get(`/account/check-username?username=${username}`);


// 6. 소셜 (친구) API
/**
 * 친구 목록을 조회하는 함수
 * @returns Promise<AxiosResponse<{ friends: UserInfoData[] }>>
 */
export const getFriends = (): Promise<AxiosResponse<{ friends: UserInfoData[] }>> =>
  MypageApi.get('/friends');

/**
 * 친구를 추가하는 함수
 * @param username 추가할 친구의 사용자 이름
 * @returns Promise<AxiosResponse<unknown>>
 */
export const addFriend = (username: string): Promise<AxiosResponse<unknown>> =>
  MypageApi.post('/friends', { username });

/**
 * 친구를 삭제하는 함수
 * @param friendId 삭제할 친구의 ID
 * @returns Promise<AxiosResponse<void>>
 */
export const deleteFriend = (friendId: number): Promise<AxiosResponse<void>> =>
  MypageApi.delete(`/friends/${friendId}`);

// Axios 인스턴스를 MypageApi라는 이름으로 기본 export
export default MypageApi;