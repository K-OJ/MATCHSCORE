import api from './client'
import type { Room, Participant, BoardResponse, Match, SettlementResult } from '../types'

export const createRoom = (hostName: string, betAmount: number) =>
  api.post<Room>('/rooms', { host_name: hostName, bet_amount: betAmount }).then(r => r.data)

export const getRoom = (code: string) =>
  api.get<Room>(`/rooms/${code}`).then(r => r.data)

export const joinRoom = (code: string, name: string) =>
  api.post<Participant>(`/rooms/${code}/join`, { name }).then(r => r.data)

export const getMatches = (code: string) =>
  api.get<Match[]>(`/rooms/${code}/matches`).then(r => r.data)

export const addMatch = (code: string, opponent: string, matchDate: string, stage: string) =>
  api.post<Match>(`/rooms/${code}/matches`, { opponent, match_date: matchDate, stage }).then(r => r.data)

export const submitPrediction = (
  code: string,
  participantName: string,
  matchId: number,
  homeScore: number,
  awayScore: number,
) =>
  api
    .post(`/rooms/${code}/predictions`, {
      participant_name: participantName,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    })
    .then(r => r.data)

export const getBoard = (code: string) =>
  api.get<BoardResponse>(`/rooms/${code}/board`).then(r => r.data)

export const submitResult = (
  code: string,
  matchId: number,
  homeScore: number,
  awayScore: number,
  hostName: string,
) =>
  api
    .post<SettlementResult>(`/rooms/${code}/matches/${matchId}/result`, {
      home_score: homeScore,
      away_score: awayScore,
      host_name: hostName,
    })
    .then(r => r.data)
