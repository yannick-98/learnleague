import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api'

const schema = z
  .object({
    new_password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Las contraseñas no coinciden',
  })

type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!uid || !token) {
    return (
      <AuthLayout title="Enlace inválido" subtitle="El enlace de recuperación no es válido">
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            Solicita un nuevo enlace desde la página de recuperación de contraseña.
          </p>
          <Link to="/forgot-password" className="text-sm text-primary-800 font-medium hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      })
      navigate('/login', { replace: true, state: { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' } })
    } catch {
      setError('El enlace ha expirado o no es válido. Solicita uno nuevo.')
    }
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.new_password?.message}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={14} />}
          {...register('new_password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite la contraseña"
          error={errors.confirm_password?.message}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={14} />}
          {...register('confirm_password')}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
          Guardar contraseña
        </Button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  )
}
