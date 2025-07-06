// app/mypage/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Next.js Link 컴포넌트 임포트
import { useAuthStore } from '@/store/AuthStore'; // AuthStore 임포트
import { addFriend, deleteFriend, getFriends, UserInfoData, redirectToGoogleLogin } from '@/api/MypageApi'; // MypageApi에서 필요한 함수와 인터페이스 임포트

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
        initializeAuth // 초기 인증 상태 확인을 위해 추가
    } = useAuthStore();

    // 로컬 UI 상태 관리
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState(''); // username을 표시할 필드
    const [profileClass, setProfileClass] = useState('');
    const [profileStudentId, setProfileStudentId] = useState('');
    const [friendNameInput, setFriendNameInput] = useState('');
    const [messageBoxVisible, setMessageBoxVisible] = useState(false);
    const [messageBoxText, setMessageBoxText] = useState('');
    const [friendsList, setFriendsList] = useState<UserInfoData[]>([]); // 친구 목록 상태

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

    // 사용자 정보가 변경될 때 프로필 입력 필드 업데이트
    useEffect(() => {
        if (user) {
            setProfileName(user.username || ''); // user.username으로 변경
            setProfileClass(user.classNum || ''); // user.classNum이 없을 경우를 대비
            setProfileStudentId(user.ssafyYear || ''); // user.ssafyYear가 없을 경우를 대비
        } else {
            // 사용자가 로그아웃했거나 정보가 없는 경우 필드 초기화
            setProfileName('');
            setProfileClass('');
            setProfileStudentId('');
        }
    }, [user]);

    // 친구 목록을 불러오는 함수
    const loadFriendList = useCallback(async () => {
        if (!isAuthenticated) {
            setFriendsList([]); // 로그인되지 않았다면 친구 목록 비움
            return;
        }
        try {
            const response = await getFriends(); // MypageApi의 getFriends 호출
            setFriendsList(response.data.friends);
        } catch (error) {
            console.error("친구 목록을 불러오는 데 실패했습니다:", error);
            showMessage("친구 목록을 불러오는 데 실패했습니다.");
        }
    }, [isAuthenticated, showMessage]);

    // 인증 상태 변경 시 사용자 정보 및 친구 목록 로드
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserInfo(); // 로그인 시 사용자 정보 가져오기
            loadFriendList(); // 로그인 시 친구 목록 가져오기
        } else {
            // 로그아웃 시 사용자 정보 및 친구 목록 초기화
            setFriendsList([]);
        }
    }, [isAuthenticated, fetchUserInfo, loadFriendList]);


    // Google 로그인 처리 (데모)
    const handleGoogleSignIn = () => {
        // 실제 구글 로그인은 백엔드 리다이렉트 또는 OAuth 팝업을 통해 이루어집니다.
        // 여기서는 MypageApi에 정의된 redirectToGoogleLogin 함수를 호출합니다.
        // 이 함수는 실제 환경에서 Google OAuth 페이지로 리다이렉트될 것입니다.
        redirectToGoogleLogin();
        // 실제 앱에서는 리다이렉트 후 콜백 URL에서 토큰을 받아 AuthStore의 handleSocialLogin을 호출해야 합니다.
        // 현재는 데모이므로, 이 버튼 클릭 시 바로 로그인 상태로 전환하는 시뮬레이션은 하지 않습니다.
        // 실제 로그인 성공 후에는 AuthStore의 initializeAuth가 호출되어 상태가 업데이트됩니다.
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout(); // AuthStore의 logout 액션 호출
            showMessage("로그아웃되었습니다.");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            showMessage("로그아웃에 실패했습니다.");
        }
    };

    // 프로필 업데이트 처리
    const handleUpdateProfile = async () => {
        if (!user) {
            showMessage("로그인이 필요합니다.");
            return;
        }

        try {
            // AuthStore의 updateUserInformation 액션 호출
            await updateUserInformation({
                username: profileName,      // 'username' 필드로 변경
                classNum: profileClass,
            });
            showMessage("프로필이 성공적으로 업데이트되었습니다!");
            setIsEditingProfile(false); // 저장 후 수정 모드 종료
        } catch (error) {
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
            await addFriend(trimmedFriendName); // MypageApi의 addFriend 호출
            showMessage(`'${trimmedFriendName}'님을 친구로 추가했습니다!`);
            setFriendNameInput(''); // 입력 필드 초기화
            loadFriendList(); // 친구 목록 새로고침
        } catch (error: any) {
            console.error("친구 추가 실패:", error);
            // 에러 응답에 따라 메시지 표시
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
            await deleteFriend(friendIdToDelete); // MypageApi의 deleteFriend 호출
            showMessage("친구가 삭제되었습니다.");
            loadFriendList(); // 친구 목록 새로고침
        } catch (error) {
            console.error("친구 삭제 실패:", error);
            showMessage("친구 삭제에 실패했습니다.");
        }
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

                        {/* Not Logged In State */}
                        {!isAuthenticated && (
                            <div id="notLoggedIn" className="text-center space-y-6">
                                <p className="text-lg text-white text-shadow">로그인이 필요합니다.</p>
                                <button
                                    id="googleSignInBtn"
                                    onClick={handleGoogleSignIn}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl"
                                >
                                    <i className="fab fa-google mr-3"></i> Google로 로그인
                                </button>
                            </div>
                        )}

                        {/* Logged In State */}
                        {isAuthenticated && user && (
                            <div id="loggedIn" className="space-y-10 w-full">
                                <p className="text-sm text-white text-center text-shadow">사용자 ID: <span id="displayUserId" className="font-mono text-white text-xs">{user.userId}</span></p>

                                {/* Profile Section */}
                                <div className="profile-card text-center space-y-4">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">내 프로필</h2>

                                    <img
                                        id="profilePic"
                                        src={user.profileImage || "https://placehold.co/120x120/cccccc/333333?text=Profile"} // 프로필 이미지가 없을 경우 기본 이미지
                                        alt="프로필 사진"
                                        className="profile-pic mx-auto"
                                    />

                                    <div className="space-y-3">
                                        {/* 각 div에 mx-auto 추가하여 내부 input/label 묶음을 중앙 정렬 */}
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
                                        <div className="mx-auto">
                                            <label htmlFor="profileStudentId" className="block text-gray-800 text-sm font-medium">기수</label>
                                            <input
                                                type="text"
                                                id="profileStudentId"
                                                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                                                disabled={!isEditingProfile}
                                                value={profileStudentId}
                                                onChange={(e) => setProfileStudentId(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div id="profileActions" className="flex justify-center space-x-4 mt-4">
                                        {!isEditingProfile ? (
                                            <button id="editProfileBtn" onClick={() => setIsEditingProfile(true)} className="edit-button">
                                                <i className="fas fa-edit mr-2"></i> 수정
                                            </button>
                                        ) : (
                                            <>
                                                <button id="saveProfileBtn" onClick={handleUpdateProfile} className="save-button">
                                                    <i className="fas fa-save mr-2"></i> 저장
                                                </button>
                                                <button
                                                    id="cancelEditBtn"
                                                    onClick={() => {
                                                        setIsEditingProfile(false);
                                                        // 변경 사항 되돌리기 (user 상태에서 다시 로드)
                                                        if (user) {
                                                            setProfileName(user.username || ''); // user.username으로 변경
                                                            setProfileClass(user.classNum || '');
                                                            setProfileStudentId(user.ssafyYear || '');
                                                        }
                                                    }}
                                                    className="cancel-button"
                                                >
                                                    <i className="fas fa-times mr-2"></i> 취소
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
                                            <i className="fas fa-user-plus mr-2"></i> 친구 추가
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
                                                        // friend.userId는 number 타입이므로, data-friend-id에 그대로 할당
                                                        onClick={() => handleDeleteFriend(friend.userId)}
                                                        className="delete-friend-btn text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    >
                                                        <i className="fas fa-user-times"></i> 삭제
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
                                        <i className="fas fa-sign-out-alt mr-3"></i> 로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
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
