import { cn } from '@/lib/utils'
import { DifficultyBadge } from '@/components/ui/Badge'
import { Hash } from 'lucide-react'

interface QuestionCardProps {
  questionText: string
  questionIndex: number
  totalQuestions: number
  difficulty?: string
  topic?: string
  className?: string
}

export function QuestionCard({
  questionText,
  questionIndex,
  totalQuestions,
  difficulty,
  topic,
  className,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 animate-slide-up',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">
            Pregunta {questionIndex + 1} de {totalQuestions}
          </span>
          {/* Progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalQuestions, 12) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i < questionIndex
                    ? 'bg-green-500'
                    : i === questionIndex
                    ? 'bg-primary-800 w-4'
                    : 'bg-slate-200'
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {topic && (
            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              <Hash size={10} />
              {topic}
            </span>
          )}
          {difficulty && <DifficultyBadge difficulty={difficulty} />}
        </div>
      </div>

      {/* Question text */}
      <div className="mt-2">
        <p className="text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed">
          {questionText}
        </p>
      </div>
    </div>
  )
}
