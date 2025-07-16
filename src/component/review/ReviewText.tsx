// components/review/ReviewText.tsx
'use client';

import React from 'react';

interface ReviewTextProps { // 인터페이스 이름 변경
  reviewText: string;
  setReviewText: (value: string) => void;
}

const ReviewText: React.FC<ReviewTextProps> = ({ reviewText, setReviewText }) => { // 컴포넌트 이름 변경
  return (
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
  );
};

export default ReviewText;