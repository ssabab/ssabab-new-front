import axios from 'axios'

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: '*/*',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = getCookieValue('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 사전투표 등록 (POST /api/vote)
export const submitPreVote = async (menuId: number) => {
  return await api.post('/api/vote', { menuId })
}

// 현재 사용자 사전투표 조회 (GET /api/vote?date=YYYY-MM-DD)
export const getMyPreVote = async (date: string) => {
  return await api.get('/api/vote', {
    params: { date },
  })
}

// 친구들의 사전투표 결과 조회 (GET /api/vote/friends?date=YYYY-MM-DD)
export const getFriendsPreVote = async (date: string) => {
  return await api.get('/api/vote/friends', {
    params: { date },
  })
}
