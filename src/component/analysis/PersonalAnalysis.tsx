import React from 'react';
import { PersonalAnalysisData, RatingData, FoodRatingRank, CategoryStats, TagStats, ReviewWord, UserInsight, UserGroupComparison } from '@/app/analysis/page'; // 타입 임포트

interface PersonalAnalysisProps {
  data: PersonalAnalysisData | null;
}

const PersonalAnalysis: React.FC<PersonalAnalysisProps> = ({ data }) => {
  if (!data) return null; // 데이터가 없으면 아무것도 렌더링하지 않음

  const { dm_user_summary, dm_user_food_rating_rank_best, dm_user_food_rating_rank_worst, dm_user_category_stats, dm_user_tag_stats, dm_user_review_word, dm_user_insight, dm_user_group_comparison } = data;

  const maxCategoryCount = Math.max(...dm_user_category_stats.map(stat => stat.count), 0);
  const maxTagCount = Math.max(...dm_user_tag_stats.map(stat => stat.count), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 내 리뷰 요약 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">📊 내 리뷰 요약 📊</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">평균 점수</p>
            <p className="text-4xl font-bold text-purple-700 mt-1">{(dm_user_summary.avgScore?.toFixed(2)) ?? 'N/A'}</p>
            <p className="text-sm text-gray-600">/ 5</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">총 리뷰 수</p>
            <p className="text-4xl font-bold text-purple-700 mt-1">{dm_user_summary.totalReviews ?? 0}건</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">사전 투표 수</p>
            <p className="text-4xl font-bold text-purple-700 mt-1">{dm_user_summary.preVoteCount ?? 0}회</p>
          </div>
        </div>
      </div>

      {/* 가장 좋아하는 음식 TOP 5 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">💖 가장 좋아하는 음식 TOP 5 💖</h2>
        <div className="space-y-4 text-gray-800">
          {dm_user_food_rating_rank_best.map((food, index: number) => (
            <div key={index} className="flex items-center bg-pink-50 p-3 rounded-lg">
              <span className="flex-1 text-left font-semibold text-pink-700 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{food.foodName}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
              </div>
              <span className="text-right text-sm font-bold text-red-600 whitespace-nowrap ml-2">{food.foodScore.toFixed(1)}점</span>
            </div>
          ))}
        </div>
      </div>

      {/* 가장 싫어하는 음식 WORST 5 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🤢 가장 싫어하는 음식 WORST 5 🤢</h2>
        <div className="space-y-4 text-gray-800">
          {dm_user_food_rating_rank_worst.map((food, index: number) => (
            <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
              <span className="flex-1 text-left font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{food.foodName}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-gray-500 h-3 rounded-full" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
              </div>
              <span className="text-right text-sm font-bold text-gray-600 whitespace-nowrap ml-2">{food.foodScore.toFixed(1)}점</span>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리별 리뷰 통계 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📋 카테고리별 리뷰 통계 📋</h2>
        <div className="space-y-4 text-gray-800">
          {dm_user_category_stats.map((stat, index: number) => (
            <div key={index} className="flex items-center bg-blue-50 p-3 rounded-lg">
              <span className="flex-1 text-left font-semibold text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{stat.category}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(stat.count / maxCategoryCount) * 100}%` }}></div>
              </div>
              <span className="text-right text-sm font-bold text-blue-600 whitespace-nowrap ml-2">{stat.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* 태그별 리뷰 통계 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🏷️ 태그별 리뷰 통계 🏷️</h2>
        <div className="space-y-4 text-gray-800">
          {dm_user_tag_stats.map((stat, index: number) => (
            <div key={index} className="flex items-center bg-green-50 p-3 rounded-lg">
              <span className="flex-1 text-left font-semibold text-green-700 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{stat.tag}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(stat.count / maxTagCount) * 100}%` }}></div>
              </div>
              <span className="text-right text-sm font-bold text-green-600 whitespace-nowrap ml-2">{stat.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* 자주 사용한 리뷰 단어 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">💬 자주 사용한 리뷰 단어 💬</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {dm_user_review_word.map((word, index: number) => (
            <div key={index} className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center">
              <span>{word.word}</span>
              <span className="ml-2 text-indigo-600 font-bold">{word.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* 나의 식습관 인사이트 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">💡 나의 식습관 인사이트 💡</h2>
        <p className="text-lg text-gray-800 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 italic">"{dm_user_insight.insight}"</p>
      </div>

      {/* 전체 사용자 그룹 비교 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🧑‍🤝‍🧑 전체 사용자 그룹 비교 🧑‍🤝‍🧑</h2>
        {/* 다양성 점수 섹션을 제거하고 평균 점수만 중앙에 표시 */}
        <div className="flex flex-col items-center p-4 bg-teal-50 rounded-lg shadow-sm max-w-sm mx-auto"> {/* max-w-sm과 mx-auto로 중앙 정렬 */}
            <p className="text-sm text-gray-600">평균 점수 (나 / 그룹)</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">
              {(dm_user_group_comparison.userAvgScore?.toFixed(2) ?? 'N/A')} / {(dm_user_group_comparison.groupAvgScore?.toFixed(2) ?? 'N/A')}
            </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalAnalysis;