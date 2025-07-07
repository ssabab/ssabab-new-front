// 타입 정의
export interface Food {
  foodId: number;
  foodName: string;
  mainSub: '주메뉴' | '서브메뉴' | '일반메뉴';
  category: string;
  tag: string;
}

export interface Menu {
  menuId: number;
  foods: Food[];
}

export type MenuResponse = Menu[];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// API 함수
export const getMenuByDate = async (date: string): Promise<MenuResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu?date=${date}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('메뉴 데이터를 가져오는 중 오류가 발생했습니다:', error);
    throw error;
  }
};

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환하는 유틸리티 함수
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
