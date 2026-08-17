import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, User, Lock, Building, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const schema = z
  .object({
    email: z.string().email('Correo electrónico inválido'),
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(30, 'Máximo 30 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    first_name: z.string().min(2, 'Mínimo 2 caracteres'),
    last_name: z.string().min(2, 'Mínimo 2 caracteres'),
    school: z.string().optional(),
    subject_specialty: z.string().optional(),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir una mayúscula')
      .regex(/[0-9]/, 'Debe incluir un número'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Las contraseñas no coinciden',
  })

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: handleRegister, isLoading } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await handleRegister(data)
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Convierte tu temario en una aventura de aprendizaje"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            placeholder="Juan"
            error={errors.first_name?.message}
            required
            leftIcon={<User size={14} />}
            {...register('first_name')}
          />
          <Input
            label="Apellidos"
            placeholder="García"
            error={errors.last_name?.message}
            required
            {...register('last_name')}
          />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="juan@escuela.es"
          error={errors.email?.message}
          required
          leftIcon={<Mail size={14} />}
          {...register('email')}
        />

        <Input
          label="Nombre de usuario"
          placeholder="juan_garcia"
          helper="Solo letras, números y guiones bajos"
          error={errors.username?.message}
          required
          leftIcon={<User size={14} />}
          {...register('username')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Centro educativo"
            placeholder="IES Cervantes"
            leftIcon={<Building size={14} />}
            {...register('school')}
          />
          <Input
            label="Especialidad"
            placeholder="Matemáticas"
            leftIcon={<BookOpen size={14} />}
            {...register('subject_specialty')}
          />
        </div>

        <Input
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          helper="Mayúscula + número requeridos"
          error={errors.password?.message}
          required
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

        <Input
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repite la contraseña"
          error={errors.confirm_password?.message}
          required
          leftIcon={<Lock size={14} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          {...register('confirm_password')}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isLoading}
          className="mt-2"
        >
          Crear cuenta
        </Button>

        <p className="text-center text-sm text-slate-500 mt-2">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-800 font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>

        <p className="text-xs text-slate-400 text-center">
          Al registrarte aceptas nuestros{' '}
          <a href="#" className="underline">Términos de uso</a>
          {' '}y{' '}
          <a href="#" className="underline">Política de privacidad</a>.
        </p>
      </form>
    </AuthLayout>
  )
}
