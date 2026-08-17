import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Bell, Palette, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { EMOJIS } from '@/lib/utils'

const profileSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  username: z.string().min(3).max(30),
  school: z.string().optional(),
  subject_specialty: z.string().optional(),
  bio: z.string().max(300).optional(),
})

const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Requerido'),
    new_password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Las contraseñas no coinciden',
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

type Tab = 'profile' | 'password' | 'notifications'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || EMOJIS[0])
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      school: user?.school || '',
      subject_specialty: user?.subject_specialty || '',
      bio: user?.bio || '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      authApi.updateProfile({ ...data, avatar: selectedAvatar }),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Perfil actualizado correctamente')
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      }),
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente')
      passwordForm.reset()
    },
    onError: () => toast.error('Contraseña actual incorrecta'),
  })

  const tabs = [
    { key: 'profile' as Tab, label: 'Perfil', icon: <User size={15} /> },
    { key: 'password' as Tab, label: 'Contraseña', icon: <Lock size={15} /> },
    { key: 'notifications' as Tab, label: 'Notificaciones', icon: <Bell size={15} /> },
  ]

  return (
    <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-900">Ajustes</h1>
          <p className="text-slate-500 text-sm mt-1">Administra tu perfil y preferencias</p>
        </div>

        <div className="flex gap-6">
          {/* Tab navigation */}
          <div className="w-44 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-5">Información de perfil</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar emoji={selectedAvatar} alias={user?.first_name || ''} size="xl" />
                    <button
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-700 transition-colors"
                      aria-label="Cambiar avatar"
                    >
                      <Palette size={12} />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>

                {showAvatarPicker && (
                  <div className="mb-5 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700 mb-3">Elige tu emoji</p>
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJIS.map((emoji, index) => (
                        <button
                          key={`${emoji}-${index}`}
                          type="button"
                          onClick={() => { setSelectedAvatar(emoji); setShowAvatarPicker(false) }}
                          className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                            selectedAvatar === emoji ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-white'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nombre"
                      error={profileForm.formState.errors.first_name?.message}
                      {...profileForm.register('first_name')}
                    />
                    <Input
                      label="Apellidos"
                      error={profileForm.formState.errors.last_name?.message}
                      {...profileForm.register('last_name')}
                    />
                  </div>
                  <Input
                    label="Nombre de usuario"
                    error={profileForm.formState.errors.username?.message}
                    {...profileForm.register('username')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Centro educativo"
                      placeholder="IES Cervantes"
                      {...profileForm.register('school')}
                    />
                    <Input
                      label="Especialidad"
                      placeholder="Matemáticas"
                      {...profileForm.register('subject_specialty')}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Sobre mí (opcional)</label>
                    <textarea
                      rows={3}
                      placeholder="Cuéntanos algo sobre ti..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      {...profileForm.register('bio')}
                    />
                  </div>
                  <Button
                    type="submit"
                    leftIcon={<Save size={15} />}
                    loading={profileMutation.isPending}
                  >
                    Guardar cambios
                  </Button>
                </form>
              </div>
            )}

            {/* Password tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-5">Cambiar contraseña</h2>
                <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    error={passwordForm.formState.errors.old_password?.message}
                    {...passwordForm.register('old_password')}
                  />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    helper="Mínimo 8 caracteres, una mayúscula y un número"
                    error={passwordForm.formState.errors.new_password?.message}
                    {...passwordForm.register('new_password')}
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    error={passwordForm.formState.errors.confirm_password?.message}
                    {...passwordForm.register('confirm_password')}
                  />
                  <Button
                    type="submit"
                    leftIcon={<Lock size={15} />}
                    loading={passwordMutation.isPending}
                  >
                    Actualizar contraseña
                  </Button>
                </form>
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-5">Preferencias de notificaciones</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Resumen semanal por email', desc: 'Recibe un informe de tu actividad semanal', checked: true },
                    { label: 'Nuevas funcionalidades', desc: 'Notificaciones sobre actualizaciones del producto', checked: true },
                    { label: 'Consejos pedagógicos', desc: 'Tips para mejorar tus actividades', checked: false },
                  ].map((item) => (
                    <label key={item.label} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-800 focus:ring-primary-400"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <Button className="mt-5" leftIcon={<Save size={15} />} onClick={() => toast.success('Preferencias guardadas')}>
                  Guardar preferencias
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
