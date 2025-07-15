// src/utils/menuUtils.ts

export const WEEKDAYS = ["월", "화", "수", "목", "금"] as const
export const MAIN_SUB_OPTIONS = ["주메뉴", "서브메뉴", "일반메뉴"] as const
export const CATEGORY_OPTIONS = ["한식", "중식", "일식", "양식"]
export const TAG_OPTIONS = ["밥", "면", "국", "생선", "고기", "야채", "기타"]

export type MainSub = typeof MAIN_SUB_OPTIONS[number]

export const safeMainSub = (value: string): MainSub =>
  MAIN_SUB_OPTIONS.includes(value as MainSub) ? (value as MainSub) : "주메뉴"

export interface ParsedMenu {
  date: string
  foods: [string[], string[]]
}

// 날짜 계산 (월~금 반환)
export function getThisWeekDates(): string[] {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function getThisWeekDate(offset: number) {
  return getThisWeekDates()[offset]
}

// 음식 초기값
export function createInitialFood(foodName = "", mainSub: string = "주메뉴") {
  return {
    foodName,
    mainSub: safeMainSub(mainSub),
    category: "한식",
    tag: "밥",
  }
}

export function createInitialMenu(foodNames: string[] = []) {
  return {
    foods: Array.from({ length: 6 }, (_, i) => createInitialFood(foodNames[i] || "")),
  }
}