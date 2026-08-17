import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'
import type { User, RegisterData } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setTokens: (access: string, refresh: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(email, password)
          // Backend returns { success, user, tokens: { access, refresh } }
          const access = data.tokens?.access ?? data.access
          const refresh = data.tokens?.refresh ?? data.refresh

          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)

          set({
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
          })

          // User is already in the login response — use it directly
          const user = data.user
          set({ user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const { data: response } = await authApi.register(data)

          // Backend returns { success, user, tokens: { access, refresh } }
          const access = response.tokens?.access ?? response.access
          const refresh = response.tokens?.refresh ?? response.refresh

          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)

          set({
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
          })

          const user = response.user
          if (user) {
            set({ user, isLoading: false })
          } else {
            const { data: profile } = await authApi.getProfile()
            set({ user: profile, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          if (refreshToken) await authApi.logout(refreshToken)
        } catch {
          // Ignore logout errors
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          // No token — ensure store is clean to avoid stuck isAuthenticated: true
          set({ isLoading: false, isAuthenticated: false, user: null, accessToken: null, refreshToken: null })
          return
        }
        set({ isLoading: true })
        try {
          const { data: profile } = await authApi.getProfile()
          set({
            user: profile,
            isAuthenticated: true,
            accessToken: token,
            refreshToken: localStorage.getItem('refresh_token'),
            isLoading: false,
          })
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ isAuthenticated: false, accessToken: null, refreshToken: null, isLoading: false })
        }
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)
