import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Star } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
  pointsEarned?: number
  isCorrect?: boolean | null
  className?: string
}

export function ScoreDisplay({ score, pointsEarned, isCorrect, className }: ScoreDisplayProps) {
  const prevScoreRef = useRef(score)
  const scoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (score !== prevScoreRef.current && scoreRef.current) {
      scoreRef.current.classList.remove('animate-score-pop')
      void scoreRef.current.offsetWidth // reflow
      scoreRef.current.classList.add('animate-score-pop')
      prevScoreRef.current = score
    }
  }, [score])

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Correct/Wrong feedback */}
      {isCorrect !== null && isCorrect !== undefined && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg animate-bounce-in',
            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle size={24} />
              ¡Correcto!
            </>
          ) : (
            <>
              <XCircle size={24} />
              Incorrecto
            </>
          )}
        </div>
      )}

      {/* Points earned */}
      {pointsEarned !== undefined && pointsEarned > 0 && (
        <div className="flex items-center gap-1 text-yellow-600 font-bold text-2xl animate-bounce-in">
          <Star size={20} fill="currentColor" />
          +{pointsEarned.toLocaleString('es-ES')} puntos
        </div>
      )}

      {/* Total score */}
      <div ref={scoreRef} className="text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Puntuación total</p>
        <p className="font-display font-bold text-4xl text-slate-900 tabular-nums">
          {score.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

interface AnswerFeedbackProps {
  isCorrect: boolean
  pointsEarned: number
  correctOption: string
  selectedOption: string
  totalScore: number
}

export function AnswerFeedback({
  isCorrect,
  pointsEarned,
  correctOption,
  selectedOption,
  totalScore,
}: AnswerFeedbackProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 text-center animate-bounce-in border-2',
        isCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      )}
    >
      <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>

      <div
        className={cn(
          'flex items-center justify-center gap-2 text-2xl font-bold mb-2',
          isCorrect ? 'text-green-700' : 'text-red-700'
        )}
      >
        {isCorrect ? <CheckCircle size={28} /> : <XCircle size={28} />}
        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
      </div>

      {!isCorrect && (
        <p className="text-sm text-slate-600 mb-3">
          La respuesta correcta era: <strong className="text-green-700">Opción {correctOption}</strong>
          {selectedOption && `, elegiste: Opción ${selectedOption}`}
        </p>
      )}

      {isCorrect && pointsEarned > 0 && (
        <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold text-2xl mt-2">
          <Star size={20} fill="currentColor" />
          +{pointsEarned.toLocaleString()} puntos
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-current/10">
        <p className="text-sm text-slate-500">Puntuación total</p>
        <p className="font-display font-bold text-3xl text-slate-800">
          {totalScore.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
