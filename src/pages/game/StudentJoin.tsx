import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, ArrowLeft, Gamepad2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { gamesApi, unwrapResponse } from '@/lib/api'
import { EMOJIS } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Step = 'code' | 'alias' | 'avatar'

export default function StudentJoin() {
  const { code: urlCode } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(urlCode ? 'alias' : 'code')
  const [code, setCode] = useState(urlCode?.toUpperCase() || '')
  const [alias, setAlias] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(EMOJIS[0])
  const codeInputRef = useRef<HTMLInputElement>(null)

  const joinMutation = useMutation({
    mutationFn: () => gamesApi.joinGame(code, { alias, avatar: selectedAvatar }),
    onSuccess: (res) => {
      const data = unwrapResponse<{
        player_id: number
        player_token: string
      }>(res)
      localStorage.setItem(`player_${code}`, JSON.stringify({
        id: data.player_id,
        token: data.player_token,
        alias,
        avatar: selectedAvatar,
      }))
      toast.success(`¡Listo ${alias}! Entrando a la partida...`)
      navigate(`/game/student/${code}`)
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } }
      toast.error(e.response?.data?.detail || 'No se pudo unir. Verifica el código.')
    },
  })

  const handleCodeChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCode(clean)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-purple-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🎮</div>
          <h1 className="font-display font-bold text-3xl text-white">LearnLeague</h1>
          <p className="text-white/60 text-sm mt-1">Únete a la partida</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step: Enter Code */}
          {step === 'code' && (
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Gamepad2 size={20} className="text-primary-800" />
                <h2 className="font-semibold text-slate-800 text-lg">Introduce el código</h2>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                  Código de la partida
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && setStep('alias')}
                  placeholder="XXXXXX"
                  maxLength={6}
                  autoFocus
                  className="w-full text-center text-4xl font-display font-black tracking-[0.5em] border-2 border-slate-300 rounded-2xl py-5 px-4 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all uppercase"
                  autoComplete="off"
                  aria-label="Código de la partida"
                />
                <p className="text-center text-sm text-slate-400 mt-2">{code.length}/6 caracteres</p>
              </div>

              <Button
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => setStep('alias')}
                disabled={code.length < 6}
              >
                Continuar
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">El código te lo da tu profesor</p>
              </div>
            </div>
          )}

          {/* Step: Enter Alias */}
          {step === 'alias' && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('code')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-primary-800" />
                  <h2 className="font-semibold text-slate-800 text-lg">¿Cómo te llamas?</h2>
                </div>
              </div>

              {/* Code display */}
              <div className="text-center mb-5">
                <span className="inline-block bg-primary-50 text-primary-800 font-display font-bold text-xl px-4 py-1.5 rounded-xl tracking-widest">
                  {code}
                </span>
              </div>

              <div className="mb-5">
                <Input
                  label="Tu nombre o alias"
                  placeholder="Ej: SuperProfe, NinjaMatefático..."
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => e.key === 'Enter' && alias.trim().length >= 2 && setStep('avatar')}
                  autoFocus
                  maxLength={20}
                  helper={`${alias.length}/20 caracteres`}
                />
              </div>

              <Button
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => setStep('avatar')}
                disabled={alias.trim().length < 2}
              >
                Elegir avatar
              </Button>
            </div>
          )}

          {/* Step: Select Avatar */}
          {step === 'avatar' && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('alias')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-semibold text-slate-800 text-lg">Elige tu avatar</h2>
              </div>

              {/* Player preview */}
              <div className="text-center mb-5">
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-4xl shadow-inner">
                    {selectedAvatar}
                  </div>
                  <p className="font-bold text-slate-800">{alias}</p>
                </div>
              </div>

              {/* Emoji grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={cn(
                      'aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-150',
                      selectedAvatar === emoji
                        ? 'bg-primary-100 ring-3 ring-primary-500 scale-110 shadow-lg'
                        : 'bg-slate-100 hover:bg-primary-50 hover:scale-105'
                    )}
                    aria-label={`Seleccionar avatar ${emoji}`}
                    aria-pressed={selectedAvatar === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => joinMutation.mutate()}
                loading={joinMutation.isPending}
                className="bg-accent hover:bg-accent-dark text-slate-900"
              >
                ¡Unirse a la partida!
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
