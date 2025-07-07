// app/mypage/page.tsx
 'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react'; // useRef 추가
 import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '@/store/AuthStore';
import {
    addFriend,
    deleteFriend,
    getFriends,
    UserInfoData,
    redirectToGoogleLogin,
    signup,
    SignupPayload,
    checkUsernameExists, // checkUsernameExists 함수 임포트
} from '@/api/MypageApi';

 export default function MyPage() {
     const {
         user,
         isAuthenticated,
        isLoading,
        isAuthInitialized,
         logout,
         fetchUserInfo,
         updateUserInformation,
        initializeAuth,
        socialLoginTempData,
     } = useAuthStore();

     const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState('');
     const [profileClass, setProfileClass] = useState('');
     const [friendNameInput, setFriendNameInput] = useState('');
     const [messageBoxVisible, setMessageBoxVisible] = useState(false);
     const [messageBoxText, setMessageBoxText] = useState('');
    const [friendsList, setFriendsList] = useState<UserInfoData[]>([]);

    // 회원가입 관련 상태 추가
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [signupData, setSignupData] = useState<Partial<SignupPayload>>({
        username: '',
        ssafyYear: '',
        classNum: '',
        gender: undefined,
        birthDate: '',
        ssafyRegion: '대전',
    });

    // --- 유저네임 중복 체크 관련 상태 및 레퍼런스 추가 ---
    const [usernameCheckStatus, setUsernameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
    const [usernameFeedbackMessage, setUsernameFeedbackMessage] = useState<string>('');
    const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 디바운스를 위한 타이머 참조

    // 메시지 박스 표시/숨기기 함수는 기존과 동일
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

    // 컴포넌트 마운트 시 초기 인증 상태 확인 (기존과 동일)
     useEffect(() => {
        initializeAuth();
     }, [initializeAuth]);

    // 사용자 정보 변경 또는 소셜 로그인 임시 데이터 수신 시 UI 상태 업데이트 (기존과 동일)
     useEffect(() => {
        if (!isAuthInitialized) return;

        if (isAuthenticated && user) {
            setProfileName(user.username || '');
            setProfileClass(user.classNum || '');

            if (!user.ssafyYear || !user.classNum || !user.gender || !user.birthDate) {
                setShowSignupForm(true);
                setSignupData(prev => ({
                    ...prev,
                    username: user.username || socialLoginTempData?.name || socialLoginTempData?.username || '',
                    ssafyYear: user.ssafyYear || '',
                    classNum: user.classNum || '',
                    gender: (user.gender as 'M' | 'F') || undefined,
                    birthDate: user.birthDate || '',
                    ssafyRegion: user.ssafyRegion || '대전',
                }));
            } else {
                setShowSignupForm(false);
            }
        } else if (socialLoginTempData && !isAuthenticated) {
            setShowSignupForm(true);
            setSignupData({
                username: socialLoginTempData.name || socialLoginTempData.username || '',
                ssafyYear: '',
                classNum: '',
                gender: undefined,
                birthDate: '',
                ssafyRegion: socialLoginTempData.ssafyRegion || '대전',
            });
         } else {
             setProfileName('');
             setProfileClass('');
            setFriendsList([]);
            setShowSignupForm(false);
         }
    }, [user, socialLoginTempData, isAuthenticated, isAuthInitialized]);

    // 친구 목록 로드 및 인증 상태 변경 시 로드 로직 (기존과 동일)
     const loadFriendList = useCallback(async () => {
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

     useEffect(() => {
        if (isAuthInitialized) {
         if (isAuthenticated) {
                loadFriendList();
         } else {
             setFriendsList([]);
         }
        }
    }, [isAuthenticated, isAuthInitialized, loadFriendList]);

    // Google 로그인, 로그아웃, 프로필 업데이트, 친구 추가/삭제 (기존과 동일)
     const handleGoogleSignIn = () => {
         redirectToGoogleLogin();
     };

     const handleLogout = async () => {
         try {
            await logout();
             showMessage("로그아웃되었습니다.");
         } catch (error) {
             console.error("로그아웃 실패:", error);
             showMessage("로그아웃에 실패했습니다.");
         }
     };

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

    // --- 유저네임 입력 변경 핸들러 (중복 체크 로직 포함) ---
    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSignupData(prev => ({ ...prev, username: value }));

        // 이전 타이머가 있다면 클리어
        if (usernameCheckTimeoutRef.current) {
            clearTimeout(usernameCheckTimeoutRef.current);
        }

        // 입력값이 비어있으면 체크 상태 초기화
        if (value.trim() === '') {
            setUsernameCheckStatus('idle');
            setUsernameFeedbackMessage('');
            return;
        }

        // 디바운스 적용: 500ms 후 중복 체크 시작
        setUsernameCheckStatus('checking');
        setUsernameFeedbackMessage('중복 확인 중...');
        usernameCheckTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await checkUsernameExists(value.trim());
                if (response.data === true) { // 백엔드가 true를 반환하면 이미 존재 (중복)
                    setUsernameCheckStatus('taken');
                    setUsernameFeedbackMessage('이미 사용 중인 이름입니다.');
                } else { // 백엔드가 false를 반환하면 사용 가능
                    setUsernameCheckStatus('available');
                    setUsernameFeedbackMessage('사용 가능한 이름입니다.');
                }
            } catch (error) {
                console.error("이름 중복 확인 실패:", error);
                setUsernameCheckStatus('error');
                setUsernameFeedbackMessage('이름 중복 확인 중 오류가 발생했습니다.');
            }
        }, 500); // 500ms 디바운스
    }, []);

    // 회원가입 폼 제출 처리 (소셜 로그인 후 추가 정보 입력)
    const handleSignupSubmit = async () => {
        if (!user && !socialLoginTempData) {
            showMessage("회원가입에 필요한 정보가 부족합니다. 다시 로그인해주세요.");
            return;
        }

        // 필수 필드 유효성 검사 (기존과 동일)
        if (!signupData.username || !signupData.ssafyYear || !signupData.classNum || !signupData.gender || !signupData.birthDate) {
            showMessage("모든 필수 정보를 입력해주세요.");
            return;
        }

        // 유저네임 중복 체크 상태 확인
        if (usernameCheckStatus === 'checking') {
            showMessage("이름 중복 확인 중입니다. 잠시 기다려주세요.");
            return;
        }
        if (usernameCheckStatus === 'taken') {
            showMessage("이미 사용 중인 이름입니다. 다른 이름을 선택해주세요.");
            return;
        }
        if (usernameCheckStatus === 'error') {
            showMessage("이름 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }
        if (usernameCheckStatus === 'idle') { // 이름 필드를 한 번도 건드리지 않았을 경우
             // 이 경우 'checking'이 아니라 'idle'일 수 있으므로, 최소한의 유효성 검사
             if (!signupData.username.trim()) {
                 showMessage("서비스에서 사용할 이름을 입력해주세요.");
                 return;
             }
             // 이름 필드가 채워져 있지만 중복 체크가 안된 경우 (debounce 대기 등)
             showMessage("이름 중복 확인이 필요합니다. 잠시 기다려주세요.");
             return;
        }


        // birthDate 형식 및 연도 범위 검증 (기존과 동일)
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(signupData.birthDate)) {
            showMessage("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
            return;
        }
        const [yearStr] = signupData.birthDate.split('-');
        const year = parseInt(yearStr);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            showMessage(`생년월일의 연도는 1900년에서 ${currentYear}년 사이로 입력해주세요.`);
            return;
        }

        const sourceData = user || socialLoginTempData;
        if (!sourceData) {
            showMessage("회원가입에 필요한 기본 사용자 정보가 없습니다.");
            return;
        }

        const fullSignupPayload: SignupPayload = {
            email: sourceData.email || '',
            provider: sourceData.provider || 'google',
            providerId: sourceData.providerId || '',
            profileImage: sourceData.profileImage || '',
            name: sourceData.name || signupData.username,
            username: signupData.username,
            ssafyYear: signupData.ssafyYear,
            classNum: signupData.classNum,
            gender: signupData.gender,
            birthDate: signupData.birthDate,
            ssafyRegion: signupData.ssafyRegion || '대전',
        };

        try {
            console.log("Sending Signup Payload:", fullSignupPayload);
            const response = await signup(fullSignupPayload);

            if (response.status === 200 || response.status === 201) {
                showMessage("회원가입이 완료되었습니다! 마이페이지를 이용할 수 있습니다.");
                setShowSignupForm(false);
                fetchUserInfo();
            } else {
                 const errorText = response.statusText || '알 수 없는 오류';
                 console.error("회원가입 처리되었으나 예상치 못한 응답:", response);
                 showMessage(`회원가입 처리 중 문제가 발생했습니다: ${errorText}`);
            }
        } catch (error: any) {
            console.error("회원가입 실패:", error);
            if (error.response && error.response.data && error.response.data.message) {
                showMessage(`회원가입 실패: ${error.response.data.message}`);
            } else if (error.message === "Network Error") {
                showMessage("회원가입에 실패했습니다: 서버 연결 또는 네트워크 오류. 백엔드의 CORS 설정을 확인해주세요.");
            } else if (error.message) {
                showMessage(`회원가입 실패: ${error.message}`);
            }
            else {
                showMessage("회원가입에 실패했습니다.");
            }
        } finally {
        }
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9-]/g, '');
        setSignupData(prev => ({ ...prev, birthDate: rawValue }));
    };


     if (!isAuthInitialized) {
         return (
             <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
                 <p className="text-xl font-semibold text-gray-700">로그인 상태 확인 중...</p>
                 <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
             </div>
         );
     }

    let mainContent;

    if (!isAuthenticated && !socialLoginTempData && !showSignupForm) {
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
        mainContent = (
            <div className="profile-card text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">회원가입</h2>
                <p className="text-gray-600 mb-6">서비스 이용을 위해 추가 정보를 입력해주세요.</p>

                <div className="space-y-3 mx-auto w-full">
                    {/* 이름 입력 필드 */}
                    <div>
                        <label htmlFor="signupName" className="block text-gray-800 text-sm font-medium text-left mb-1">서비스에서 사용할 이름</label>
                        <input
                            type="text"
                            id="signupName"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            placeholder="이름"
                            value={signupData.username}
                            onChange={handleUsernameChange} // 변경된 핸들러 적용
                        />
                        {/* 유저네임 중복 체크 피드백 메시지 */}
                        {usernameFeedbackMessage && (
                            <p className={`text-sm text-left mt-1 ${
                                usernameCheckStatus === 'available' ? 'text-green-600' :
                                usernameCheckStatus === 'taken' || usernameCheckStatus === 'error' ? 'text-red-600' : 'text-gray-500'
                            }`}>
                                {usernameFeedbackMessage}
                            </p>
                        )}
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
        mainContent = (
                             <div id="loggedIn" className="space-y-10 w-full">
                                 <div className="profile-card text-center space-y-4">
                                     <h2 className="text-2xl font-bold text-gray-800 mb-4">내 프로필</h2>

                                     <img
                                         id="profilePic"
                        src={user?.profileImage || "https://placehold.co/120x120/cccccc/333333?text=Profile"}
                                         alt="프로필 사진"
                                         className="profile-pic mx-auto"
                                     />

                                     <div className="space-y-3">
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

                                 <div className="friends-card space-y-6">
                                     <h2 className="text-2xl font-bold text-gray-800 text-center">친구 목록</h2>

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
        mainContent = <div className="text-white text-lg">알 수 없는 상태입니다.</div>;
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>마이페이지</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            {messageBoxVisible && (
                <div id="messageBoxOverlay" className="message-box-overlay visible" onClick={hideMessage}>
                    <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
                        <p id="messageBoxText">{messageBoxText}</p>
                        <button onClick={hideMessage} className="message-box-confirm-button">확인</button>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                <div id="mypageContent" className="py-16 md:py-24 px-4 section-gradient-navy-blue text-white text-center">
                    <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow">
                            마이페이지
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow">내 정보와 친구들을 관리하세요.</p>

                        {isLoading && (
                            <div className="text-white text-lg mb-4">데이터 로딩 중...</div>
                        )}

                        {mainContent}

                     </div>
                 </div>
             </main>

             <style jsx global>{`
                 body {
                     font-family: 'Inter', sans-serif;
                    background-color: #ffffff;
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                 .section-gradient-navy-blue {
                    background: linear-gradient(to bottom, #AEC6F7, #FFFFFF);
                 }
                 .text-shadow {
                     text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                 }
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
                    background-color: #4169E1;
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
                    background-color: #365EC7;
                 }

                 .profile-card, .friends-card {
                     background-color: #ffffff;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
                    padding: 1.5rem;
                    transition: transform 0.3s ease-in-out;
                 }
                 .profile-card:hover, .friends-card:hover {
                    transform: translateY(-5px);
                 }

                 .profile-pic {
                     width: 120px;
                     height: 120px;
                     border-radius: 50%;
                     object-fit: cover;
                    border: 4px solid #4169E1;
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
                    background-color: #10b981;
                     color: white;
                     padding: 0.5rem 1rem;
                     border-radius: 0.5rem;
                     transition: background-color 0.2s ease;
                 }
                 .save-button:hover {
                     background-color: #0c9f6e;
                 }
                 .cancel-button {
                    background-color: #ef4444;
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