'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { signup, checkUsernameExists, SignupPayload } from '@/api/MypageApi';

// Suspense 내부에서 실행될 실제 회원가입 컴포넌트
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isAuthInitialized } = useAuthStore();

  // 폼 상태
  const [formData, setFormData] = useState<Partial<SignupPayload>>({
    email: '',
    provider: 'google',
    providerId: '',
    profileImage: '',
    name: '',
    username: '',
    ssafyYear: '',
    classNum: '',
    ssafyRegion: '대전',
    gender: 'M',
    birthDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthInitialized && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isAuthInitialized, router]);

  // URL 파라미터에서 OAuth 정보 추출
  useEffect(() => {
    const email = searchParams.get('email');
    const providerId = searchParams.get('providerId');
    const profileImage = searchParams.get('profileImage');
    const name = searchParams.get('name');

    if (email && providerId && name) {
      setFormData(prev => ({
        ...prev,
        email: decodeURIComponent(email),
        providerId: decodeURIComponent(providerId),
        profileImage: profileImage ? decodeURIComponent(profileImage) : '',
        name: decodeURIComponent(name),
        // username은 빈칸으로 유지하여 사용자가 직접 입력하도록 함
      }));
    }
  }, [searchParams]);

  // 생년월일 자동 포맷팅 함수
  const formatBirthDate = (value: string): string => {
    // 숫자만 추출
    const numbersOnly = value.replace(/\D/g, '');
    
    // 8자리 숫자인 경우 YYYY-MM-DD 형식으로 변환
    if (numbersOnly.length === 8) {
      const year = numbersOnly.slice(0, 4);
      const month = numbersOnly.slice(4, 6);
      const day = numbersOnly.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    
    // 8자리가 아니면 원본 반환
    return value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // 생년월일 필드인 경우 자동 포맷팅 적용
    if (name === 'birthDate') {
      processedValue = formatBirthDate(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // 사용자명 변경시 중복 체크 상태 초기화
    if (name === 'username') {
      setUsernameChecked(false);
      setUsernameAvailable(false);
    }
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUsernameCheck = async () => {
    if (!formData.username) {
      setErrors(prev => ({ ...prev, username: '사용자명을 입력해주세요.' }));
      return;
    }

    try {
      setIsLoading(true);
      const response = await checkUsernameExists(formData.username);
      const exists = response.data;
      
      setUsernameAvailable(!exists);
      setUsernameChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, username: '이미 사용 중인 사용자명입니다.' }));
      } else {
        setErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.error('사용자명 중복 확인 실패:', error);
      setErrors(prev => ({ ...prev, username: '사용자명 확인 중 오류가 발생했습니다.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = '사용자명을 입력해주세요.';
    if (!usernameChecked || !usernameAvailable) newErrors.username = '사용자명 중복 확인을 완료해주세요.';
    if (!formData.ssafyYear) newErrors.ssafyYear = 'SSAFY 기수를 입력해주세요.';
    if (!formData.classNum) newErrors.classNum = '반 번호를 입력해주세요.';
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      newErrors.birthDate = '올바른 날짜 형식으로 입력해주세요. (예: 20001225)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // 백엔드 전송용 데이터 (기수와 반은 숫자로만 전송)
      const formattedData = {
        ...formData,
        ssafyYear: formData.ssafyYear || '',
        classNum: formData.classNum || '',
      };
      
      const response = await signup(formattedData as SignupPayload);
      
      // 회원가입 성공 시 토큰 저장은 interceptor에서 처리
      alert('회원가입이 완료되었습니다!');
      router.push('/');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      alert(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthInitialized || isAuthenticated) {
    return (
      <>
        <style jsx global>{`
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
          .section-gradient-sunset { background: linear-gradient(to right, #FF7E5F, #FEB47B); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        
        <div className="min-h-screen section-gradient-sunset flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-shadow">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
        .section-gradient-sunset { background: linear-gradient(to right, #FF7E5F, #FEB47B); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        .signup-card { 
          background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        .form-input:focus { 
          ring: 2px; 
          ring-color: rgb(249 115 22); 
          border-color: rgb(249 115 22); 
          outline: none;
        }
        .btn-primary {
          transition: all 0.3s ease-in-out;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen section-gradient-sunset py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="signup-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-shadow">SSABAB 회원가입</h1>
              <p className="text-gray-600 text-lg">추가 정보를 입력하여 회원가입을 완료해주세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OAuth 정보 (읽기 전용) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* 사용자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사용자명 *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="원하는 닉네임을 입력해주세요 (영문, 숫자, 언더스코어)"
                    className="form-input flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleUsernameCheck}
                    disabled={isLoading || !formData.username}
                    className="btn-primary px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap shadow-lg"
                  >
                    중복확인
                  </button>
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                {usernameChecked && usernameAvailable && (
                  <p className="text-green-500 text-sm mt-1">사용 가능한 사용자명입니다.</p>
                )}
              </div>

              {/* SSAFY 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SSAFY 기수 *</label>
                  <input
                    type="number"
                    name="ssafyYear"
                    value={formData.ssafyYear}
                    onChange={handleInputChange}
                    placeholder="12"
                    min="1"
                    max="99"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  />
                  {errors.ssafyYear && <p className="text-red-500 text-sm mt-1">{errors.ssafyYear}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">반 *</label>
                  <input
                    type="number"
                    name="classNum"
                    value={formData.classNum}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    max="20"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  />
                  {errors.classNum && <p className="text-red-500 text-sm mt-1">{errors.classNum}</p>}
                </div>
              </div>

              {/* 개인 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별 *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생년월일 *</label>
                  <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    placeholder="20001225 (8자리 숫자 입력)"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">예: 20001225 입력 시 2000-12-25로 자동 변환</p>
                  {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                </div>
              </div>

              {/* 제출 버튼 */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 shadow-lg text-lg"
                >
                  {isLoading ? '처리 중...' : '회원가입 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// 로딩 폴백 컴포넌트
function SignupLoading() {
  return (
    <>
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; overflow-x: hidden; }
        .section-gradient-sunset { background: linear-gradient(to right, #FF7E5F, #FEB47B); }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen section-gradient-sunset flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-shadow">회원가입 페이지를 불러오는 중...</p>
        </div>
      </div>
    </>
  );
}

// 메인 컴포넌트 - Suspense로 감싸기
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}