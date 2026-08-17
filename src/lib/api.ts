import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/** Unwrap `{ success, data }` envelope or return body as-is. */
export function unwrapData<T = any>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    (body as { success?: boolean }).success !== undefined
  ) {
    return (body as { data: T }).data
  }
  return body as T
}

/** Unwrap paginated `{ results }`, `{ success, data: [] }`, or plain array. */
export function unwrapList<T = any>(body: unknown): T[] {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>
    if (Array.isArray(obj.results)) return obj.results as T[]
    if (obj.success !== undefined && Array.isArray(obj.data)) return obj.data as T[]
  }
  if (Array.isArray(body)) return body as T[]
  return []
}

export function unwrapResponse<T = any>(response: { data: unknown }): T {
  return unwrapData<T>(response.data)
}

export function unwrapListResponse<T = any>(response: { data: unknown }): T[] {
  return unwrapList<T>(response.data)
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return api.request(originalRequest)
      } catch {
        // Clear both localStorage AND Zustand store to prevent redirect loops
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        const { useAuthStore } = await import('@/stores/authStore')
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  requestPasswordReset: (email: string) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data: { uid: string; token: string; new_password: string; confirm_password: string }) =>
    api.post('/auth/password-reset/confirm/', data),
}

// ─── CLASSES ──────────────────────────────────────────────────
export const classesApi = {
  list: (params?: any) => api.get('/classes/', { params }),
  get: (id: number) => api.get(`/classes/${id}/`),
  create: (data: any) => api.post('/classes/', data),
  update: (id: number, data: any) => api.patch(`/classes/${id}/`, data),
  delete: (id: number) => api.delete(`/classes/${id}/`),
  getStats: (id: number) => api.get(`/classes/${id}/stats/`),
  getSessions: (id: number) => api.get(`/classes/${id}/sessions/`),
}

// ─── MATERIALS ────────────────────────────────────────────────
export const materialsApi = {
  list: (params?: any) => api.get('/materials/', { params }),
  get: (id: number) => api.get(`/materials/${id}/`),
  upload: (formData: FormData) =>
    api.post('/materials/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: any) => api.patch(`/materials/${id}/`, data),
  delete: (id: number) => api.delete(`/materials/${id}/`),
  reprocess: (id: number) => api.post(`/materials/${id}/reprocess/`),
  preview: (id: number) => api.get(`/materials/${id}/preview/`),
  fetchPdfBlob: (id: number) =>
    api.get(`/materials/${id}/file/`, { responseType: 'blob' }).then((res) => res.data as Blob),
}

// ─── ACTIVITIES ───────────────────────────────────────────────
export const activitiesApi = {
  list: (params?: any) => api.get('/activities/', { params }),
  get: (id: number) => api.get(`/activities/${id}/`),
  getById: (id: number) => api.get(`/activities/${id}/`),
  create: (data: any) => api.post('/activities/', data),
  update: (id: number, data: any) => api.patch(`/activities/${id}/`, data),
  delete: (id: number) => api.delete(`/activities/${id}/`),
  generateQuestions: (id: number, params: any) =>
    api.post(`/activities/${id}/generate_questions/`, params),
  duplicate: (id: number) => api.post(`/activities/${id}/duplicate/`),
  exportJson: (id: number) =>
    api.get(`/activities/${id}/export/`, { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `activity_${id}.json`; a.click()
    }),
  exportCsv: (id: number) =>
    api.get(`/activities/${id}/export_csv/`, { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `activity_${id}.csv`; a.click()
    }),
  // Questions
  listQuestions: (activityId: number) => api.get(`/activities/${activityId}/questions/`),
  createQuestion: (activityId: number, data: any) =>
    api.post(`/activities/${activityId}/questions/`, data),
  updateQuestion: (activityId: number, questionId: number, data: any) =>
    api.patch(`/activities/${activityId}/questions/${questionId}/`, data),
  deleteQuestion: (activityId: number, questionId: number) =>
    api.delete(`/activities/${activityId}/questions/${questionId}/`),
  reorderQuestions: (activityId: number, order: number[]) =>
    api.post(`/activities/${activityId}/questions/reorder/`, { order }),
  markReady: (id: number) => api.post(`/activities/${id}/mark_ready/`),
  importCsv: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/activities/${id}/import_csv/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── GAMES ────────────────────────────────────────────────────
export const gamesApi = {
  createSession: (data: any) => api.post('/games/sessions/', data),
  getSession: (id: number) => api.get(`/games/sessions/${id}/`),
  getSessionByCode: (code: string) => api.get(`/games/sessions/by_code/${code}/`),
  listSessions: (params?: any) => api.get('/games/sessions/', { params }),
  deleteSession: (id: number) => api.delete(`/games/sessions/${id}/`),
  startSession: (id: number) => api.post(`/games/sessions/${id}/start/`),
  nextQuestion: (id: number) => api.post(`/games/sessions/${id}/next_question/`),
  finishSession: (id: number) => api.post(`/games/sessions/${id}/finish/`),
  getRanking: (id: number) => api.get(`/games/sessions/${id}/ranking/`),
  getPlayers: (id: number) => api.get(`/games/sessions/${id}/players/`),
  joinGame: (code: string, data: any) => api.post(`/games/join/${code}/`, data),
}

// ─── ANALYTICS ────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard/'),
  exportDashboard: () =>
    api.get('/analytics/dashboard/export/', { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'dashboard.json'; a.click()
    }),
  getClassroom: (id: number) => api.get(`/analytics/classroom/${id}/`),
  getActivity: (id: number) => api.get(`/analytics/activity/${id}/`),
  getSession: (id: number) => api.get(`/analytics/session/${id}/`),
  exportSession: (id: number) =>
    api.get(`/analytics/session/${id}/export/`, { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `analytics_${id}.csv`; a.click()
    }),
}

export default api
