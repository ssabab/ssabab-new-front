'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMenuStore, Menu as MenuType, Food } from '@/store/MenuStore';
import { submitFoodReviews, submitMenuReview, SubmitFoodReviewsPayload, SubmitMenuReviewPayload } from '@/api/ReviewApi';

// --- 별점 평가 컴포넌트 ---
const StarRating: React.FC<{ rating: number; onRating: (rating: number) => void }> = ({ rating, onRating }) => (
  <div className="star-rating-item flex justify-center space-x-2 text-4xl cursor-pointer">
    {[1, 2, 3, 4, 5].map((starValue) => (
      <svg
        key={starValue}
        onClick={() => onRating(starValue)}
        className={`w-10 h-10 fill-current star ${starValue <= rating ? 'filled' : ''}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L.002 9.306l8.332-1.151L12 .587z" />
      </svg>
    ))}
  </div>
);  

export default function DetailedReviewPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = Number(params.foodId);

  const { weeklyMenus, fetchWeeklyMenu, isLoading: isStoreLoading } = useMenuStore();

  const [menu, setMenu] = useState<MenuType | null>(null);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [wouldRegret, setWouldRegret] = useState<boolean | null>(null);
  const [reviewText, setReviewText] = useState('');
  
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 컴포넌트가 언마운트될 때 body 스크롤을 항상 복원하도록 보장합니다.
  useEffect(() => {
    // 이 useEffect는 마운트될 때 아무 작업도 하지 않습니다.
    // 대신, 컴포넌트가 사라질 때 실행될 클린업 함수를 반환합니다.
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []); // 의존성 배열을 비워 마운트 시 한 번만 실행되도록 합니다.

  useEffect(() => {
    if (weeklyMenus.length === 0) {
      fetchWeeklyMenu();
    }
  }, [weeklyMenus, fetchWeeklyMenu]);

  useEffect(() => {
    if (weeklyMenus.length > 0 && menuId) {
      for (const dailyMenu of weeklyMenus) {
        if (dailyMenu.menu1?.menuId === menuId) {
          setMenu(dailyMenu.menu1);
          return;
        }
        if (dailyMenu.menu2?.menuId === menuId) {
          setMenu(dailyMenu.menu2);
          return;
        }
      }
    }
  }, [weeklyMenus, menuId]);

  const handleRatingChange = (foodId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [foodId]: rating }));
  };
  
  const showMessage = (message: string) => {
    setMessageBoxText(message);
    setMessageBoxVisible(true);
    document.body.style.overflow = 'hidden';
  };

  const handleConfirm = () => {
    setMessageBoxVisible(false);
    document.body.style.overflow = 'auto';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!menu) return;

    if (wouldRegret === null) {
      showMessage("해당 메뉴 선택에 만족하시나요? 질문에 답변해주세요!");
      return;
    }

    const finalRatings: Record<number, number> = {};
    let hasZeroRating = false;
    menu.foods.forEach(food => {
      const rating = ratings[food.foodId] || 0;
      finalRatings[food.foodId] = rating;
      if (rating === 0) {
        hasZeroRating = true;
      }
    });

    if (hasZeroRating) {
      if (!window.confirm("0점인 음식이 존재합니다. 정말 제출하시겠습니까?")) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const foodReviewsPayload: SubmitFoodReviewsPayload = {
        menuId,
        reviews: Object.entries(finalRatings).map(([foodId, foodScore]) => ({
          foodId: Number(foodId),
          foodScore,
        })),
      };
      await submitFoodReviews(foodReviewsPayload);

      const totalScore = Object.values(finalRatings).reduce((sum, score) => sum + score, 0);
      const averageScore = menu.foods.length > 0 ? totalScore / menu.foods.length : 0;
      
      const menuReviewPayload: SubmitMenuReviewPayload = {
        menuId,
        menuRegret: wouldRegret,
        menuComment: reviewText.trim(),
        menuScore: parseFloat(averageScore.toFixed(2)),
      };
      await submitMenuReview(menuReviewPayload);
      
      setSubmissionSuccess(true);
      document.body.style.overflow = 'hidden';

    } catch (error) {
      console.error("평가 제출 실패:", error);
      showMessage("평가 제출에 실패했습니다. 서버 로그를 확인하거나 관리자에게 문의하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isStoreLoading) return <div className="text-center py-20 text-xl">메뉴 정보를 불러오는 중입니다...</div>;
  if (!menu) return <div className="text-center py-20 text-xl">해당 메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
       <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; overflow-x: hidden; overflow-y: auto; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
        .star-rating-item .star { color: #d1d5db; transition: color 0.2s ease; }
        .star-rating-item .star.filled { color: #fbbf24; }
        .message-box-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .message-box-overlay.visible { opacity: 1; visibility: visible; }
        .message-box-content { background-color: #fff; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); text-align: center; max-width: 400px; width: 90%; transform: scale(0.95); transition: transform 0.3s ease; }
        .message-box-overlay.visible .message-box-content { transform: scale(1); }
        .message-box-content p { font-size: 1.25rem; color: #333; margin-bottom: 1.5rem; font-weight: 600; }
        .message-box-content button { background-color: #4CAF50; color: white; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: bold; transition: background-color 0.2s ease; }
        .message-box-content button:hover { background-color: #45a049; }
        .success-dialog-button { background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: bold; transition: background-color 0.2s ease; }
        .success-dialog-button.secondary { background-color: #6b7280; }
        .success-dialog-button:hover { background-color: #2563eb; }
        .success-dialog-button.secondary:hover { background-color: #4b5563; }
        .section-gradient-green { background: linear-gradient(to bottom, #BFF090, #FFFFFF); }
        .regret-button { background-color: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; transition: all 0.2s ease; }
        .regret-button.selected { background-color: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); }
        .regret-button:hover:not(.selected) { background-color: #e5e7eb; }
        .analysis-card { background-color: #ffffff; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); padding: 1.5rem; transition: transform 0.3s ease-in-out; }
        .analysis-card:hover { transform: translateY(-5px); }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />

      {isSubmitting && (
        <div className="message-box-overlay visible">
          <div className="message-box-content">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>제출 중입니다...</p>
          </div>
        </div>
      )}

      {messageBoxVisible && (
        <div className="message-box-overlay visible" onClick={handleConfirm}>
          <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
            <p>{messageBoxText}</p>
            <button onClick={handleConfirm}>확인</button>
          </div>
        </div>
      )}

      {submissionSuccess && (
         <div className="message-box-overlay visible">
           <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
             <p className="text-2xl font-bold text-green-600 mb-2">🚀</p>
             <p>평가가 성공적으로 제출되었습니다!<br/>소중한 의견 감사합니다.</p>
             <div className="flex justify-center space-x-4 mt-6">
               <button onClick={() => router.push('/')} className="success-dialog-button secondary">
                 홈으로
               </button>
               <button onClick={() => router.push('/analysis')} className="success-dialog-button">
                 분석 보러가기
               </button>
             </div>
           </div>
         </div>
      )}

      <main className="flex-grow">
        <div className="py-16 md:py-24 px-4 section-gradient-green text-white text-center">
          <div className="container mx-auto max-w-5xl rounded-lg p-6 md:p-10 flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow text-gray-800">
              이 메뉴 어때요?
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-shadow text-gray-600">오늘의 메뉴에 대한 당신의 소중한 의견을 들려주세요.</p>
            
            <form onSubmit={handleSubmit} className="space-y-8 w-full">
              <div className="space-y-4">
                {menu.foods.map((food) => (
                  <div key={food.foodId} className="analysis-card flex justify-between items-center">
                    <div className="flex-grow text-left">
                      <label className="block text-2xl font-semibold text-gray-800">
                        {food.foodName}
                        <span className="text-gray-500 font-medium text-lg ml-2">({food.mainSub})</span>
                      </label>
                    </div>
                    <StarRating rating={ratings[food.foodId] || 0} onRating={(rating) => handleRatingChange(food.foodId, rating)} />
                  </div>
                ))}
              </div>

              <div className="analysis-card">
                <label className="block text-2xl font-bold text-gray-800 mb-4 text-center">
                  해당 메뉴 선택에 만족하시나요?
                </label>
                <div className="flex justify-center space-x-4">
                  <button type="button" onClick={() => setWouldRegret(false)} className={`regret-button flex-1 py-3 px-6 rounded-full text-lg font-semibold shadow-md flex items-center justify-center ${wouldRegret === false ? 'selected' : ''}`}>
                    <span className="mr-2 text-2xl">👍</span> 네, 다시 선택할래요.
                  </button>
                  <button type="button" onClick={() => setWouldRegret(true)} className={`regret-button flex-1 py-3 px-6 rounded-full text-lg font-semibold shadow-md flex items-center justify-center ${wouldRegret === true ? 'selected' : ''}`}>
                    <span className="mr-2 text-2xl">👏</span> 아니요, 다른거 먹을래요.
                  </button>
                </div>
              </div>

              <div className="analysis-card">
                <label htmlFor="overallReviewText" className="block text-2xl font-bold text-gray-800 mb-4 text-center">
                  간략한 한 줄 의견
                </label>
                <textarea
                  id="overallReviewText"
                  rows={6}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-800 placeholder-gray-400 resize-y"
                  placeholder="오늘의 메뉴에 대한 솔직한 의견을 작성해주세요. (선택 사항)"
                />
              </div>

              <div className="text-center mt-10">
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl tracking-wide">
                  평가 제출하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
