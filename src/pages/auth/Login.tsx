import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, FlaskConical } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const DEMO_EMAIL = 'teacher@learnleague.demo'
const DEMO_PASSWORD = 'Demo1234!'

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login, isLoading } = useAuth()
  const location = useLocation()
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const message = (location.state as { message?: string } | null)?.message
    if (message) toast.success(message)
  }, [location.state])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
    } catch {
      setError('root', { message: 'Credenciales incorrectas. Verifica tu correo y contraseña.' })
    }
  }

  const fillDemo = () => {
    setValue('email', DEMO_EMAIL)
    setValue('password', DEMO_PASSWORD)
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Bienvenido de vuelta a LearnLeague"
    >
      {/* Demo banner */}
      <button
        type="button"
        onClick={fillDemo}
        className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left mb-4"
      >
        <FlaskConical size={16} className="flex-shrink-0 text-amber-600" />
        <div>
          <span className="font-semibold">Probar con cuenta demo</span>
          <span className="text-amber-600 ml-1">— haz clic para rellenar automáticamente</span>
        </div>
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {errors.root.message}
          </div>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.es"
          error={errors.email?.message}
          required
          autoComplete="email"
          leftIcon={<Mail size={14} />}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          placeholder="Tu contraseña"
          error={errors.password?.message}
          required
          autoComplete="current-password"
          leftIcon={<Lock size={14} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-800 focus:ring-primary-400"
              {...register('rememberMe')}
            />
            <span className="text-sm text-slate-600">Recordarme</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-800 hover:underline font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isLoading}
          className="mt-2"
        >
          Iniciar sesión
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-3">o</span>
          </div>
        </div>

        <Link
          to="/join"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          🎮 Soy alumno — unirme a una partida
        </Link>

        <p className="text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-800 font-semibold hover:underline">
            Crear cuenta gratis
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
