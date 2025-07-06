// src/store/AuthStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import api, { refreshAccessToken, getAccountInfo, updateAccountInfo, UserInfoData, UpdateUserInfoPayload } from '@/api/MypageApi';

// ──────────── Types ─────────────────────────────────────────────────

export type AuthUser = UserInfoData | null;

interface AuthStoreState {
  clearAuth: () => void;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;

  // 액션
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string) => void;
  clearRefreshToken: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, nickname: string) => Promise<void>;
  handleSocialLogin: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  checkAuthStatus: () => boolean;
  fetchUserInfo: () => Promise<void>;
  updateUserInformation: (payload: UpdateUserInfoPayload) => Promise<void>;
}

// ──────────── Utility Functions ─────────────────────────────────────────

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const setCookie = (name: string, value: string, minutes: number = 30) => {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; expires=${expires}`;
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

// URL 파라미터에서 토큰을 추출하는 함수 추가
const getTokensFromUrl = (): { accessToken: string | null; refreshToken: string | null } => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };

  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');

  // URL에서 토큰을 추출한 후에는 URL에서 제거하여 보안 및 깔끔한 URL 유지
  if (accessToken || refreshToken) {
    params.delete('accessToken');
    params.delete('refreshToken');
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  return { accessToken, refreshToken };
};


// ──────────── Store ─────────────────────────────────────────────────

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      token: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAuthInitialized: false,
      refreshToken: null,

      // 액션
      setToken: (token) => {
        set({
          token,
          isAuthenticated: !!token,
        });

        if (token) {
          setCookie('accessToken', token);
        } else {
          removeCookie('accessToken');
        }
      },
      setRefreshToken: (token) => set({ refreshToken: token }),
      clearRefreshToken: () => set({ refreshToken: null }),

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/account/login', { username, password });
          const { accessToken, refreshToken, user: userData } = response.data;
          set({
            token: accessToken,
            refreshToken,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          setCookie('accessToken', accessToken);
          setCookie('refreshToken', refreshToken, 60 * 24 * 7); // 7 days
        } catch (error) {
          set({ isLoading: false });
          console.error('Login failed:', error);
          throw error;
        }
      },

      signup: async (username, password, nickname) => {
        set({ isLoading: true });
        try {
          await api.post('/account/signup', { username, password, nickname }); // 실제 MypageApi의 signup payload에 맞춰야 함
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Signup failed:', error);
          throw error;
        }
      },

      handleSocialLogin: (accessToken, refreshToken) => {
        try {
          const decoded = jwtDecode<{ sub: string; exp: number }>(accessToken);
          set({
            token: accessToken,
            refreshToken,
            // decoded.sub를 user.username으로 임시 설정.
            // 실제 UserInfoData 전체를 가져오려면 fetchUserInfo 호출 필요.
            user: { userId: -1, username: decoded.sub, classNum: '', email: '', provider: '', providerId: '', profileImage: '', name: decoded.sub, ssafyYear: '', ssafyRegion: '', gender: '', birthDate: '' },
            isAuthenticated: true,
          });
          setCookie('accessToken', accessToken);
          setCookie('refreshToken', refreshToken, 60 * 24 * 7); // 7 days
          get().fetchUserInfo(); // 소셜 로그인 후 바로 유저 정보 조회
        } catch (error) {
          console.error('Social login token handling error:', error);
          get().logout();
        }
      },

      logout: () => {
        removeCookie('accessToken');
        removeCookie('refreshToken');
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        api.post('/account/logout').catch((error) => {
          console.error('Logout API call failed:', error);
        });
      },

      clearAuth: () => {
        get().logout();
      },

      initializeAuth: async () => { // initializeAuth를 async로 변경
        if (get().isAuthInitialized) return;

        let currentToken = getCookieValue('accessToken');
        let currentRefreshToken = getCookieValue('refreshToken');

        // 1. URL 파라미터에서 토큰 확인 및 설정 (가장 높은 우선순위)
        const { accessToken: urlAccessToken, refreshToken: urlRefreshToken } = getTokensFromUrl();
        if (urlAccessToken && urlRefreshToken) {
          setCookie('accessToken', urlAccessToken);
          setCookie('refreshToken', urlRefreshToken, 60 * 24 * 7); // 7 days
          currentToken = urlAccessToken;
          currentRefreshToken = urlRefreshToken;
        }

        if (currentToken) {
          try {
            const decoded = jwtDecode<{ sub: string; exp: number }>(currentToken);
            if (Date.now() < decoded.exp * 1000) {
              set({
                token: currentToken,
                refreshToken: currentRefreshToken,
                user: { userId: -1, username: decoded.sub, classNum: '', email: '', provider: '', providerId: '', profileImage: '', name: decoded.sub, ssafyYear: '', ssafyRegion: '', gender: '', birthDate: '' },
                isAuthenticated: true,
              });
              await get().fetchUserInfo(); // 사용자 정보 조회 완료까지 기다림
            } else {
              // Token expired, try refreshing
              try {
                const newToken = await refreshAccessToken(); // await 추가
                const newDecoded = jwtDecode<{ sub: string; exp: number }>(newToken.accessToken);
                set({
                  token: newToken.accessToken,
                  refreshToken: newToken.refreshToken,
                  user: { userId: -1, username: newDecoded.sub, classNum: '', email: '', provider: '', providerId: '', profileImage: '', name: newDecoded.sub, ssafyYear: '', ssafyRegion: '', gender: '', birthDate: '' },
                  isAuthenticated: true,
                });
                await get().fetchUserInfo(); // 리프레시 후 사용자 정보 조회 완료까지 기다림
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                get().logout();
              }
            }
          } catch (error) {
            console.error('Token handling error:', error);
            get().logout();
          }
        }
        set({ isAuthInitialized: true }); // 인증 초기화 완료
      },

      checkAuthStatus: () => {
        const token = getCookieValue('accessToken');
        const isAuthenticated = !!token;

        set({
          token,
          isAuthenticated,
        });

        // 토큰이 유효한 경우 사용자 정보도 함께 조회 시도
        if (isAuthenticated && !get().user) {
          get().fetchUserInfo();
        }

        return isAuthenticated;
      },

      // 새로운 액션: 유저 정보 가져오기
      fetchUserInfo: async () => {
        set({ isLoading: true });
        try {
          const response = await getAccountInfo(); // MypageApi에서 임포트한 getAccountInfo 사용
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          set({ isLoading: false });
          throw error; // 에러 전파
        }
      },

      // 새로운 액션: 유저 정보 수정하기
      updateUserInformation: async (payload: UpdateUserInfoPayload) => {
        set({ isLoading: true });
        try {
          const response = await updateAccountInfo(payload); // MypageApi에서 임포트한 updateAccountInfo 사용
          if (get().user) {
            set({
              user: { ...get().user, ...payload, ...response.data }, // 응답 데이터도 병합 (서버 응답 형태에 따라 조정)
              isLoading: false,
            });
          } else {
            get().fetchUserInfo();
          }
        } catch (error) {
          console.error('Failed to update user info:', error);
          set({ isLoading: false });
          throw error; // 에러 전파
        }
      },
    }),
    {
      name: 'auth-store',
    }
  ),
);

// ──────────── Hooks ─────────────────────────────────────────────────

export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

  return { isAuthenticated, token, user, isAuthInitialized };
};

export const useAuthToken = () => {
  const token = useAuthStore((state) => state.token);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  return { token, hasToken: !!token, checkAuthStatus };
};
