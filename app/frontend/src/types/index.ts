export interface Room {
  id: number
  code: string
  host_name: string
  bet_amount: number
  created_at: string
  participant_count: number
  total_prize: number
}

export interface Participant {
  id: number
  name: string
  is_host: boolean
  joined_at: string
}

export interface Match {
  id: number
  opponent: string
  match_date: string
  stage: string
  order: number
  home_score: number | null
  away_score: number | null
  is_finished: boolean
}

export interface Prediction {
  id: number
  participant_name: string
  match_id: number
  home_score: number
  away_score: number
  updated_at: string
}

export interface SettlementResult {
  match_id: number
  winners: string[]
  prize_per_winner: number
  is_rollover: boolean
  cumulative_prize: number
}

export interface StandingsEntry {
  participant_name: string
  total_won: number
  correct_count: number
}

export interface BoardResponse {
  room_code: string
  bet_amount: number
  participant_count: number
  total_prize: number
  cumulative_prize: number
  matches: Match[]
  predictions: Prediction[]
  standings: StandingsEntry[]
}
