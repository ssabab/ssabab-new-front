import React from 'react';

// 월간 분석 (Monthly Analysis) 관련 타입
export interface TopFood {
  name: string;
  reviews: number;
  rating: number;
}

export interface MonthlyVisitors {
  current: number;
  previous: number;
  totalCumulative: number;
  previousMonthCumulative: number;
}

export interface CumulativeEvaluations {
  currentMonth: number;
  totalCumulative: number;
  previousMonthCumulative: number;
}

export interface RatingDistribution {
  min: number;
  max: number;
  avg: number;
  iqrStart: number;
  iqrEnd: number;
  variance: number;
  stdDev: number;
}

export interface FrequentVisitor {
  name: string;
  visits: number;
  lastVisit: string;
}

export interface MonthlyOverallRating {
  average: number;
  totalEvaluations: number;
}

export interface MonthlyAnalysisData {
  topFoods: TopFood[];
  worstFoods: TopFood[];
  monthlyVisitors: MonthlyVisitors;
  cumulativeEvaluations: CumulativeEvaluations;
  ratingDistribution: RatingDistribution;
  frequentVisitors: FrequentVisitor[];
  monthlyOverallRating: MonthlyOverallRating;
}

interface MonthlyAnalysisSectionProps {
  data: MonthlyAnalysisData | null;
}

export default function MonthlyAnalysisSection({ data }: MonthlyAnalysisSectionProps) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="analysis-card col-span-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">월간 통계 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-800">
          <p><strong>이번 달 방문자:</strong> {data.monthlyVisitors.current}명 (지난 달 {data.monthlyVisitors.previous}명)</p>
          <p><strong>총 누적 방문자:</strong> {data.monthlyVisitors.totalCumulative}명</p>
          <p><strong>이번 달 평가 수:</strong> {data.cumulativeEvaluations.currentMonth}건</p>
          <p><strong>총 누적 평가 수:</strong> {data.cumulativeEvaluations.totalCumulative}건</p>
          <p><strong>월간 평균 별점:</strong> {data.monthlyOverallRating.average.toFixed(2)} / 5</p>
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">이번 달 TOP 5 음식</h2>
        <div className="space-y-3 text-gray-800">
          {data.topFoods.map((food, index: number) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.name}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-orange" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.rating}점 ({food.reviews}개 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">이번 달 WORST 5 음식</h2>
        <div className="space-y-3 text-gray-800">
          {data.worstFoods.map((food, index: number) => (
            <div key={index} className="flex items-center">
              <span className="w-1/4 text-left font-medium">{food.name}</span>
              <div className="w-2/4 graph-bar-container">
                <div className="graph-bar bar-yellow" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              <span className="w-1/4 text-right text-sm font-semibold">{food.rating}점 ({food.reviews}개 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card col-span-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">자주 방문한 사용자</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-800">
          {data.frequentVisitors.map((visitor, index: number) => (
            <li key={index}><strong>{visitor.name}</strong>: {visitor.visits}회 방문 (마지막 방문: {visitor.lastVisit})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}