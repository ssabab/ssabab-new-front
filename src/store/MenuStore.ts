import { create } from 'zustand';
import { getWeeklyMenu } from '@/api/ReviewApi';

// --- 타입 정의 ---

export interface Food {
  foodId: number;
  foodName: string;
  mainSub: '주메뉴' | '서브메뉴' | '일반메뉴';
  category: string;
  tag: string;
}

export interface Menu {
  menuId: number | null;
  foods: Food[];
}

export interface DailyMenu {
  date: string;
  menu1: Menu;
  menu2: Menu;
}

// --- 날짜 헬퍼 함수 ---

/**
 * 주어진 날짜가 속한 주의 월요일과 일요일을 반환합니다.
 * @param date 기준 날짜
 */
export const getWeekBoundary = (date: Date): { start: Date, end: Date } => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diffToMonday));
  start.setHours(0, 0, 0, 0); // 날짜의 시작 시간으로 설정
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999); // 날짜의 끝 시간으로 설정
  return { start, end };
};

/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 * @param date 변환할 Date 객체
 */
export const toYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// --- Zustand 스토어 인터페이스 ---

interface WeeklyMenuState {
  weeklyMenus: DailyMenu[];
  selectedDate: Date;
  selectedDateMenu: DailyMenu | null;
  weekBoundary: { start: Date; end: Date };
  isLoading: boolean;
  error: string | null;
  fetchWeeklyMenu: () => Promise<void>;
  selectDate: (date: Date) => void;
}

// --- Zustand 스토어 생성 ---

export const useMenuStore = create<WeeklyMenuState>((set, get) => ({
  weeklyMenus: [],
  selectedDate: new Date(),
  selectedDateMenu: null,
  weekBoundary: getWeekBoundary(new Date()),
  isLoading: false,
  error: null,
  fetchWeeklyMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getWeeklyMenu();
      const today = new Date();
      const todayStr = toYYYYMMDD(today);
      const todayMenu = response.weeklyMenus.find(menu => menu.date === todayStr) || null;

      set({
        weeklyMenus: response.weeklyMenus,
        selectedDate: today,
        selectedDateMenu: todayMenu,
        weekBoundary: getWeekBoundary(today),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch weekly menu:", error);
      set({ error: '주간 메뉴를 불러오는 데 실패했습니다.', isLoading: false });
    }
  },
  selectDate: (date: Date) => {
    const { weeklyMenus, weekBoundary } = get();
    // 현재 보고 있는 주를 벗어나는 날짜는 선택하지 않음
    if (date < weekBoundary.start || date > weekBoundary.end) {
      return;
    }

    const dateStr = toYYYYMMDD(date);
    const menuForDate = weeklyMenus.find(menu => menu.date === dateStr) || null;
    set({ selectedDate: date, selectedDateMenu: menuForDate });
  },
}));