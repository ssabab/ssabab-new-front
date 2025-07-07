// src/store/AuthStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import api, {
    refreshAccessToken,
    getAccountInfo,
    updateAccountInfo,
    UserInfoData,
    UpdateUserInfoPayload,
    signup as apiSignup,
    SignupPayload,
    getCookieValue,
    setCookie,
    removeCookie,
} from '@/api/MypageApi';

// ──────────── Types ─────────────────────────────────────────────────

// UserInfoData에 isNewUser 필드 추가 (선택 사항이며, 백엔드 로직에 따라 조절)
// 백엔드에서 초기 소셜 로그인 시 isNewUser 필드를 내려주면 더 명확합니다.
// 여기서는 편의상 ssafyYear나 classNum이 없으면 isNewUser로 간주하는 로직을 mypage에서 사용합니다.
export type AuthUser = (UserInfoData & { isNewUser?: boolean }) | null;

interface AuthStoreState {
    clearAuth: () => void;
    token: string | null;
    refreshToken: string | null;
    user: AuthUser;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAuthInitialized: boolean;
    // 소셜 로그인 후 임시로 URL에서 받은 사용자 정보 저장 (회원가입 폼 초기화용)
    socialLoginTempData: {
        email?: string;
        provider?: string;
        providerId?: string;
        profileImage?: string;
        name?: string;
        username?: string; // name과 username이 다를 수 있으므로 추가
        ssafyRegion?: string; // 추가된 부분
    } | null;

    // 액션
    setToken: (token: string | null) => void;
    setRefreshToken: (token: string) => void;
    clearRefreshToken: () => void;
    setUser: (user: AuthUser) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    initializeAuth: () => void;
    checkAuthStatus: () => boolean;
    fetchUserInfo: () => Promise<void>;
    updateUserInformation: (payload: UpdateUserInfoPayload) => Promise<void>;
    signup: (payload: SignupPayload) => Promise<void>; // 회원가입 액션 추가
}

// ──────────── Utility Functions ─────────────────────────────────────────

// MypageApi.ts에 있는 getCookieValue, setCookie, removeCookie와 동일한 함수.
// AuthStore 내부에서만 사용된다면 여기에 정의해도 무방하지만,
// 중복을 피하고 MypageApi.ts에서 가져다 쓰는 것이 좋습니다.
// 여기서는 일관성을 위해 MypageApi.ts의 것을 사용하도록 하겠습니다.


