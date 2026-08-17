import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await authApi.requestPasswordReset(data.email)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla"
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
            Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña.
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-800 font-medium hover:underline"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <p className="text-sm text-slate-600 text-center">
            Introduce tu correo y te enviaremos instrucciones para crear una nueva contraseña.
          </p>

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

          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
            Enviar enlace
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
