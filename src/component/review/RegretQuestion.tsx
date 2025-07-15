// components/review/RegretQuestion.tsx
'use client';

import React from 'react';

interface RegretQuestionProps { // 인터페이스 이름 변경
  wouldRegret: boolean | null;
  setWouldRegret: (value: boolean | null) => void;
}

const RegretQuestion: React.FC<RegretQuestionProps> = ({ wouldRegret, setWouldRegret }) => { // 컴포넌트 이름 변경
  return (
    <div className="analysis-card">
      <label className="block text-2xl font-bold text-gray-800 mb-4 text-center">
        해당 메뉴 선택에 만족하시나요?
      </label>
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setWouldRegret(false)}
          className={`regret-button flex-1 py-3 px-6 rounded-full text-lg font-semibold shadow-md flex items-center justify-center ${wouldRegret === false ? 'selected' : ''}`}
        >
          <span className="mr-2 text-2xl">👍</span> 네, 다시 선택할래요.
        </button>
        <button
          type="button"
          onClick={() => setWouldRegret(true)}
          className={`regret-button flex-1 py-3 px-6 rounded-full text-lg font-semibold shadow-md flex items-center justify-center ${wouldRegret === true ? 'selected' : ''}`}
        >
          <span className="mr-2 text-2xl">👏</span> 아니요, 다른거 먹을래요.
        </button>
      </div>
    </div>
  );
};

export default RegretQuestion;