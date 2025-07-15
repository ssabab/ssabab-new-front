// components/review/FoodRatings.tsx
'use client';

import React from 'react';
import { Menu as MenuType } from '@/store/MenuStore';

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

interface FoodRatingsProps { // 인터페이스 이름 변경
  menu: MenuType;
  ratings: Record<number, number>;
  onRatingChange: (foodId: number, rating: number) => void;
}

const FoodRatings: React.FC<FoodRatingsProps> = ({ menu, ratings, onRatingChange }) => { // 컴포넌트 이름 변경
  return (
    <div className="space-y-4">
      {menu.foods.map((food) => (
        <div key={food.foodId} className="analysis-card flex justify-between items-center">
          <div className="flex-grow text-left">
            <label className="block text-2xl font-semibold text-gray-800">
              {food.foodName}
              <span className="text-gray-500 font-medium text-lg ml-2">({food.mainSub})</span>
            </label>
          </div>
          <StarRating rating={ratings[food.foodId] || 0} onRating={(rating) => onRatingChange(food.foodId, rating)} />
        </div>
      ))}
    </div>
  );
};

export default FoodRatings;