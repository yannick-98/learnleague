import { cn } from '@/lib/utils'

interface AnswerButtonProps {
  letter: string
  text: string
  onClick: () => void
  disabled?: boolean
  selected?: boolean
  correct?: boolean | null
}

const COLORS: Record<string, { base: string; selected: string; correct: string; wrong: string }> = {
  A: {
    base: 'bg-blue-500 hover:bg-blue-400',
    selected: 'bg-blue-600 ring-4 ring-white',
    correct: 'bg-green-500',
    wrong: 'bg-blue-300 opacity-60',
  },
  B: {
    base: 'bg-green-500 hover:bg-green-400',
    selected: 'bg-green-600 ring-4 ring-white',
    correct: 'bg-green-500',
    wrong: 'bg-green-300 opacity-60',
  },
  C: {
    base: 'bg-orange-500 hover:bg-orange-400',
    selected: 'bg-orange-600 ring-4 ring-white',
    correct: 'bg-green-500',
    wrong: 'bg-orange-300 opacity-60',
  },
  D: {
    base: 'bg-purple-500 hover:bg-purple-400',
    selected: 'bg-purple-600 ring-4 ring-white',
    correct: 'bg-green-500',
    wrong: 'bg-purple-300 opacity-60',
  },
}

export default function AnswerButton({
  letter, text, onClick, disabled, selected, correct,
}: AnswerButtonProps) {
  const colors = COLORS[letter] || COLORS.A

  let colorClass = colors.base
  if (correct === true) colorClass = colors.correct
  else if (correct === false) colorClass = colors.wrong
  else if (selected) colorClass = colors.selected

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full min-h-[80px] sm:min-h-[100px] rounded-2xl text-white font-bold',
        'flex items-center gap-3 px-4 py-3 text-left',
        'transition-all duration-200 active:scale-95',
        colorClass,
        disabled && !selected && 'cursor-default',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2'
      )}
      aria-pressed={selected}
    >
      <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-xl flex-shrink-0">
        {letter}
      </span>
      <span className="flex-1 text-sm sm:text-base leading-tight">{text}</span>
      {selected && correct === null && (
        <span className="text-2xl flex-shrink-0">✓</span>
      )}
    </button>
  )
}
