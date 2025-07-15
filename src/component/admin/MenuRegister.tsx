import { MenuInput } from "@/api/MainApi";
import {
  CATEGORY_OPTIONS,
  MAIN_SUB_OPTIONS,
  MainSub,
  ParsedMenu,
  TAG_OPTIONS,
  WEEKDAYS,
  createInitialMenu,
  getThisWeekDate
} from "@/utils/menuUtils";
import { useEffect, useState } from "react";

interface WeekMenu {
  date: string
  menus: MenuInput[]
}

export default function MenuRegister({ ocrMenus }: { ocrMenus?: ParsedMenu[] }) {
  const [weekMenus, setWeekMenus] = useState<WeekMenu[]>(
    () => createInitialMenusFromParsed(ocrMenus)
  )
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""

  useEffect(() => {
    setWeekMenus(createInitialMenusFromParsed(ocrMenus))
  }, [ocrMenus])

  function createInitialMenusFromParsed(ocrMenus?: ParsedMenu[]): WeekMenu[] {
    return Array.from({ length: 5 }, (_, i) => ({
      date: ocrMenus?.[i]?.date || getThisWeekDate(i),
      menus: [
        createInitialMenu(ocrMenus?.[i]?.foods?.[0] || []),
        createInitialMenu(ocrMenus?.[i]?.foods?.[1] || []),
      ],
    }))
  }


  const handleChange = (dayIdx: number, menuIdx: number, foodIdx: number, key: string, value: string) => {
    setWeekMenus(prev =>
      prev.map((dayMenu, d) =>
        d === dayIdx
          ? {
              ...dayMenu,
              menus: dayMenu.menus.map((menu, m) =>
                m === menuIdx
                  ? {
                      foods: menu.foods.map((food, f) =>
                        f === foodIdx ? { ...food, [key]: value } : food
                      ),
                    }
                  : menu
              ),
            }
          : dayMenu
      )
    )
  }

  // weekMenus: 5일치(월~금) × 2메뉴
  const handleRegisterWeek = async () => {
    setIsLoading(true)
    try {
      for (let dayIdx = 0; dayIdx < weekMenus.length; dayIdx++) {
        const { date, menus } = weekMenus[dayIdx]
        const payload = menus
          .map(menu => ({
            foods: menu.foods
              .filter(f => f.foodName.trim() !== "")
              .map(f => ({
                foodName: f.foodName,
                mainSub: f.mainSub,
                category: f.category,
                tag: f.tag,
              })),
          }))
          .filter(menu => menu.foods.length > 0)
        if (payload.length > 0) {
          // 실제 등록 API 호출 (주석처리, 필요시 해제)
          // await api.post(`/api/menu/${date}`, payload, {
          //   headers: {
          //     Authorization: `Bearer ${accessToken}`,
          //     "Content-Type": "application/json",
          //   },
          // })
          console.log(date, payload, accessToken)
        }
      }
      alert("주간 메뉴 등록 완료!")
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.")
      console.error(err)
    }
    setIsLoading(false)
  }

  return (
    <div>
      {weekMenus.map((dayMenu, dayIdx) => (
        <div key={dayMenu.date} className="border rounded p-2 mb-4">
          <div className="font-bold mb-1">{WEEKDAYS[dayIdx] || dayMenu.date}</div>
          {dayMenu.menus.map((menu, menuIdx) => (
            <div key={menuIdx} className="mb-2">
              <div className="font-semibold">메뉴 {menuIdx + 1}</div>
              {menu.foods.map((food, foodIdx) => (
                <div key={foodIdx} className="flex gap-2 items-center mb-1">
                  <input
                    className="border p-1 rounded w-28"
                    value={food.foodName}
                    placeholder="음식명"
                    onChange={e =>
                      handleChange(dayIdx, menuIdx, foodIdx, "foodName", e.target.value)
                    }
                  />
                  <select
                    value={food.mainSub}
                    onChange={e =>
                      handleChange(dayIdx, menuIdx, foodIdx, "mainSub", e.target.value as MainSub)
                    }
                  >
                    {MAIN_SUB_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <select
                    value={food.category}
                    onChange={e =>
                      handleChange(dayIdx, menuIdx, foodIdx, "category", e.target.value)
                    }
                  >
                    {CATEGORY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <select
                    value={food.tag}
                    onChange={e =>
                      handleChange(dayIdx, menuIdx, foodIdx, "tag", e.target.value)
                    }
                  >
                    {TAG_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleRegisterWeek}
        className="bg-black text-white rounded px-4 py-2 mt-2"
        disabled={isLoading}
      >
        {isLoading ? "등록 중..." : "주간 메뉴 등록"}
      </button>
    </div>
  )
}