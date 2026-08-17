import { create } from 'zustand'
import type { GameSession, Player, WSQuestionData, RankingEntry } from '@/types'

interface MyPlayer {
  id: number
  alias: string
  avatar: string
  token: string
}

interface MyLastAnswer {
  selected: string
  is_correct: boolean
  points: number
  correct_option: string
}

export type GameStatus = 'idle' | 'waiting' | 'active' | 'question_ended' | 'finished'

interface GameState {
  // Teacher game state
  session: GameSession | null
  players: Player[]
  currentQuestion: WSQuestionData | null
  currentQuestionIndex: number
  timeLeft: number
  answersReceived: number
  totalPlayers: number
  partialRanking: RankingEntry[]
  gameStatus: GameStatus
  correctOption: string | null
  explanation: string | null

  // Student game state
  myPlayer: MyPlayer | null
  myScore: number
  myLastAnswer: MyLastAnswer | null
  finalRanking: RankingEntry[]
  hasAnswered: boolean

  // Actions
  setSession: (session: GameSession) => void
  addPlayer: (player: Player) => void
  setPlayers: (players: Player[]) => void
  setCurrentQuestion: (question: WSQuestionData) => void
  setTimeLeft: (time: number) => void
  decrementTime: () => void
  setAnswersReceived: (count: number) => void
  incrementAnswers: () => void
  setTotalPlayers: (count: number) => void
  setPartialRanking: (ranking: RankingEntry[]) => void
  setGameStatus: (status: GameStatus) => void
  setCorrectOption: (option: string | null) => void
  setExplanation: (text: string | null) => void
  setMyPlayer: (player: MyPlayer | null) => void
  setMyScore: (score: number) => void
  setMyLastAnswer: (answer: MyLastAnswer | null) => void
  setFinalRanking: (ranking: RankingEntry[]) => void
  setHasAnswered: (value: boolean) => void
  reset: () => void
}

const initialState: Omit<
  GameState,
  | 'setSession' | 'addPlayer' | 'setPlayers' | 'setCurrentQuestion' | 'setTimeLeft'
  | 'decrementTime' | 'setAnswersReceived' | 'incrementAnswers' | 'setTotalPlayers'
  | 'setPartialRanking' | 'setGameStatus' | 'setCorrectOption' | 'setExplanation'
  | 'setMyPlayer' | 'setMyScore' | 'setMyLastAnswer' | 'setFinalRanking'
  | 'setHasAnswered' | 'reset'
> = {
  session: null,
  players: [],
  currentQuestion: null,
  currentQuestionIndex: 0,
  timeLeft: 0,
  answersReceived: 0,
  totalPlayers: 0,
  partialRanking: [],
  gameStatus: 'idle',
  correctOption: null,
  explanation: null,
  myPlayer: null,
  myScore: 0,
  myLastAnswer: null,
  finalRanking: [],
  hasAnswered: false,
}

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players.filter((p) => p.id !== player.id), player],
    })),

  setPlayers: (players) => set({ players }),

  setCurrentQuestion: (question) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: question.question_index,
      answersReceived: 0,
      correctOption: null,
      explanation: null,
      hasAnswered: false,
      timeLeft: question.time_limit,
    }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),

  decrementTime: () =>
    set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),

  setAnswersReceived: (answersReceived) => set({ answersReceived }),

  incrementAnswers: () =>
    set((state) => ({ answersReceived: state.answersReceived + 1 })),

  setTotalPlayers: (totalPlayers) => set({ totalPlayers }),

  setPartialRanking: (partialRanking) => set({ partialRanking }),

  setGameStatus: (gameStatus) => set({ gameStatus }),

  setCorrectOption: (correctOption) => set({ correctOption }),

  setExplanation: (explanation) => set({ explanation }),

  setMyPlayer: (myPlayer) => set({ myPlayer }),

  setMyScore: (myScore) => set({ myScore }),

  setMyLastAnswer: (myLastAnswer) => set({ myLastAnswer }),

  setFinalRanking: (finalRanking) => set({ finalRanking }),

  setHasAnswered: (hasAnswered) => set({ hasAnswered }),

  reset: () => set(initialState),
}))
