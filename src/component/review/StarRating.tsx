import React from 'react';

// --- 별점 평가 컴포넌트 ---
interface StarRatingProps {
  rating: number;
  onRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRating }) => (
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

export default StarRating;