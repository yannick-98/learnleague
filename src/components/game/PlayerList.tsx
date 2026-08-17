interface Player {
  alias: string
  avatar: string
  id?: number
}

interface PlayerListProps {
  players: Player[]
}

export default function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) return null

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {players.map((p, i) => (
        <div
          key={p.id || `${p.alias}-${i}`}
          className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl animate-bounce-in"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <span className="text-2xl">{p.avatar}</span>
          <span className="text-xs font-medium text-slate-700 text-center truncate w-full">
            {p.alias}
          </span>
        </div>
      ))}
    </div>
  )
}
