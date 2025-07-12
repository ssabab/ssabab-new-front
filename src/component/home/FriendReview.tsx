'use client'

import { useState, useEffect, useRef } from 'react'
import { getFriendsMenuReviews, FriendReview } from '@/api/ReviewApi'

export default function FriendsReviewList({ date }: { date: string }) {
  const [reviews, setReviews] = useState<FriendReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getFriendsMenuReviews(date)
      .then((data) => setReviews(data))
      .catch(() => setError('친구 리뷰 정보를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [date])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX
    scrollStart.current = scrollRef.current.scrollLeft
  }

  const onMouseUpOrLeave = () => {
    isDragging.current = false
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    const dx = e.pageX - startX.current
    scrollRef.current.scrollLeft = scrollStart.current - dx
  }

  return (
    <section className="p-4 lg:px-[100px] xl:px-[400px]">
      <h2 className="text-3xl font-bold mb-4 text-shadow">친구들의 리뷰</h2>
      {loading ? (
        <div className="text-gray-500">리뷰를 불러오는 중...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-500">친구가 없거나 아직 리뷰가 없습니다.</div>
      ) : (
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
          onMouseMove={onMouseMove}
          className="scroll-hide overflow-x-auto select-none"
        >
          <div className="flex justify-center space-x-4 w-fit mx-auto">
            {reviews.map((review, idx) => {
              const isFirstMenu = review.votedMenuId % 2 === 1
              return (
                <div
                  key={`${review.friendId}-${idx}`}
                  className={`min-w-[200px] p-4 bg-white rounded-lg transition-shadow duration-300 
              flex flex-col justify-between 
              border-4
              ${isFirstMenu ? 'border-pink-200 text-pink-700' : 'border-green-200 text-green-700'} 
              shadow-lg hover:shadow-xl`}
                >
                  <div className="text-xl text-base font-bold mb-2">{review.friendName}</div>
                  <h2 className="mb-1">
                    <span className="font-semibold">
                      메뉴 {review.votedMenuId % 2 === 0 ? '2' : '1'}
                    </span>
                  </h2>
                  <div className="text-sm mb-1">
                    <strong>{review.averageMenuScore.toFixed(1)} 점</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}