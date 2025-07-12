import axios from 'axios'

export interface MenuCount {
  menuId: number
  count: number
}

export async function fetchMenuCount(): Promise<MenuCount[]> {
  const res = await axios.get<MenuCount[]>('http://localhost:4000/menuCount')
  return res.data
}
