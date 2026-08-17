import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GameWebSocket, StudentGameWebSocket } from '@/lib/websocket'
import { useGameStore } from '@/stores/gameStore'
import type {
  WSQuestionData,
  WSQuestionEnded,
  WSPlayerJoined,
  WSAnswerReceived,
  WSGameFinished,
  WSGameStarted,
  WSAnswerResult,
  Player,
} from '@/types'

// ─── Teacher Hook ────────────────────────────────────────────────────────────
export function useTeacherGame(sessionCode: string, token: string) {
  const wsRef = useRef<GameWebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  const {
    setSession,
    addPlayer,
    setCurrentQuestion,
    decrementTime,
    setAnswersReceived,
    setTotalPlayers,
    setPartialRanking,
    setGameStatus,
    setFinalRanking,
    setCorrectOption,
    setExplanation,
    reset,
  } = useGameStore()

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      decrementTime()
    }, 1000)
  }, [decrementTime, stopTimer])

  const connect = useCallback(async () => {
    if (!sessionCode || !token) return

    const ws = new GameWebSocket(sessionCode, token)

    ws.on('game_started', (data) => {
      const d = data as unknown as WSGameStarted
      setGameStatus('active')
      toast.success('¡La partida ha comenzado!')
      console.log('[Teacher] game_started', d)
    })

    ws.on('question_data', (data) => {
      const d = data as unknown as WSQuestionData
      setCurrentQuestion(d)
      setGameStatus('active')
      startTimer()
    })

    ws.on('question_ended', (data) => {
      const d = data as unknown as WSQuestionEnded
      stopTimer()
      setGameStatus('question_ended')
      setCorrectOption(d.correct_option)
      setExplanation(d.explanation)
      setPartialRanking(d.ranking)
    })

    ws.on('player_joined', (data) => {
      const d = data as unknown as WSPlayerJoined
      const player: Player = {
        id: d.player.id,
        alias: d.player.alias,
        avatar: d.player.avatar,
        score: 0,
        correct_answers: 0,
        total_answers: 0,
        avg_response_time: 0,
        joined_at: new Date().toISOString(),
      }
      addPlayer(player)
      setTotalPlayers(d.total_players)
    })

    ws.on('answer_progress', (data) => {
      const d = data as unknown as WSAnswerReceived
      setAnswersReceived(d.total_answered)
      setTotalPlayers(d.total_players)
    })

    ws.on('game_finished', (data) => {
      const d = data as unknown as WSGameFinished
      stopTimer()
      setGameStatus('finished')
      setFinalRanking(d.ranking)
      navigate(`/game/final/${sessionCode}`)
    })

    ws.on('error', (data) => {
      toast.error((data.message as string) || 'Error en el juego')
    })

    try {
      await ws.connect()
      wsRef.current = ws
      setGameStatus('waiting')
    } catch (err) {
      console.error('[useTeacherGame] WS connection failed:', err)
      toast.error('Error al conectar con el servidor de juego')
    }
  }, [
    sessionCode, token, navigate, setGameStatus, setCurrentQuestion, startTimer,
    stopTimer, setCorrectOption, setExplanation, setPartialRanking, addPlayer,
    setTotalPlayers, setAnswersReceived, setFinalRanking,
  ])

  const nextQuestion = useCallback(() => {
    wsRef.current?.send({ type: 'teacher_next_question' })
  }, [])

  const endQuestion = useCallback(() => {
    wsRef.current?.send({ type: 'teacher_end_question' })
  }, [])

  const startGame = useCallback(() => {
    wsRef.current?.send({ type: 'teacher_start_game' })
  }, [])

  const finishGame = useCallback(() => {
    wsRef.current?.send({ type: 'teacher_finish_game' })
  }, [])

  useEffect(() => {
    connect()
    return () => {
      stopTimer()
      wsRef.current?.disconnect()
      wsRef.current = null
    }
  }, [connect, stopTimer])

  return { wsRef, nextQuestion, endQuestion, startGame, finishGame, setSession, reset }
}

// ─── Student Hook ─────────────────────────────────────────────────────────────
export function useStudentGame(sessionCode: string, playerToken: string) {
  const wsRef = useRef<GameWebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  const {
    setCurrentQuestion,
    decrementTime,
    setGameStatus,
    setMyLastAnswer,
    setMyScore,
    setFinalRanking,
    setCorrectOption,
    setExplanation,
    setPartialRanking,
    setHasAnswered,
  } = useGameStore()

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      decrementTime()
    }, 1000)
  }, [decrementTime, stopTimer])

  const connect = useCallback(async () => {
    if (!sessionCode || !playerToken) return

    const ws = new StudentGameWebSocket(sessionCode, playerToken)

    ws.on('game_started', () => {
      setGameStatus('active')
    })

    ws.on('question_data', (data) => {
      const d = data as unknown as WSQuestionData
      setCurrentQuestion(d)
      setGameStatus('active')
      setHasAnswered(false)
      setMyLastAnswer(null)
      startTimer()
    })

    ws.on('answer_feedback', (data) => {
      const d = data as unknown as WSAnswerResult
      setMyLastAnswer({
        selected: '',
        is_correct: d.is_correct,
        points: d.points,
        correct_option: d.correct_option,
      })
      setMyScore(d.total_score)
      stopTimer()
    })

    ws.on('question_ended', (data) => {
      const d = data as unknown as WSQuestionEnded
      stopTimer()
      setGameStatus('question_ended')
      setCorrectOption(d.correct_option)
      setExplanation(d.explanation)
      setPartialRanking(d.ranking)
    })

    ws.on('game_finished', (data) => {
      const d = data as unknown as WSGameFinished
      stopTimer()
      setGameStatus('finished')
      setFinalRanking(d.ranking)
      navigate(`/game/final/${sessionCode}`)
    })

    ws.on('error', (data) => {
      toast.error((data.message as string) || 'Error en el juego')
    })

    try {
      await ws.connect()
      wsRef.current = ws
      setGameStatus('waiting')
    } catch (err) {
      console.error('[useStudentGame] WS connection failed:', err)
      toast.error('Error al conectar con el servidor de juego')
    }
  }, [
    sessionCode, playerToken, navigate, setGameStatus, setCurrentQuestion,
    startTimer, stopTimer, setMyLastAnswer, setMyScore, setFinalRanking,
    setCorrectOption, setExplanation, setPartialRanking, setHasAnswered,
  ])

  const sendAnswer = useCallback(
    (questionId: number, selectedOption: string) => {
      wsRef.current?.send({
        type: 'student_answer',
        question_id: questionId,
        selected_option: selectedOption,
      })
      setHasAnswered(true)
    },
    [setHasAnswered]
  )

  useEffect(() => {
    connect()
    return () => {
      stopTimer()
      wsRef.current?.disconnect()
      wsRef.current = null
    }
  }, [connect, stopTimer])

  return { wsRef, sendAnswer }
}