// URL 파라미터에서 토큰 및 소셜 로그인 정보 추출 함수 수정
const getUrlAuthParams = (): {
    accessToken: string | null;
    refreshToken: string | null;
    socialData: {
        email?: string;
        provider?: string;
        providerId?: string;
        profileImage?: string;
        name?: string;
        username?: string;
        ssafyRegion?: string;
    } | null;
} => {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, socialData: null };

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const socialData: {
        email?: string;
        provider?: string;
        providerId?: string;
        profileImage?: string;
        name?: string;
        username?: string;
        ssafyRegion?: string;
    } = {};

    // 소셜 로그인 관련 추가 정보 파싱
    if (params.has('email')) socialData.email = params.get('email') || undefined;
    if (params.has('provider')) socialData.provider = params.get('provider') || undefined;
    if (params.has('providerId')) socialData.providerId = params.get('providerId') || undefined;
    if (params.has('profileImage')) socialData.profileImage = params.get('profileImage') || undefined;
    if (params.has('name')) socialData.name = params.get('name') || undefined;
    if (params.has('username')) socialData.username = params.get('username') || undefined;
    if (params.has('ssafyRegion')) socialData.ssafyRegion = params.get('ssafyRegion') || undefined;


    // URL에서 토큰 및 소셜 정보 추출한 후에는 URL에서 제거하여 보안 및 깔끔한 URL 유지
    if (accessToken || refreshToken || Object.keys(socialData).length > 0) {
        // 모든 관련 파라미터 삭제
        params.delete('accessToken');
        params.delete('refreshToken');
        params.delete('email');
        params.delete('provider');
        params.delete('providerId');
        params.delete('profileImage');
        params.delete('name');
        params.delete('username');
        params.delete('ssafyRegion');

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, newUrl);
    }

    return { accessToken, refreshToken, socialData: Object.keys(socialData).length > 0 ? socialData : null };
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
            socialLoginTempData: null, // 초기값 설정

            // 액션
            setToken: (token) => {
                set({
                    token,
                    isAuthenticated: !!token,
                });

                if (token) {
                    setCookie('accessToken', token); // 7일 (MypageApi 기본값)
                } else {
                    removeCookie('accessToken');
                }
            },
            setRefreshToken: (token) => {
                set({ refreshToken: token });
                setCookie('refreshToken', token, 60 * 24 * 7); // 7 days
            },
            clearRefreshToken: () => {
                set({ refreshToken: null });
                removeCookie('refreshToken');
            },

            setUser: (user) => set({ user }),

            setLoading: (loading) => set({ isLoading: loading }),

            logout: () => {
                removeCookie('accessToken');
                removeCookie('refreshToken');
                set({
                    token: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                    socialLoginTempData: null, // 로그아웃 시 임시 데이터 초기화
                });
                api.post('/account/logout').catch((error) => {
                    console.error('Logout API call failed:', error);
                });
            },

            clearAuth: () => {
                get().logout();
            },

            initializeAuth: async () => {
                // 이미 초기화가 완료되었다면 다시 실행하지 않음
                if (get().isAuthInitialized) return;

                set({ isLoading: true }); // 초기화 시작 시 로딩 상태 설정

                let currentAccessToken = getCookieValue('accessToken');
                let currentRefreshToken = getCookieValue('refreshToken');

                // 1. URL 파라미터에서 토큰 및 소셜 로그인 정보 확인 (최우선)
                const { accessToken: urlAccessToken, refreshToken: urlRefreshToken, socialData } = getUrlAuthParams();

                // URL에 토큰이 있다면 쿠키를 업데이트하고 사용
                if (urlAccessToken && urlRefreshToken) {
                    setCookie('accessToken', urlAccessToken); // MypageApi의 setCookie 기본값 7일
                    setCookie('refreshToken', urlRefreshToken); // MypageApi의 setCookie 기본값 7일
                    currentAccessToken = urlAccessToken;
                    currentRefreshToken = urlRefreshToken;
                }

                // URL에서 소셜 데이터가 있었다면 저장
                if (socialData) {
                    set({ socialLoginTempData: socialData });
                }

                if (currentAccessToken) {
                    try {
                        const decoded = jwtDecode<{ sub: string; exp: number }>(currentAccessToken);
                        if (Date.now() < decoded.exp * 1000) {
                            // 토큰 유효
                            set({
                                token: currentAccessToken,
                                refreshToken: currentRefreshToken,
                                isAuthenticated: true,
                                // 이 시점에서는 socialLoginTempData를 사용하여 최소한의 user 정보만 설정
                                // 실제 사용자 정보는 fetchUserInfo에서 가져옴
                                user: {
                                    userId: -1, // 임시값
                                    username: socialData?.username || socialData?.name || decoded.sub || '',
                                    email: socialData?.email || '',
                                    provider: socialData?.provider || '',
                                    providerId: socialData?.providerId || '',
                                    profileImage: socialData?.profileImage || '',
                                    name: socialData?.name || socialData?.username || decoded.sub || '',
                                    ssafyYear: '', classNum: '', ssafyRegion: '', gender: '', birthDate: ''
                                },
                            });
                            await get().fetchUserInfo(); // 최신 사용자 정보 조회
                        } else {
                            // 토큰 만료, 리프레시 시도
                            try {
                                const newTokenData = await refreshAccessToken();
                                const newDecoded = jwtDecode<{ sub: string; exp: number }>(newTokenData.accessToken);
                                set({
                                    token: newTokenData.accessToken,
                                    refreshToken: newTokenData.refreshToken,
                                    isAuthenticated: true,
                                    user: {
                                        userId: -1, // 임시값
                                        username: socialData?.username || socialData?.name || newDecoded.sub || '',
                                        email: socialData?.email || '',
                                        provider: socialData?.provider || '',
                                        providerId: socialData?.providerId || '',
                                        profileImage: socialData?.profileImage || '',
                                        name: socialData?.name || socialData?.username || newDecoded.sub || '',
                                        ssafyYear: '', classNum: '', ssafyRegion: '', gender: '', birthDate: ''
                                    },
                                });
                                await get().fetchUserInfo(); // 리프레시 후 사용자 정보 조회
                            } catch (refreshError) {
                                console.error('Token refresh failed:', refreshError);
                                get().logout(); // 리프레시 실패 시 로그아웃 처리
                            }
                        }
                    } catch (error) {
                        console.error('Token decoding or validation error during initializeAuth:', error);
                        get().logout(); // 토큰 디코딩/유효성 검사 실패 시 로그아웃 처리
                    }
                } else {
                    // 쿠키에 토큰이 없는 경우 (첫 방문 또는 로그아웃 상태)
                    // URL에 socialData만 있다면, 이는 회원가입이 필요한 신규 사용자일 수 있음.
                    // 이 경우 isAuthenticated는 false로 유지하고, mypage/page.tsx에서 socialLoginTempData를 보고 회원가입 폼을 띄우게 됨.
                    if (socialData) {
                        set({
                            socialLoginTempData: socialData,
                            isAuthenticated: false, // 토큰이 없으므로 로그인 상태 아님
                        });
                    }
                }
                set({ isAuthInitialized: true, isLoading: false }); // 인증 초기화 완료 및 로딩 해제
            },

            checkAuthStatus: () => {
                // initializeAuth가 대부분의 인증 상태 확인을 처리하므로,
                // 이 함수는 단순히 현재 상태를 반환하거나 최소한의 확인만 수행
                const currentToken = getCookieValue('accessToken');
                const isAuthenticatedNow = !!currentToken;

                set({
                    token: currentToken,
                    isAuthenticated: isAuthenticatedNow,
                });

                // initializeAuth에서 이미 fetchUserInfo를 호출하고 있으므로,
                // 여기서는 추가적으로 호출하지 않아도 됨.
                // 다만, isAuthInitialized가 true이고 user가 비어있다면 한 번 더 시도할 수 있음.
                if (isAuthenticatedNow && !get().user && get().isAuthInitialized) {
                    get().fetchUserInfo().catch(() => {/* handle error if needed */});
                }
                return isAuthenticatedNow;
            },

            // 새로운 액션: 유저 정보 가져오기
            fetchUserInfo: async () => {
                set({ isLoading: true });
                try {
                    const response = await getAccountInfo();
                    set({
                        user: response.data,
                        isLoading: false,
                        socialLoginTempData: null, // 사용자 정보 가져오기 성공하면 임시 데이터 초기화
                    });
                } catch (error) {
                    console.error('Failed to fetch user info:', error);
                    set({ isLoading: false });
                    // 유저 정보 조회 실패 시 (예: 토큰은 있지만 유저 정보가 DB에 없는 신규 유저)
                    // 이 시점에서 socialLoginTempData가 남아있다면 mypage/page.tsx에서 회원가입 폼을 띄울 것임.
                    // 사용자 정보를 가져오지 못했으므로 user를 null로 설정하는 것도 고려할 수 있으나,
                    // 이 경우 mypage/page.tsx에서 socialLoginTempData만으로도 폼을 띄울 수 있도록 유지.
                }
            },

            // 새로운 액션: 유저 정보 수정하기
            updateUserInformation: async (payload: UpdateUserInfoPayload) => {
                set({ isLoading: true });
                try {
                    const response = await updateAccountInfo(payload);
                    if (get().user) {
                        // 기존 user 정보에 payload와 서버 응답 데이터를 병합하여 업데이트
                        set({
                            user: { ...get().user, ...payload, ...response.data },
                            isLoading: false,
                        });
                    } else {
                        // user 객체가 없다면 다시 fetchUserInfo 호출하여 전체 정보를 가져옴
                        get().fetchUserInfo();
                    }
                } catch (error) {
                    console.error('Failed to update user info:', error);
                    set({ isLoading: false });
                    throw error; // 에러를 호출자에게 전파
                }
            },

            // 회원가입 액션
            signup: async (payload: SignupPayload) => {
                set({ isLoading: true });
                try {
                    const response = await apiSignup(payload);
                    const { accessToken, refreshToken } = response.data;

                    if (!accessToken || !refreshToken) {
                        throw new Error('회원가입 응답에 토큰이 누락되었습니다.');
                    }

                    // setToken과 setRefreshToken 액션을 사용하여 토큰을 상태와 쿠키에 저장
                    get().setToken(accessToken);
                    get().setRefreshToken(refreshToken);

                    set({
                        isAuthenticated: true,
                        socialLoginTempData: null, // 임시 데이터 제거
                    });

                    // 토큰 저장 후 최신 사용자 정보를 가져옴
                    await get().fetchUserInfo();
                } catch (error) {
                    console.error('회원가입에 실패했습니다:', error);
                    get().logout(); // 실패 시 모든 인증 관련 상태를 초기화
                    throw error; // 에러를 상위로 전파하여 UI에서 처리하도록 함
                } finally {
                    set({ isLoading: false });
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
    const socialLoginTempData = useAuthStore((state) => state.socialLoginTempData);

    return { isAuthenticated, token, user, isAuthInitialized, socialLoginTempData };
};

export const useAuthToken = () => {
    const token = useAuthStore((state) => state.token);
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

    return { token, hasToken: !!token, checkAuthStatus };
};