// app/mypage/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Next.js Link 컴포넌트 임포트
import { useAuthStore } from '@/store/AuthStore'; // AuthStore 임포트
import {
    addFriend,
    deleteFriend,
    getFriends,
    UserInfoData,
    redirectToGoogleLogin,
    signup, // signup 함수 임포트
    SignupPayload // SignupPayload 인터페이스 임포트
} from '@/api/MypageApi'; // MypageApi에서 필요한 함수와 인터페이스 임포트

export default function MyPage() {
    // AuthStore에서 필요한 상태와 액션 가져오기
    const {
        user,
        isAuthenticated,
        isLoading, // AuthStore의 로딩 상태
        isAuthInitialized, // AuthStore의 초기화 완료 상태
        logout,
        fetchUserInfo,
        updateUserInformation,
        initializeAuth, // 초기 인증 상태 확인을 위해 추가
        socialLoginTempData, // AuthStore에서 URL 파싱된 소셜 로그인 임시 데이터 가져오기
    } = useAuthStore();

    // 로컬 UI 상태 관리
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState(''); // username을 표시할 필드
    const [profileClass, setProfileClass] = useState('');
    const [friendNameInput, setFriendNameInput] = useState('');
    const [messageBoxVisible, setMessageBoxVisible] = useState(false);
    const [messageBoxText, setMessageBoxText] = useState('');
    const [friendsList, setFriendsList] = useState<UserInfoData[]>([]); // 친구 목록 상태

    // 회원가입 관련 상태 추가
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [signupData, setSignupData] = useState<Partial<SignupPayload>>({
        username: '', // 서비스에서 사용할 이름 (백엔드 username에 매핑)
        ssafyYear: '', // 백엔드 DTO의 ssafyGeneration과 매핑될 것 (숫자 문자열로)
        classNum: '',  // 백엔드 DTO의 ssafyClass와 매핑될 것 (숫자 문자열로)
        gender: undefined, // 'M' | 'F'
        birthDate: '', //YYYY-MM-DD 형식의 문자열로 유지
        ssafyRegion: '대전', // DTO에 맞춰 프론트에서 기본값 설정 (고정)
        // SignupPayload에 추가된 필드들 (email, provider, etc.)는
        // handleSignupSubmit에서 socialData로부터 가져와 채워질 것임.
    });

    // 메시지 박스 표시 함수
    const showMessage = useCallback((message: string) => {
        setMessageBoxText(message);
        setMessageBoxVisible(true);
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }, []);

    // 메시지 박스 숨기기 함수
    const hideMessage = useCallback(() => {
        setMessageBoxVisible(false);
        setMessageBoxText('');
        document.body.style.overflow = 'auto'; // 스크롤 허용
    }, []);

    // 컴포넌트 마운트 시 초기 인증 상태 확인
    useEffect(() => {
        initializeAuth(); // AuthStore 초기화 (토큰 확인 및 사용자 정보 로드 시도)
    }, [initializeAuth]);

    // 사용자 정보 변경 또는 소셜 로그인 임시 데이터 수신 시 UI 상태 업데이트
    useEffect(() => {
        // AuthStore 초기화가 완료된 후에만 로직 실행
        if (!isAuthInitialized) return;

        if (isAuthenticated && user) {
            // 사용자가 로그인되어 있고, user 정보가 로드된 경우
            setProfileName(user.username || '');
            setProfileClass(user.classNum || '');

            // 필수 정보가 누락되었는지 확인하여 회원가입 폼을 보여줄지 결정
            // ssafyYear, classNum은 백엔드에서 숫자 문자열로 내려올 수 있으므로, 빈 문자열 여부만 확인
            if (!user.ssafyYear || !user.classNum || !user.gender || !user.birthDate) {
                setShowSignupForm(true);
                setSignupData(prev => ({
                    ...prev,
                    username: user.username || socialLoginTempData?.name || socialLoginTempData?.username || '',
                    ssafyYear: user.ssafyYear || '', // user.ssafyYear가 '13기' 등이라면 여기서 처리하지 않고 input value에서 처리
                    classNum: user.classNum || '',
                    gender: (user.gender as 'M' | 'F') || undefined,
                    birthDate: user.birthDate || '', // user.birthDate를 그대로 사용
                    ssafyRegion: user.ssafyRegion || '대전', // 기존 유저 정보가 있으면 사용, 없으면 대전
                }));
            } else {
                setShowSignupForm(false);
            }
        } else if (socialLoginTempData && !isAuthenticated) {
            // 로그인되어 있지 않지만, URL 파라미터로 소셜 로그인 임시 데이터가 넘어온 경우
            // 이 경우는 토큰은 없지만 소셜 계정 정보만 있는 상태 (예: 소셜 로그인 후 백엔드에서 아직 회원가입 처리 안됨)
            setShowSignupForm(true);
            setSignupData({
                username: socialLoginTempData.name || socialLoginTempData.username || '',
                ssafyYear: '', // 새로 입력받아야 하므로 비워둠
                classNum: '',  // 새로 입력받아야 하므로 비워둠
                gender: undefined,
                birthDate: '', // 새로 입력받아야 하므로 비워둠
                ssafyRegion: socialLoginTempData.ssafyRegion || '대전', // socialLoginTempData에 있다면 사용, 없으면 대전
            });
        } else {
            // 로그아웃 상태 또는 아직 어떤 정보도 없는 초기 상태
            setProfileName('');
            setProfileClass('');
            setFriendsList([]); // 친구 목록도 비움
            setShowSignupForm(false);
        }
    }, [user, socialLoginTempData, isAuthenticated, isAuthInitialized]);

    // 친구 목록을 불러오는 함수 (isAuthenticated와 showSignupForm 상태에 따라 동작)
    const loadFriendList = useCallback(async () => {
        // 로그인되지 않았거나 회원가입 폼이 떠있으면 로드 안 함
        // showSignupForm이 true여도, 인증은 되었지만 추가 정보 입력이 필요한 경우일 수 있으므로
        // !showSignupForm 조건 제거. 대신 user가 필수 정보를 모두 가지고 있는지 확인 후 친구 목록 로드
        if (!isAuthenticated || !user || !user.ssafyYear || !user.classNum || !user.gender || !user.birthDate) {
            setFriendsList([]);
            return;
        }
        try {
            const response = await getFriends();
            setFriendsList(response.data.friends);
        } catch (error) {
            console.error("친구 목록을 불러오는 데 실패했습니다:", error);
            showMessage("친구 목록을 불러오는 데 실패했습니다.");
        }
    }, [isAuthenticated, user, showMessage]);

    // 인증 상태 변경 시 사용자 정보 및 친구 목록 로드 (initializeAuth 완료 후)
    useEffect(() => {
        if (isAuthInitialized) {
            if (isAuthenticated) {
                // fetchUserInfo는 initializeAuth 내부에서 이미 호출되거나 필요 시 호출됨
                // 여기서는 친구 목록 로드 조건만 관리
                loadFriendList();
            } else {
                setFriendsList([]);
            }
        }
    }, [isAuthenticated, isAuthInitialized, loadFriendList]);

    // Google 로그인 시작 처리
    const handleGoogleSignIn = () => {
        redirectToGoogleLogin();
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout();
            showMessage("로그아웃되었습니다.");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            showMessage("로그아웃에 실패했습니다.");
        }
    };

    // 프로필 업데이트 처리 (기존 마이페이지)
    const handleUpdateProfile = async () => {
        if (!user) {
            showMessage("로그인이 필요합니다.");
            return;
        }

        try {
            await updateUserInformation({
                username: profileName,
                classNum: profileClass,
            });
            showMessage("프로필이 성공적으로 업데이트되었습니다!");
            setIsEditingProfile(false);
        }
        catch (error) {
            console.error("프로필 업데이트 실패:", error);
            showMessage("프로필 업데이트에 실패했습니다.");
        }
    };

    // 친구 추가 처리
    const handleAddFriend = async () => {
        if (!isAuthenticated) {
            showMessage("로그인이 필요합니다.");
            return;
        }

        const trimmedFriendName = friendNameInput.trim();
        if (!trimmedFriendName) {
            showMessage("친구 이름을 입력해주세요.");
            return;
        }

        if (user && trimmedFriendName === user.username) {
            showMessage("자신을 친구로 추가할 수 없습니다.");
            return;
        }

        try {
            await addFriend(trimmedFriendName);
            showMessage(`'${trimmedFriendName}'님을 친구로 추가했습니다!`);
            setFriendNameInput('');
            loadFriendList();
        } catch (error: any) {
            console.error("친구 추가 실패:", error);
            if (error.response && error.response.data && error.response.data.message) {
                showMessage(`친구 추가 실패: ${error.response.data.message}`);
            } else {
                showMessage("친구 추가에 실패했습니다.");
            }
        }
    };

    // 친구 삭제 처리
    const handleDeleteFriend = async (friendIdToDelete: number) => {
        if (!isAuthenticated) {
            showMessage("로그인이 필요합니다.");
            return;
        }

        try {
            await deleteFriend(friendIdToDelete);
            showMessage("친구가 삭제되었습니다.");
            loadFriendList();
        } catch (error) {
            console.error("친구 삭제 실패:", error);
            showMessage("친구 삭제에 실패했습니다.");
        }
    };

    // 회원가입 폼 제출 처리 (소셜 로그인 후 추가 정보 입력)
    const handleSignupSubmit = async () => {
        // user가 없어도 socialLoginTempData가 있으면 진행
        if (!user && !socialLoginTempData) {
            showMessage("회원가입에 필요한 정보가 부족합니다. 다시 로그인해주세요.");
            return;
        }

        // 필수 필드 유효성 검사
        if (!signupData.username || !signupData.ssafyYear || !signupData.classNum || !signupData.gender || !signupData.birthDate) {
            showMessage("모든 필수 정보를 입력해주세요.");
            return;
        }

        // birthDate 형식 검증 (YYYY-MM-DD)
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(signupData.birthDate)) {
            showMessage("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
            return;
        }

        // 연도 범위 검증 (1900-현재년도) 추가
        const [yearStr] = signupData.birthDate.split('-');
        const year = parseInt(yearStr);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            showMessage(`생년월일의 연도는 1900년에서 ${currentYear}년 사이로 입력해주세요.`);
            return;
        }


        // 현재 user 정보가 있다면 user를, 없다면 socialLoginTempData를 기본 데이터로 사용
        const sourceData = user || socialLoginTempData;
        if (!sourceData) {
            showMessage("회원가입에 필요한 기본 사용자 정보가 없습니다.");
            return;
        }

        const fullSignupPayload: SignupPayload = {
            email: sourceData.email || '',
            provider: sourceData.provider || 'google', // 기본값 'google'
            providerId: sourceData.providerId || '',
            profileImage: sourceData.profileImage || '',
            name: sourceData.name || signupData.username, // name은 소셜 데이터의 name을 우선, 없으면 입력된 username
            username: signupData.username,
            ssafyYear: signupData.ssafyYear,
            classNum: signupData.classNum,
            gender: signupData.gender,
            birthDate: signupData.birthDate,
            ssafyRegion: signupData.ssafyRegion || '대전', // signupData에 없다면 '대전'
        };

        try {
            console.log("Sending Signup Payload:", fullSignupPayload); // 디버깅용 로그
            const response = await signup(fullSignupPayload); // MypageApi의 signup 함수 호출
            
            // 백엔드에서 200 OK와 함께 리다이렉트가 아닌 실제 응답을 주는 경우
            if (response.status === 200 || response.status === 201) {
                showMessage("회원가입이 완료되었습니다! 마이페이지를 이용할 수 있습니다.");
                setShowSignupForm(false);
                fetchUserInfo(); // 최신 사용자 정보 다시 불러오기 (user 상태 업데이트)
            } else {
                 // 200/201이 아니지만 에러가 아닌 응답 (이 경우는 백엔드 응답 방식에 따라 다름)
                 // Axios는 2xx 범위가 아니면 자동으로 에러로 던지므로 이 else 블록에 들어올 일은 거의 없음
                 const errorText = response.statusText || '알 수 없는 오류';
                 console.error("회원가입 처리되었으나 예상치 못한 응답:", response);
                 showMessage(`회원가입 처리 중 문제가 발생했습니다: ${errorText}`);
            }
        } catch (error: any) {
            console.error("회원가입 실패:", error);
            // 백엔드 오류 메시지를 더 정확하게 표시
            if (error.response && error.response.data && error.response.data.message) {
                // 백엔드에서 보낸 구체적인 에러 메시지 (예: "이미 가입된 사용자입니다.")
                showMessage(`회원가입 실패: ${error.response.data.message}`);
            } else if (error.message === "Network Error") {
                // CORS 문제, 서버 응답 없음 등 네트워크 관련 오류
                showMessage("회원가입에 실패했습니다: 서버 연결 또는 네트워크 오류. 백엔드의 CORS 설정을 확인해주세요.");
            } else if (error.message) {
                // 그 외 예상치 못한 Axios 오류 메시지
                showMessage(`회원가입 실패: ${error.message}`);
            }
            else {
                showMessage("회원가입에 실패했습니다.");
            }
        } finally {
             // (isLoading 상태가 없으므로 별도 로딩 해제 로직은 생략합니다)
        }
    };

    // 생년월일 입력값 변경 핸들러 (사용자가 직접 YYYY-MM-DD 형식으로 입력하도록 유도)
    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // `type="text"` 입력 필드에서 숫자와 하이픈만 허용하도록 필터링
        const rawValue = e.target.value.replace(/[^0-9-]/g, ''); // 숫자와 하이픈만 남김
        setSignupData(prev => ({ ...prev, birthDate: rawValue }));
    };


    // 인증 상태가 초기화되기 전까지 로딩 화면 표시
    if (!isAuthInitialized) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-700">로그인 상태 확인 중...</p>
                <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // 메인 컨텐츠 렌더링 로직 (세 가지 상태 중 하나만 표시)
    let mainContent;

    if (!isAuthenticated && !socialLoginTempData && !showSignupForm) {
        // 1. 로그인 필요 (일반적인 비로그인 상태)
        mainContent = (
            <div id="notLoggedIn" className="text-center space-y-6">
                <p className="text-lg text-white text-shadow">로그인이 필요합니다.</p>
                <button
                    id="googleSignInBtn"
                    onClick={handleGoogleSignIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl flex items-center justify-center"
                >
                    Google로 로그인
                </button>
            </div>
        );
    } else if (showSignupForm) {
        // 2. 회원가입 폼 표시 (로그인했지만 정보가 부족하거나, 소셜 로그인 후 정보가 필요한 경우)
        mainContent = (
            // 친구 목록 박스와 유사하게 profile-card 스타일 적용 (더 넓은 너비를 가짐)
            <div className="profile-card text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">회원가입</h2>
                <p className="text-gray-600 mb-6">서비스 이용을 위해 추가 정보를 입력해주세요.</p>

                {/* 이 div의 너비를 `profile-card`에 맞추기 위해 `mx-auto`만 남기고 고정 `max-width` 제거 */}
                {/* 이 div 자체에 w-full을 적용하여 부모 profile-card의 전체 너비를 사용하게 함 */}
                <div className="space-y-3 mx-auto w-full">
                    {/* 이름 */}
                    <div>
                        <label htmlFor="signupName" className="block text-gray-800 text-sm font-medium text-left mb-1">서비스에서 사용할 이름</label>
                        <input
                            type="text"
                            id="signupName"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            placeholder="이름"
                            value={signupData.username}
                            onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                        />
                    </div>

                    {/* 기수 */}
                    <div>
                        <label htmlFor="ssafyYear" className="block text-gray-800 text-sm font-medium text-left mb-1">기수</label>
                        <select
                            id="ssafyYear"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            value={signupData.ssafyYear}
                            onChange={(e) => setSignupData(prev => ({ ...prev, ssafyYear: e.target.value }))}
                        >
                            <option value="">선택</option>
                            <option value="13">13기</option>
                            <option value="14">14기</option>
                        </select>
                    </div>

                    {/* 반 */}
                    <div>
                        <label htmlFor="classNum" className="block text-gray-800 text-sm font-medium text-left mb-1">반</label>
                        <select
                            id="classNum"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            value={signupData.classNum}
                            onChange={(e) => setSignupData(prev => ({ ...prev, classNum: e.target.value }))}
                        >
                            <option value="">선택</option>
                            <option value="1">1반</option>
                            <option value="2">2반</option>
                            <option value="3">3반</option>
                            <option value="4">4반</option>
                            <option value="5">5반</option>
                            <option value="6">6반</option>
                        </select>
                    </div>

                    {/* 성별 */}
                    <div className="text-left">
                        <label className="block text-gray-800 text-sm font-medium text-left mb-1">성별</label>
                        <div className="flex space-x-6 text-gray-800">
                            <label className="flex items-center text-gray-800">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="M"
                                    checked={signupData.gender === 'M'}
                                    onChange={(e) => setSignupData(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' }))}
                                    className="mr-2"
                                /> 남
                            </label>
                            <label className="flex items-center text-gray-800">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="F"
                                    checked={signupData.gender === 'F'}
                                    onChange={(e) => setSignupData(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' }))}
                                    className="mr-2"
                                /> 여
                            </label>
                        </div>
                    </div>

                    {/* 생년월일 */}
                    <div>
                        <label htmlFor="birthDate" className="block text-gray-800 text-sm font-medium text-left mb-1">생년월일</label>
                        <input
                            type="text"
                            id="birthDate"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            placeholder="YYYY-MM-DD"
                            pattern="\d{4}-\d{2}-\d{2}"
                            maxLength={10}
                            value={signupData.birthDate}
                            onChange={handleBirthDateChange}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSignupSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg mt-6"
                >
                    회원가입 완료
                </button>
            </div>
        );
    } else if (isAuthenticated && !showSignupForm) {
        // 3. 로그인 완료된 마이페이지 (프로필 수정 및 친구 목록)
        mainContent = (
            <div id="loggedIn" className="space-y-10 w-full">
                {/* "사용자 ID: ~~" 텍스트 제거됨 */}

                {/* Profile Section */}
                <div className="profile-card text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">내 프로필</h2>

                    <img
                        id="profilePic"
                        src={user?.profileImage || "https://placehold.co/120x120/cccccc/333333?text=Profile"}
                        alt="프로필 사진"
                        className="profile-pic mx-auto"
                    />

                    <div className="space-y-3">
                        {/* 이름 입력 */}
                        <div className="mx-auto">
                            <label htmlFor="profileName" className="block text-gray-800 text-sm font-medium">이름</label>
                            <input
                                type="text"
                                id="profileName"
                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                                disabled={!isEditingProfile}
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                        </div>
                        {/* 반 입력 */}
                        <div className="mx-auto">
                            <label htmlFor="profileClass" className="block text-gray-800 text-sm font-medium">반</label>
                            <input
                                type="text"
                                id="profileClass"
                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                                disabled={!isEditingProfile}
                                value={profileClass}
                                onChange={(e) => setProfileClass(e.target.value)}
                            />
                        </div>
                    </div>

                    <div id="profileActions" className="flex justify-center space-x-4 mt-4">
                        {!isEditingProfile ? (
                            <button id="editProfileBtn" onClick={() => setIsEditingProfile(true)} className="edit-button">
                                수정
                            </button>
                        ) : (
                            <>
                                <button id="saveProfileBtn" onClick={handleUpdateProfile} className="save-button">
                                    저장
                                </button>
                                <button
                                    id="cancelEditBtn"
                                    onClick={() => {
                                        setIsEditingProfile(false);
                                        if (user) {
                                            setProfileName(user.username || '');
                                            setProfileClass(user.classNum || '');
                                        }
                                    }}
                                    className="cancel-button"
                                >
                                    취소
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Friend List Section */}
                <div className="friends-card space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">친구 목록</h2>

                    {/* Add Friend */}
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <input
                            type="text"
                            id="friendNameInput"
                            placeholder="추가할 친구 이름"
                            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-800"
                            value={friendNameInput}
                            onChange={(e) => setFriendNameInput(e.target.value)}
                        />
                        <button
                            id="addFriendBtn"
                            onClick={handleAddFriend}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg"
                        >
                            친구 추가
                        </button>
                    </div>

                    {/* Friend List */}
                    <div id="friendList" className="space-y-3">
                        {friendsList.length === 0 ? (
                            <p className="text-gray-500 text-center" id="noFriendsMessage">친구를 추가해보세요!</p>
                        ) : (
                            friendsList.map(friend => (
                                <div key={friend.userId} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm border border-gray-200">
                                    <span className="text-lg font-medium text-gray-800">{friend.username}</span>
                                    <button
                                        onClick={() => handleDeleteFriend(friend.userId)}
                                        className="delete-friend-btn text-red-500 hover:text-red-700 transition-colors duration-200"
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="text-center mt-10">
                    <button
                        id="logoutBtn"
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        );
    } else {
        // 모든 로딩 상태가 끝났지만, 위의 조건에 해당하지 않는 경우 (예외 상황)
        mainContent = <div className="text-white text-lg">알 수 없는 상태입니다.</div>;
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>마이페이지</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                {/* Font Awesome for icons */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            {/* Custom Message Box */}
            {messageBoxVisible && (
                <div id="messageBoxOverlay" className="message-box-overlay visible" onClick={hideMessage}>
                    <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
                        <p id="messageBoxText">{messageBoxText}</p>
                        <button onClick={hideMessage} className="message-box-confirm-button">확인</button>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <header className="bg-white shadow-md py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {/* Link 컴포넌트 사용 */}
                    <Link href="/main" className="text-2xl font-bold text-gray-800 rounded-lg">
                        SSABAB
                    </Link>
                    <nav>
                        <ul className="flex space-x-6">
                            <li><Link href="/main" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">홈</Link></li>
                            <li><Link href="/review" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">평가하기</Link></li>
                            <li><Link href="/analysis" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">분석보기</Link></li>
                            <li><Link href="/mypage" className="text-blue-600 font-bold rounded-lg">마이페이지</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                {/* Main Content: MyPage */}
                <div id="mypageContent" className="py-16 md:py-24 px-4 section-gradient-navy-blue text-white text-center">
                    <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">
                            마이페이지
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow">내 정보와 친구들을 관리하세요.</p>

                        {/* 로딩 중 표시 (API 호출 중일 때) */}
                        {isLoading && (
                            <div className="text-white text-lg mb-4">데이터 로딩 중...</div>
                        )}

                        {/* 조건에 따른 메인 컨텐츠 렌더링 */}
                        {mainContent}

                    </div>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 오늘의 메뉴. 모든 권리 보유.</p>
                    <div className="flex justify-center space-x-6 mt-4">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">개인정보처리방침</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">이용약관</a>
                        <a href="#" className="text-400 hover:text-white transition-colors duration-200 rounded-lg">문의</a>
                    </div>
                </div>
            </footer>

            {/* Inline styles from HTML should be moved to a global CSS file or `globals.css` in Next.js */}
            <style jsx global>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #ffffff; /* 기본 배경색 */
                    overflow-x: hidden; /* 가로 스크롤 방지 */
                    overflow-y: auto; /* 세로 스크롤 허용 */
                }
                /* 밝은 남보라색 계열 그라데이션 배경 */
                .section-gradient-navy-blue {
                    background: linear-gradient(to bottom, #AEC6F7, #FFFFFF); /* 연한 남보라색에서 흰색으로 */
                }
                /* review.html의 text-shadow와 동일하게 적용 */
                .text-shadow {
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
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
                    background-color: #4169E1; /* 남보라색 계열 */
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
                    background-color: #365EC7; /* 진한 남보라색 */
                }

                /* 프로필 및 친구 목록 카드 스타일 - analysis-card와 유사하게 조정 */
                .profile-card, .friends-card {
                    background-color: #ffffff;
                    border-radius: 0.75rem; /* rounded-xl */
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* analysis-card와 동일한 그림자 */
                    padding: 1.5rem; /* p-6 */
                    transition: transform 0.3s ease-in-out; /* 호버 효과 추가 */
                }
                .profile-card:hover, .friends-card:hover {
                    transform: translateY(-5px); /* 호버 시 살짝 위로 이동 */
                }

                .profile-pic {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid #4169E1; /* 남보라색 테두리 */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                .edit-button {
                    background-color: #4169E1;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 0.2s ease;
                }
                .edit-button:hover {
                    background-color: #365EC7;
                }
                .save-button {
                    background-color: #10b981; /* Green */
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 0.2s ease;
                }
                .save-button:hover {
                    background-color: #0c9f6e;
                }
                .cancel-button {
                    background-color: #ef4444; /* Red */
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 0.2s ease;
                }
                .cancel-button:hover {
                    background-color: #dc2626;
                }
            `}</style>
        </div>
    );
}