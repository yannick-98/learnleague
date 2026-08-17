import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import type { RegisterData } from '@/types'

export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    try {
      await store.login(email, password)
      navigate('/dashboard')
      toast.success('¡Bienvenido de vuelta!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; non_field_errors?: string[] } } }
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Credenciales incorrectas'
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      await store.register(data)
      navigate('/dashboard')
      toast.success('¡Cuenta creada! Bienvenido a LearnLeague 🎉')
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            email?: string[]
            username?: string[]
            password?: string[]
            detail?: string
          }
        }
      }
      const message =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Error al crear la cuenta'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    await store.logout()
    navigate('/login')
    toast.success('Sesión cerrada correctamente')
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    register,
    logout,
    loadUser: store.loadUser,
    updateUser: store.updateUser,
  }
}
