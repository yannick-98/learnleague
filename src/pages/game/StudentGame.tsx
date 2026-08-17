import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StudentGameWebSocket } from '../../lib/websocket'
import Timer from '../../components/game/Timer'
import AnswerButton from '../../components/game/AnswerButton'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

type Phase = 'connecting' | 'waiting' | 'question' | 'answered' | 'finished'

const OPTION_COLORS = ['bg-game-a', 'bg-game-b', 'bg-game-c', 'bg-game-d']
const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function StudentGame() {
  const { code } = useParams()
  const navigate = useNavigate()
  const wsRef = useRef<StudentGameWebSocket | null>(null)

  const [phase, setPhase] = useState<Phase>('connecting')
  const [playerInfo, setPlayerInfo] = useState<any>(null)
  const [playersCount, setPlayersCount] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [timeLimit, setTimeLimit] = useState(30)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [finalRanking, setFinalRanking] = useState<any[]>([])
  const [answerTime, setAnswerTime] = useState(0)
  const questionStartTime = useRef<number>(0)

  useEffect(() => {
    let active = true
    const stored = localStorage.getItem(`player_${code}`)
    if (!stored) { navigate(`/join/${code}`); return }

    const player = JSON.parse(stored)
    if (!player?.token) {
      navigate(`/join/${code}`)
      return
    }
    setPlayerInfo(player)

    const ws = new StudentGameWebSocket(code || '', player.token)
    wsRef.current = ws

    ws.on('game_state', (data: any) => {
      if (data.status === 'waiting') {
        setPlayersCount(data.players?.length || 0)
        setPhase('waiting')
      } else if (data.status === 'active' && data.question) {
        setCurrentQuestion(data.question)
        setQuestionIndex(data.question_index)
        setTotalQuestions(data.total_questions)
        setTimeLimit(data.time_limit)
        questionStartTime.current = Date.now()
        setPhase('question')
      } else if (data.status === 'finished') {
        setFinalRanking(data.ranking)
        setPhase('finished')
      }
    })

    ws.on('game_started', () => {
      setPhase('waiting')
    })

    ws.on('player_joined', (data: any) => {
      setPlayersCount(data.total_players)
    })

    ws.on('question_data', (data: any) => {
      setCurrentQuestion(data.question)
      setQuestionIndex(data.question_index)
      setTotalQuestions(data.total_questions)
      setTimeLimit(data.time_limit)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setPointsEarned(0)
      questionStartTime.current = Date.now()
      setPhase('question')
    })

    ws.on('answer_feedback', (data: any) => {
      setIsCorrect(data.is_correct)
      setPointsEarned(data.points)
      setTotalScore(prev => prev + data.points)
      setPhase('answered')
    })

    ws.on('game_finished', (data: any) => {
      setFinalRanking(data.ranking)
      setPhase('finished')
      localStorage.removeItem(`player_${code}`)
    })

    ws.connect()
      .then(() => { if (active) setPhase('waiting') })
      .catch(() => { if (active) navigate(`/join/${code}`) })

    return () => {
      active = false
      ws.disconnect()
    }
  }, [code, navigate])

  const handleAnswer = (option: string) => {
    if (selectedAnswer || !currentQuestion || !wsRef.current) return
    const elapsed = (Date.now() - questionStartTime.current) / 1000
    setSelectedAnswer(option)
    setAnswerTime(elapsed)
    wsRef.current.send({
      type: 'student_answer',
      question_id: currentQuestion.id,
      selected_option: option,
      response_time: elapsed,
    })
  }

  const options = currentQuestion ? [
    { letter: 'A', text: currentQuestion.option_a },
    { letter: 'B', text: currentQuestion.option_b },
    { letter: 'C', text: currentQuestion.option_c },
    { letter: 'D', text: currentQuestion.option_d },
  ] : []

  const myRanking = finalRanking.find(r => r.alias === playerInfo?.alias)

  // ─── SCREENS ─────────────────────────────────────────────────
  if (phase === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-purple-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Conectando..." className="text-white" />
      </div>
    )
  }

  if (phase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce-in">{playerInfo?.avatar}</div>
          <h1 className="text-3xl font-black text-white mb-2">{playerInfo?.alias}</h1>
          <p className="text-primary-200 mb-8">Esperando que el profesor inicie...</p>
          <div className="flex justify-center gap-1 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="bg-white/10 rounded-2xl px-8 py-4 inline-block">
            <p className="text-white/70 text-sm">Partida:</p>
            <p className="text-white font-black text-2xl font-mono tracking-widest">{code}</p>
          </div>
          <p className="text-primary-300 text-sm mt-4">{playersCount} jugadores conectados</p>
        </div>
      </div>
    )
  }

  if (phase === 'question' || phase === 'answered') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-primary-950 flex flex-col p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/70 text-sm font-medium">
            {questionIndex + 1} / {totalQuestions}
          </div>
          {phase === 'question' && (
            <Timer
              key={questionIndex}
              duration={timeLimit}
              onExpire={() => setPhase('answered')}
              className="text-white"
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg">{playerInfo?.avatar}</span>
            <span className="text-white font-bold">{totalScore} puntos</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-5 mb-4 flex-shrink-0">
          <p className="text-lg font-bold text-slate-900 text-center">{currentQuestion?.text}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {options.map(({ letter, text }) => (
            <AnswerButton
              key={letter}
              letter={letter}
              text={text}
              onClick={() => handleAnswer(letter)}
              disabled={phase === 'answered' || !!selectedAnswer}
              selected={selectedAnswer === letter}
              correct={null}
            />
          ))}
        </div>

        {/* Feedback */}
        {phase === 'answered' && (
          <div className={`mt-4 rounded-2xl p-4 text-center text-white font-bold text-xl ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isCorrect ? (
              <div>
                <div className="text-3xl mb-1">✅</div>
                <p>¡Correcto! +{pointsEarned} puntos</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-1">❌</div>
                <p>Incorrecto</p>
              </div>
            )}
            <p className="text-sm opacity-75 mt-1">Esperando siguiente pregunta...</p>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'finished') {
    const confettiColors = ['#6366f1', '#84cc16', '#f59e0b', '#ec4899', '#22c55e']
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-purple-900 flex flex-col items-center justify-center p-4">
        {/* Confetti (CSS only) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: confettiColors[i % confettiColors.length],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center">
          <div className="text-6xl mb-2 animate-bounce-in">{playerInfo?.avatar}</div>
          <h1 className="text-3xl font-black text-white mb-1">
            {myRanking?.position === 1 ? '🏆 ¡Ganaste!' :
             myRanking?.position === 2 ? '🥈 ¡2º Lugar!' :
             myRanking?.position === 3 ? '🥉 ¡3er Lugar!' :
             `Posición #${myRanking?.position}`}
          </h1>
          <p className="text-primary-200 text-lg mb-1">{totalScore} puntos</p>
          <p className="text-primary-300 text-sm mb-8">
            {myRanking?.correct_answers}/{myRanking?.total_answers} respuestas correctas
          </p>

          {/* Top 3 */}
          <div className="bg-white/10 rounded-2xl p-4 mb-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-3">Mejores jugadores</h3>
            {finalRanking.slice(0, 5).map(r => (
              <div key={r.player_id} className={`flex items-center justify-between py-2 px-3 rounded-xl mb-1 ${
                r.alias === playerInfo?.alias ? 'bg-white/20' : ''
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm w-5">#{r.position}</span>
                  <span className="text-lg">{r.avatar}</span>
                  <span className={`text-sm font-medium ${r.alias === playerInfo?.alias ? 'text-yellow-300' : 'text-white'}`}>
                    {r.alias}
                  </span>
                </div>
                <span className="text-white font-bold">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
