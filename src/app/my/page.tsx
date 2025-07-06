// src/app/my/page.tsx
'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect } from 'react';
// Next.js에서 페이지 간 이동을 위해 'next/link' 컴포넌트를 사용하는 것이 일반적입니다.
// <a href="..."> 대신 <Link href="...">를 사용하는 것을 권장합니다.
// import Link from 'next/link';

export default function MyPage() {
  // --- 상태 관리 ---
  // 현재 로그인된 사용자 데이터 (더미 데이터)
  const [currentUser, setCurrentUser] = useState<any>(null);
  // 프로필 수정 모드 여부
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // 프로필 입력 필드 상태
  const [profileName, setProfileName] = useState('');
  const [profileClass, setProfileClass] = useState('');
  const [profileStudentId, setProfileStudentId] = useState('');
  // 친구 추가 입력 필드 상태
  const [friendNameInput, setFriendNameInput] = useState('');
  // 메시지 박스 상태
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');

  // --- 더미 데이터 (실제 앱에서는 API 호출 등으로 데이터를 가져옵니다) ---
  // 친구 검색을 위한 모든 등록된 사용자 시뮬레이션
  const allUsers = [
    { uid: 'user_kim', name: '김철수', class: 'A반', studentId: '1기', profilePicUrl: 'https://placehold.co/120x120/cccccc/333333?text=김철수' },
    { uid: 'user_lee', name: '이영희', class: 'B반', studentId: '2기', profilePicUrl: 'https://placehold.co/120x120/cccccc/333333?text=이영희' },
    { uid: 'user_park', name: '박민수', class: 'A반', studentId: '1기', profilePicUrl: 'https://placehold.co/120x120/cccccc/333333?text=박민수' },
    { uid: 'user_choi', name: '최지영', class: 'C반', studentId: '3기', profilePicUrl: 'https://placehold.co/120x120/cccccc/333333?text=최지영' },
    { uid: 'user_jung', name: '정우진', class: 'B반', studentId: '2기', profilePicUrl: 'https://placehold.co/120x120/cccccc/333333?text=정우진' }
  ];

  // --- 메시지 박스 함수 ---
  const showMessage = (message: string) => {
    setMessageBoxText(message);
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  };

  const hideMessage = () => {
    setMessageBoxVisible(false);
    setMessageBoxText('');
    document.body.style.overflow = 'auto'; // 스크롤 허용
  };

  // --- 인증 시뮬레이션 함수 ---
  const handleSignIn = () => {
    // 더미 사용자 데이터로 성공적인 로그인 시뮬레이션
    const dummyUser = {
      uid: 'test_user_12345',
      name: '테스트 사용자',
      class: 'A반',
      studentId: '1기',
      profilePicUrl: 'https://placehold.co/120x120/4169E1/FFFFFF?text=ME',
      friends: [
        { id: 'friend_1', friendName: '김철수', friendUid: 'user_kim' },
        { id: 'friend_2', friendName: '이영희', friendUid: 'user_lee' }
      ]
    };
    setCurrentUser(dummyUser);
    showMessage("테스트 로그인되었습니다!");
  };

  const handleSignOut = () => {
    setCurrentUser(null); // 현재 사용자 데이터 초기화
    showMessage("로그아웃되었습니다.");
  };

  // --- 프로필 관리 함수 ---
  const loadUserProfile = () => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileClass(currentUser.class);
      setProfileStudentId(currentUser.studentId);
    } else {
      setProfileName('');
      setProfileClass('');
      setProfileStudentId('');
    }
  };

  const updateProfile = () => {
    if (!currentUser) {
      showMessage("로그인이 필요합니다.");
      return;
    }

    // 로컬 currentUser 객체 업데이트
    setCurrentUser({
      ...currentUser,
      name: profileName.trim(),
      class: profileClass.trim(),
      studentId: profileStudentId.trim(),
    });
    showMessage("프로필이 성공적으로 업데이트되었습니다!");
    setIsEditingProfile(false); // 저장 후 편집 모드 비활성화
  };

  // --- 친구 목록 관리 함수 ---
  const addFriend = () => {
    if (!currentUser) {
      showMessage("로그인이 필요합니다.");
      return;
    }

    const friendName = friendNameInput.trim();
    if (!friendName) {
      showMessage("친구 이름을 입력해주세요.");
      return;
    }

    if (friendName === currentUser.name) {
      showMessage("자신을 친구로 추가할 수 없습니다.");
      return;
    }

    // 모든 사용자 중에서 친구 검색 시뮬레이션
    const foundUser = allUsers.find(user => user.name === friendName);

    if (!foundUser) {
      showMessage(`'${friendName}'이라는 이름의 사용자를 찾을 수 없습니다.`);
      return;
    }

    // 이미 친구인지 확인
    const isAlreadyFriend = currentUser.friends.some((friend: any) => friend.friendUid === foundUser.uid);
    if (isAlreadyFriend) {
      showMessage(`'${friendName}'님은 이미 친구 목록에 있습니다.`);
      return;
    }

    // 현재 사용자의 로컬 친구 목록에 친구 추가
    const newFriendId = `friend_${Date.now()}`; // 데모를 위한 간단한 고유 ID
    setCurrentUser({
      ...currentUser,
      friends: [
        ...currentUser.friends,
        {
          id: newFriendId,
          friendName: foundUser.name,
          friendUid: foundUser.uid
        }
      ]
    });
    showMessage(`'${friendName}'님을 친구로 추가했습니다!`);
    setFriendNameInput(''); // 입력 필드 초기화
  };

  const deleteFriend = (friendIdToDelete: string) => {
    if (!currentUser) {
      showMessage("로그인이 필요합니다.");
      return;
    }

    // 삭제할 친구를 로컬 배열에서 필터링
    setCurrentUser({
      ...currentUser,
      friends: currentUser.friends.filter((friend: any) => friend.id !== friendIdToDelete)
    });
    showMessage("친구가 삭제되었습니다.");
  };

  // --- UI 상태 관리 (프로필 편집 버튼 가시성) ---
  const toggleProfileEdit = (isEditing: boolean) => {
    setIsEditingProfile(isEditing);
  };

  // --- 초기 로드 및 currentUser 변경 시 UI 업데이트 ---
  useEffect(() => {
    loadUserProfile();
    // 친구 목록은 currentUser.friends가 변경될 때 자동으로 리렌더링됩니다.
  }, [currentUser]); // currentUser가 변경될 때마다 실행

  return (
    <div className="flex flex-col min-h-screen">
      {/*
        Tailwind CSS CDN 로딩과 폰트 임포트는 Next.js 프로젝트의 'src/app/layout.tsx'
        또는 'src/app/globals.css'에서 전역적으로 처리하는 것이 일반적입니다.
        여기서는 데모를 위해 직접 포함했지만, 실제 프로젝트에서는 옮기는 것을 권장합니다.
      */}
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
            /* border: 1px solid #e5e7eb; /* border-gray-200 */ /* 필요시 추가 */
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Custom Message Box */}
      <div id="messageBoxOverlay" className={`message-box-overlay ${messageBoxVisible ? 'visible' : ''}`} onClick={hideMessage}>
        <div className="message-box-content">
          <p id="messageBoxText">{messageBoxText}</p>
        </div>
      </div>

      {/* Header Section */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="/main" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</a>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/main" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">홈</a></li>
              <li><a href="/review" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">평가하기</a></li>
              <li><a href="/analysis" className="text-gray-600 hover:text-blue-600 font-medium rounded-lg">분석보기</a></li>
              <li><a href="/my" className="text-blue-600 font-bold rounded-lg">마이페이지</a></li>
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

            {/* Not Logged In State */}
            {!currentUser && (
              <div id="notLoggedIn" className="text-center space-y-6">
                <p className="text-lg text-white text-shadow">로그인이 필요합니다.</p>
                <button
                  id="googleSignInBtn"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl"
                  onClick={handleSignIn}
                >
                  <i className="fab fa-google mr-3"></i> Google로 로그인 (데모)
                </button>
              </div>
            )}

            {/* Logged In State */}
            {currentUser && (
              <div id="loggedIn" className="space-y-10 w-full">
                <p className="text-sm text-white text-center text-shadow">사용자 ID: <span id="displayUserId" className="font-mono text-white text-xs">{currentUser.uid}</span></p>

                {/* Profile Section */}
                <div className="profile-card text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">내 프로필</h2>

                  <img
                    id="profilePic"
                    src={currentUser.profilePicUrl || "https://placehold.co/120x120/cccccc/333333?text=Profile"}
                    alt="프로필 사진"
                    className="profile-pic mx-auto"
                  />

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="profileName" className="block text-gray-800 text-sm font-medium">이름</label>
                      <input
                        type="text"
                        id="profileName"
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div>
                      <label htmlFor="profileClass" className="block text-gray-800 text-sm font-medium">반</label>
                      <input
                        type="text"
                        id="profileClass"
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                        value={profileClass}
                        onChange={(e) => setProfileClass(e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div>
                      <label htmlFor="profileStudentId" className="block text-gray-800 text-sm font-medium">기수</label>
                      <input
                        type="text"
                        id="profileStudentId"
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-gray-800"
                        value={profileStudentId}
                        onChange={(e) => setProfileStudentId(e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>

                  <div id="profileActions" className="flex justify-center space-x-4 mt-4">
                    {!isEditingProfile ? (
                      <button id="editProfileBtn" className="edit-button" onClick={() => toggleProfileEdit(true)}>
                        <i className="fas fa-edit mr-2"></i> 수정
                      </button>
                    ) : (
                      <>
                        <button id="saveProfileBtn" className="save-button" onClick={updateProfile}>
                          <i className="fas fa-save mr-2"></i> 저장
                        </button>
                        <button id="cancelEditBtn" className="cancel-button" onClick={() => { loadUserProfile(); toggleProfileEdit(false); }}>
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
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg"
                      onClick={addFriend}
                    >
                      <i className="fas fa-user-plus mr-2"></i> 친구 추가
                    </button>
                  </div>

                  {/* Friend List */}
                  <div id="friendList" className="space-y-3">
                    {currentUser.friends && currentUser.friends.length === 0 ? (
                      <p className="text-gray-500 text-center" id="noFriendsMessage">친구를 추가해보세요!</p>
                    ) : (
                      currentUser.friends && currentUser.friends.map((friend: any) => (
                        <div key={friend.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm border border-gray-200">
                          <span className="text-lg font-medium text-gray-800">{friend.friendName}</span>
                          <button
                            data-friend-id={friend.id}
                            className="delete-friend-btn text-red-500 hover:text-red-700 transition-colors duration-200"
                            onClick={() => deleteFriend(friend.id)}
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
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl"
                    onClick={handleSignOut}
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
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg">문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
