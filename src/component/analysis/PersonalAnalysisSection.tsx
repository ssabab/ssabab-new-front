import React from 'react';

// 개인 분석 (Personal Analysis) 관련 타입
export interface RatingData {
  userId: number;
  avgScore: number;
  totalReviews: number;
  preVoteCount: number;
}

export interface FoodRatingRank {
  userId: number;
  foodName: string;
  foodScore: number;
  rankOrder: number;
  scoreType: 'best' | 'worst';
}

export interface CategoryStats {
  userId: number;
  category: string;
  count: number;
}

export interface TagStats {
  userId: number;
  tag: string;
  count: number;
}

export interface ReviewWord {
  userId: number;
  word: string;
  count: number;
}

export interface UserInsight {
  userId: number;
  insight: string | null;
}

export interface UserGroupComparison {
  userId: number;
  groupType: string;
  userAvgScore: number | null;
  userDiversityScore: number | null;
  groupAvgScore: number | null;
  groupDiversityScore: number | null;
}

export interface PersonalAnalysisData {
  dm_user_summary: RatingData;
  dm_user_food_rating_rank_best: FoodRatingRank[];
  dm_user_food_rating_rank_worst: FoodRatingRank[];
  dm_user_category_stats: CategoryStats[];
  dm_user_tag_stats: TagStats[];
  dm_user_review_word: ReviewWord[];
  dm_user_insight: UserInsight;
  dm_user_group_comparison: UserGroupComparison;
}

interface PersonalAnalysisSectionProps {
  data: PersonalAnalysisData | null;
}

export default function PersonalAnalysisSection({ data }: PersonalAnalysisSectionProps) {
  if (!data) return null;

  const { dm_user_summary, dm_user_food_rating_rank_best, dm_user_food_rating_rank_worst, dm_user_category_stats, dm_user_tag_stats, dm_user_review_word, dm_user_insight, dm_user_group_comparison } = data;

  const maxCategoryCount = Math.max(...dm_user_category_stats.map(stat => stat.count), 0);
  const maxTagCount = Math.max(...dm_user_tag_stats.map(stat => stat.count), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="analysis-card col-span-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">내 리뷰 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg text-black text-center">
          <p><strong>평균 점수:</strong><br/>{(dm_user_summary.avgScore?.toFixed(2)) ?? 'N/A'} / 5</p>
          <p><strong>총 리뷰 수:</strong><br/>{dm_user_summary.totalReviews ?? 0}건</p>
          <p><strong>사전 투표 수:</strong><br/>{dm_user_summary.preVoteCount ?? 0}회</p>
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">가장 좋아하는 음식 TOP 5</h2>
        <div className="space-y-3 text-gray-800">
          {dm_user_food_rating_rank_best.map((food, index: number) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.foodName}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-blue" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.foodScore.toFixed(1)}점</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">가장 싫어하는 음식 WORST 5</h2>
        <div className="space-y-3 text-gray-800">
          {dm_user_food_rating_rank_worst.map((food, index: number) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.foodName}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-green" style={{ width: `${(food.foodScore / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.foodScore.toFixed(1)}점</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">카테고리별 리뷰 통계</h2>
        <div className="space-y-3 text-gray-800">
          {dm_user_category_stats.map((stat, index: number) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{stat.category}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-blue" style={{ width: `${(stat.count / maxCategoryCount) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{stat.count}회</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">태그별 리뷰 통계</h2>
          <div className="space-y-3 text-gray-800">
            {dm_user_tag_stats.map((stat, index: number) => (
              <div key={index} className="flex items-center">
                <span className="w-1/4 text-left font-medium">{stat.tag}</span>
                <div className="w-2/4 graph-bar-container">
                  <div className="graph-bar bar-green" style={{ width: `${(stat.count / maxTagCount) * 100}%` }}></div>
                </div>
                <span className="w-1/4 text-right text-sm font-semibold">{stat.count}회</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">자주 사용한 리뷰 단어</h2>
          <ul className="list-disc list-inside space-y-2 text-lg flex flex-wrap gap-x-4 text-gray-800">
            {dm_user_review_word.map((word, index: number) => (
              <li key={index}><strong>{word.word}</strong>: {word.count}회</li>
            ))}
          </ul>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">나의 식습관 인사이트</h2>
          <p className="text-lg text-gray-800">{dm_user_insight.insight}</p>
        </div>

        <div className="analysis-card col-span-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">전체 사용자 그룹 비교</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800 text-center">
            <p><strong>평균 점수 (나/그룹):</strong><br/>{dm_user_group_comparison.userAvgScore?.toFixed(2) ?? 'N/A'} / {dm_user_group_comparison.groupAvgScore?.toFixed(2) ?? 'N/A'}</p>
            <p><strong>다양성 점수 (나/그룹):</strong><br/>{dm_user_group_comparison.userDiversityScore?.toFixed(1) ?? 'N/A'} / {dm_user_group_comparison.groupDiversityScore?.toFixed(1) ?? 'N/A'}</p>
          </div>
        </div>
      </div>
  );
}