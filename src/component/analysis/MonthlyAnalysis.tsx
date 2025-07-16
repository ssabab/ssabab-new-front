import React from 'react';
import { MonthlyAnalysisData, TopFood, MonthlyVisitors, CumulativeEvaluations, RatingDistribution, FrequentVisitor, MonthlyOverallRating } from '@/app/analysis/page'; // 타입 임포트

interface MonthlyAnalysisProps {
  data: MonthlyAnalysisData | null;
}

const MonthlyAnalysis: React.FC<MonthlyAnalysisProps> = ({ data }) => {
  if (!data) return null; // 데이터가 없으면 아무것도 렌더링하지 않음

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 월간 현황 요약 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">✨ 월간 현황 요약 ✨</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-lg text-gray-800">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">이번 달 방문자</p>
            <p className="text-4xl font-bold text-indigo-600 mt-1">{data.monthlyVisitors.current}명</p>
            <p className="text-sm text-gray-600 mt-1">(지난 달 {data.monthlyVisitors.previous}명)</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">총 누적 방문자</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{data.monthlyVisitors.totalCumulative}명</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">이번 달 평가 수</p>
            <p className="text-4xl font-bold text-purple-600 mt-1">{data.cumulativeEvaluations.currentMonth}건</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">총 누적 평가 수</p>
            <p className="text-4xl font-bold text-red-600 mt-1">{data.cumulativeEvaluations.totalCumulative}건</p>
          </div>
        </div>
        <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-700">
                ⭐ 월간 평균 별점: <span className="text-indigo-700 font-bold text-2xl">{data.monthlyOverallRating.average.toFixed(2)}</span> / 5
            </p>
        </div>
      </div>

      {/* 이번 달 인기 메뉴 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🏆 이번 달 인기 메뉴 (TOP 5) 🏆</h2>
        <div className="space-y-4 text-gray-800">
          {data.topFoods.map((food, index: number) => (
            <div key={index} className="flex items-center bg-blue-50 p-3 rounded-lg">
              {/* 음식 이름: 남은 공간을 유연하게 채우도록 flex-1 적용 */}
              <span className="flex-1 text-left font-semibold text-blue-800 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{food.name}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              {/* 점수 및 리뷰: 남은 공간을 유연하게 채우도록 flex-1 적용 */}
              <span className="flex-1 text-right text-sm font-bold text-orange-600 whitespace-nowrap ml-2">{food.rating}점 ({food.reviews} 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 개선이 필요한 메뉴 */}
      <div className="analysis-card p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📉 개선이 필요한 메뉴 (WORST 5) 📉</h2>
        <div className="space-y-4 text-gray-800">
          {data.worstFoods.map((food, index: number) => (
            <div key={index} className="flex items-center bg-red-50 p-3 rounded-lg">
              {/* 음식 이름: 남은 공간을 유연하게 채우도록 flex-1 적용 */}
              <span className="flex-1 text-left font-semibold text-red-800 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{food.name}</span>
              <div className="w-1/3 bg-gray-200 rounded-full h-3 mx-2">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(food.rating / 5) * 100}%` }}></div>
              </div>
              {/* 점수 및 리뷰: 남은 공간을 유연하게 채우도록 flex-1 적용 */}
              <span className="flex-1 text-right text-sm font-bold text-yellow-600 whitespace-nowrap ml-2">{food.rating}점 ({food.reviews} 리뷰)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 명예의 전당 */}
      <div className="analysis-card col-span-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🌟 명예의 전당 🌟</h2>
        <ul className="list-none space-y-3 text-lg text-gray-800">
          {data.frequentVisitors.map((visitor, index: number) => (
            <li key={index} className="flex justify-between items-center bg-green-50 p-3 rounded-lg shadow-sm">
              <span className="font-semibold text-green-800">{visitor.name}</span>
              <span className="text-gray-700">{visitor.visits}회 방문 (마지막 방문: <span className="font-medium">{visitor.lastVisit}</span>)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MonthlyAnalysis;