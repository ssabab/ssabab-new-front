import { useEffect, useState } from 'react'
import { fetchMenuCount, MenuCount } from '@/api/mockMenuCount'

export default function MenuReviewCount() {
  const [menuCounts, setMenuCounts] = useState<MenuCount[]>([])

  useEffect(() => {
    fetchMenuCount().then(setMenuCounts)
  }, [])

  // 메뉴 1, 2 정보 추출
  const menu1 = menuCounts[0]
  const menu2 = menuCounts[1]

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-shadow">캠퍼스 전체 리뷰</h2>
      <div className="w-full flex items-center justify-center gap-8 my-8">
        {/* 메뉴 1 */}
        <div
          className="
            flex flex-col items-center border rounded-xl bg-white px-8 py-6 min-w-[120px]
            shadow-lg transition-all duration-300 ease-in-out
            relative overflow-hidden group hover:scale-105
          "
        >
          {/* 핑크 배경 */}
          <div
            className="
              absolute inset-0
              bg-pink-100
              translate-y-[-100%] group-hover:translate-y-0
              transition-transform duration-300
              z-0
            "
            aria-hidden
          />
          {/* 내용 */}
          <div className="relative z-10">
            <div className="text-xl text-gray-400 mb-2">메뉴 1</div>
            <div className="text-2xl font-bold text-gray-800">{menu1 ? menu1.count : '-'}</div>
          </div>
        </div>

        {/* VS */}
        <div className="text-2xl font-black text-gray-400 mx-2 select-none">VS</div>

        {/* 메뉴 2 */}
        <div
          className="
            flex flex-col items-center border rounded-xl bg-white px-8 py-6 min-w-[120px]
            shadow-lg transition-all duration-300 ease-in-out
            relative overflow-hidden group hover:scale-105
          "
        >
          {/* 핑크 배경 */}
          <div
            className="
              absolute inset-0
              bg-green-100
              translate-y-[-100%] group-hover:translate-y-0
              transition-transform duration-300
              z-0
            "
            aria-hidden
          />
          {/* 내용 */}
          <div className="relative z-10">
            <div className="text-xl text-gray-400 mb-2">메뉴 2</div>
            <div className="text-2xl font-bold text-gray-800">{menu2 ? menu2.count : '-'}</div>
          </div>
        </div>
      </div>
    </>
  )
}
