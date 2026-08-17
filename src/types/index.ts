export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  role: 'teacher' | 'admin'
  avatar: string
  school: string
  subject_specialty: string
  bio: string
  created_at: string
}

export interface RegisterData {
  email: string
  username: string
  first_name: string
  last_name: string
  password: string
  confirm_password?: string
  school?: string
  subject_specialty?: string
}

export interface ClassRoom {
  id: number
  name: string
  subject: string
  education_level: string
  description: string
  teacher: number
  color: string
  created_at: string
  materials_count?: number
  activities_count?: number
  sessions_count?: number
}

export interface TeachingMaterial {
  id: number
  title: string
  pdf_file: string
  file_url?: string | null
  extracted_text: string
  teacher: number
  classroom: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  page_count: number
  file_size: number
  error_message: string
  created_at: string
}

export interface Question {
  id: number
  activity: number
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  source: string
  order: number
}

export interface Activity {
  id: number
  title: string
  description: string
  teacher: number
  classroom: number | null
  material: number | null
  mode: 'live_quiz'
  status: 'draft' | 'ready' | 'played'
  time_per_question: number
  questions: Question[]
  question_count: number
  created_at: string
}

export interface GameSession {
  id: number
  activity: Activity
  teacher: number
  classroom: number | null
  code: string
  status: 'waiting' | 'active' | 'finished'
  current_question_index: number
  started_at: string | null
  finished_at: string | null
  created_at: string
  player_count?: number
}

export interface Player {
  id: number
  alias: string
  avatar: string
  score: number
  correct_answers: number
  total_answers: number
  avg_response_time: number
  joined_at: string
}

export interface RankingEntry {
  position: number
  alias: string
  avatar: string
  score: number
  correct_answers: number
  total_answers: number
  avg_response_time: number
}

export interface GameAnalytics {
  session_id: number
  session_code: string
  activity_title: string
  status: string
  started_at: string | null
  finished_at: string | null
  summary: {
    total_players: number
    avg_score: number
    avg_accuracy: number
    total_questions: number
    avg_response_time: number
  }
  ranking: RankingEntry[]
  questions_analysis: QuestionAnalysis[]
  recommendations: string[]
  player_reports: PlayerReport[]
}

export interface QuestionAnalysis {
  question_id: number
  text: string
  difficulty: string
  correct_percentage: number
  avg_response_time: number
  most_chosen_option: string
  options_distribution: { A: number; B: number; C: number; D: number }
}

export interface PlayerReport {
  position: number
  player_id: number
  alias: string
  avatar: string
  score: number
  correct_answers: number
  total_answers: number
  accuracy: number
  avg_response_time: number
  fastest_answer_time: number | null
  slowest_answer_time: number | null
  strongest_topic: string | null
  weakest_topic: string | null
}

// WebSocket message types
export interface WSMessage {
  type: string
  [key: string]: unknown
}

export interface WSGameStarted {
  type: 'game_started'
  session_id: number
  total_questions: number
}

export interface WSQuestionData {
  type: 'question_data'
  question_index: number
  total_questions: number
  question: {
    id: number
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    difficulty: string
    topic: string
  }
  time_limit: number
}

export interface WSQuestionEnded {
  type: 'question_ended'
  correct_option: string
  explanation: string
  ranking: RankingEntry[]
}

export interface WSPlayerJoined {
  type: 'player_joined'
  player: { id: number; alias: string; avatar: string }
  total_players: number
}

export interface WSAnswerReceived {
  type: 'answer_received'
  player_id: number
  total_answered: number
  total_players: number
}

export interface WSAnswerResult {
  type: 'answer_result' | 'answer_feedback'
  is_correct: boolean
  correct_option: string
  points: number
  points_earned?: number
  total_score: number
  explanation?: string
}

export interface WSGameFinished {
  type: 'game_finished'
  ranking: RankingEntry[]
  session_id: number
}

export interface WSError {
  type: 'error'
  message: string
}
