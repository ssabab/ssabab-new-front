// components/review/RegretQuestion.tsx
'use client';

import React from 'react';

interface RegretQuestionProps {
  wouldRegret: boolean | null;
  setWouldRegret: (value: boolean | null) => void;
}

const RegretQuestion: React.FC<RegretQuestionProps> = ({ wouldRegret, setWouldRegret }) => {
  return (
    <div className="analysis-card">
      <label className="block text-2xl font-bold text-gray-800 mb-6 text-center">
        해당 메뉴 선택에 만족하시나요?
      </label>
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setWouldRegret(false)}
          className={`regret-button flex-1 py-4 px-6 rounded-full text-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
            wouldRegret === false 
              ? 'bg-green-500 text-white border-2 border-green-600 shadow-lg' 
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <span className="mr-2 text-2xl">😊</span> 네, 만족해요!
        </button>
        <button
          type="button"
          onClick={() => setWouldRegret(true)}
          className={`regret-button flex-1 py-4 px-6 rounded-full text-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
            wouldRegret === true 
              ? 'bg-red-500 text-white border-2 border-red-600 shadow-lg' 
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <span className="mr-2 text-2xl">😞</span> 아니요, 후회해요
        </button>
      </div>
    </div>
  );
};

export default RegretQuestion;