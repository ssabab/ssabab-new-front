import { MenuInput } from '@/api/MainApi'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export const callOCR = (payload: { images: unknown[] }) =>
  api.post('/ocr', payload, { headers: { 'X-OCR-SECRET': process.env.NEXT_PUBLIC_OCR_SECRET! } })

export const postMenus = (date: string, menus: MenuInput[]) => {
  return api.post(`/menu/${date}`, menus)
}

export interface ParsedMenu {
  date: string;
  foods: [string[], string[]];
}

export default api
