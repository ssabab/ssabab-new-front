'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { getFriends, addFriend, deleteFriend, UserInfoData } from '@/api/MypageApi';

export default function MypagePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isAuthInitialized,
    logout,
    updateUserInformation,
  } = useAuthStore();

  const router = useRouter();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileClass, setProfileClass] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const [friendsList, setFriendsList] = useState<UserInfoData[]>([]);

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

  // 비로그인 사용자 리다이렉트 제거 - 헤더에서 로그인 버튼으로 처리

  useEffect(() => {
    if (!isAuthInitialized || !isAuthenticated) return;

    if (user) {
      setProfileName(user.username || '');
      setProfileClass(user.classNum || '');
    }
  }, [user, isAuthenticated, isAuthInitialized]);

  const loadFriendList = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFriendsList([]);
      return;
    }
    try {
      const response = await getFriends();
      setFriendsList(response.data.friends);
    } catch (error) {
      showMessage("친구 목록을 불러오는 데 실패했습니다.");
    }
  }, [isAuthenticated, user, showMessage]);

  useEffect(() => {
    if (isAuthInitialized && isAuthenticated) {
      loadFriendList();
    }
  }, [isAuthenticated, isAuthInitialized, loadFriendList]);

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
    } catch (error) {
      showMessage("프로필 업데이트에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showMessage("로그아웃되었습니다.");
      router.push('/login');
    } catch (error) {
      showMessage("로그아웃에 실패했습니다.");
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
      showMessage(`${trimmedFriendName}님을 친구로 추가했습니다!`);
      setFriendNameInput('');
      loadFriendList();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "친구 추가에 실패했습니다.";
      showMessage(errorMessage);
    }
  };

  const handleDeleteFriend = async (friendId: number) => {
    if (!isAuthenticated) {
      showMessage("로그인이 필요합니다.");
      return;
    }
    try {
      await deleteFriend(friendId);
      showMessage("친구가 삭제되었습니다.");
      loadFriendList();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "친구 삭제에 실패했습니다.";
      showMessage(errorMessage);
    }
  };

  // 로딩 중이거나 초기화되지 않은 경우
  if (!isAuthInitialized || isLoading) {
    return (
      <>
        <style jsx global>{`
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
          .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        
        <div className="min-h-screen section-gradient-blue flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-shadow">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  // 비로그인 사용자를 위한 안내 페이지
  if (!isAuthenticated) {
    return (
      <>
        <style jsx global>{`
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
          .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
          .login-prompt-card { 
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          }
          .btn-primary {
            transition: all 0.3s ease-in-out;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
          }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        
        <div className="min-h-screen section-gradient-blue py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="login-prompt-card p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2 text-shadow">마이페이지</h1>
                <p className="text-gray-600 text-lg">프로필 정보와 친구 목록을 확인하려면 로그인이 필요합니다.</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 shadow-lg"
                >
                  로그인하기
                </button>
                
                <p className="text-sm text-gray-500">
                  계정이 없으신가요? Google 로그인 시 자동으로 회원가입됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
        .section-gradient-blue { background: linear-gradient(to right, #87CEEB, #ADD8E6); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        .mypage-card { 
          background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        .btn-primary {
          transition: all 0.3s ease-in-out;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
        }
        .message-box-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          background-color: rgba(0,0,0,0.6); 
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
          box-shadow: 0 10px 20px rgba(0,0,0,0.2); 
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
          background-color: #4CAF50; 
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
          background-color: #45a049; 
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen section-gradient-blue py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mypage-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-shadow">마이페이지</h1>
              <p className="text-gray-600 text-lg">프로필 정보와 친구 목록을 관리해보세요</p>
            </div>

            {/* 프로필 정보 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">프로필 정보</h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                  >
                    수정
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="btn-primary px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        if (user) {
                          setProfileName(user.username || '');
                          setProfileClass(user.classNum || '');
                        }
                      }}
                      className="btn-primary px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    ) : (
                      <p className="text-lg text-gray-900">{profileName || '정보 없음'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">반</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileClass}
                        onChange={(e) => setProfileClass(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    ) : (
                      <p className="text-lg text-gray-900">{profileClass || '정보 없음'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <p className="text-lg text-gray-500">{user?.email || '정보 없음'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SSAFY 기수</label>
                    <p className="text-lg text-gray-500">{user?.ssafyYear || '정보 없음'}</p>
                  </div>
                </div>
                {isEditingProfile && (
                  <p className="text-sm text-gray-500 mt-4">
                    * 이메일과 SSAFY 기수는 수정할 수 없습니다.
                  </p>
                )}
              </div>
            </div>

            {/* 친구 추가 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">친구 추가</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={friendNameInput}
                  onChange={(e) => setFriendNameInput(e.target.value)}
                  placeholder="친구의 닉네임을 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFriend();
                    }
                  }}
                />
                <button
                  onClick={handleAddFriend}
                  className="btn-primary px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                >
                  추가
                </button>
              </div>
            </div>

            {/* 친구 목록 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">친구 목록 ({friendsList.length}명)</h2>
              {friendsList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">아직 추가된 친구가 없습니다</p>
                  <p className="text-gray-400 text-sm mt-2">위에서 친구의 닉네임을 입력하여 친구를 추가해보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friendsList.map((friend) => (
                    <div key={friend.userId} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{friend.username}</h3>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {friend.ssafyYear}기
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {friend.classNum}반
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFriend(friend.userId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="친구 삭제"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">지역</span>
                          <span className="text-gray-700 font-medium">{friend.ssafyRegion || '대전'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 로그아웃 버튼 */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="btn-primary px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg text-lg"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 박스 */}
        {messageBoxVisible && (
          <div className="message-box-overlay visible" onClick={hideMessage}>
            <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
              <p>{messageBoxText}</p>
              <button onClick={hideMessage}>확인</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}