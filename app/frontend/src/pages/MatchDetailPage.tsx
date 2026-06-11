import { useState } from 'react'
import { submitPrediction, submitResult } from '../api/rooms'
import type { Match, Prediction, BoardResponse } from '../types'

interface Props {
  roomCode: string
  match: Match
  board: BoardResponse
  myName: string
  isHost: boolean
  onBack: () => void
  onUpdated: () => void
}

export default function MatchDetailPage({ roomCode, match, board, myName, isHost, onBack, onUpdated }: Props) {
  const [myHome, setMyHome] = useState('')
  const [myAway, setMyAway] = useState('')
  const [resultHome, setResultHome] = useState('')
  const [resultAway, setResultAway] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [settlement, setSettlement] = useState<{ winners: string[]; prize: number; rollover: boolean } | null>(null)
  const [error, setError] = useState('')

  const matchPreds: Prediction[] = (board.predictions ?? []).filter(p => p.match_id === match.id)
  const myPred = matchPreds.find(p => p.participant_name === myName)
  const totalPrize = (board.total_prize ?? 0) + (board.cumulative_prize ?? 0)
  const betAmount = board.bet_amount ?? 0
  const participantCount = board.participant_count ?? 0

  const handlePredict = async () => {
    if (myHome === '' || myAway === '') return
    setSubmitting(true); setError('')
    try {
      await submitPrediction(roomCode, myName, match.id, Number(myHome), Number(myAway))
      onUpdated()
      setMyHome(''); setMyAway('')
    } catch { setError('예측 저장에 실패했습니다.') }
    finally { setSubmitting(false) }
  }

  const handleResult = async () => {
    if (resultHome === '' || resultAway === '') return
    setSubmitting(true); setError('')
    try {
      const res = await submitResult(roomCode, match.id, Number(resultHome), Number(resultAway), myName)
      setSettlement({ winners: res.winners, prize: res.prize_per_winner, rollover: res.is_rollover })
      onUpdated()
    } catch { setError('결과 입력에 실패했습니다.') }
    finally { setSubmitting(false) }
  }

  const stageColor = match.stage === '조별리그'
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    : match.stage === '결승'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-purple-500/20 text-purple-400 border-purple-500/30'

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all">
            ←
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stageColor}`}>{match.stage}</span>
            <h1 className="font-black text-base">🇰🇷 대한민국 vs {match.opponent}</h1>
          </div>
          {match.is_finished
            ? <span className="ml-auto text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">종료</span>
            : <span className="ml-auto flex items-center gap-1 text-xs text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />진행중</span>
          }
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 경기 날짜 */}
        <p className="text-gray-500 text-sm text-center">{match.match_date}</p>

        {/* 상금 카드 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-px shadow-xl shadow-orange-500/20">
          <div className="rounded-2xl bg-gradient-to-br from-yellow-400/90 via-orange-400/90 to-red-500/90 px-5 py-4">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 font-black select-none">₩</div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-yellow-900/70 text-xs font-semibold uppercase tracking-wider mb-1">
                  {(board.cumulative_prize ?? 0) > 0 ? '이월 누적 상금' : '경기 상금'}
                </p>
                <p className="text-3xl font-black text-white drop-shadow">
                  {totalPrize.toLocaleString()}<span className="text-xl ml-1">원</span>
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
                  <p className="text-white font-black text-lg">{participantCount}<span className="text-xs font-semibold ml-0.5">명</span></p>
                  <p className="text-yellow-100 text-xs">인당 {betAmount.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최종 결과 (종료된 경기) */}
        {match.is_finished && match.home_score !== null && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
            <p className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wider">최종 결과</p>
            <p className="text-5xl font-black text-green-400">
              {match.home_score}<span className="text-gray-500 mx-3 text-3xl">:</span>{match.away_score}
            </p>
          </div>
        )}

        {/* 정산 결과 배너 */}
        {settlement && (
          <div className={`rounded-2xl p-4 text-center text-sm font-semibold ${
            settlement.rollover
              ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
              : 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/20 text-yellow-300'
          }`}>
            {settlement.rollover
              ? '아무도 맞추지 못했습니다. 상금이 다음 경기로 이월됩니다.'
              : `🏆 ${settlement.winners.join(', ')} 님이 ${settlement.prize.toLocaleString()}원 획득!`
            }
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 내 예측 */}
        {!match.is_finished && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-blue-400">
              내 예측
              {myPred && <span className="text-blue-300/60 font-normal ml-2">현재: {myPred.home_score}:{myPred.away_score}</span>}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">🇰🇷 대한민국</p>
                <input type="number" min={0} max={20}
                  className="w-16 h-14 bg-white/10 border border-white/10 rounded-xl text-center text-white text-2xl font-black focus:outline-none focus:border-blue-400"
                  placeholder="0" value={myHome} onChange={e => setMyHome(e.target.value)} />
              </div>
              <span className="text-gray-500 font-black text-2xl mt-4">:</span>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">{match.opponent}</p>
                <input type="number" min={0} max={20}
                  className="w-16 h-14 bg-white/10 border border-white/10 rounded-xl text-center text-white text-2xl font-black focus:outline-none focus:border-blue-400"
                  placeholder="0" value={myAway} onChange={e => setMyAway(e.target.value)} />
              </div>
            </div>
            <button onClick={handlePredict} disabled={submitting || myHome === '' || myAway === ''}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              {submitting ? '저장 중...' : myPred ? '예측 수정' : '예측 제출'}
            </button>
          </div>
        )}

        {/* 방장 결과 입력 */}
        {isHost && !match.is_finished && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-orange-400">결과 입력 <span className="text-orange-300/50 font-normal">(방장)</span></p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">🇰🇷 대한민국</p>
                <input type="number" min={0} max={20}
                  className="w-16 h-14 bg-white/10 border border-white/10 rounded-xl text-center text-white text-2xl font-black focus:outline-none focus:border-orange-400"
                  placeholder="0" value={resultHome} onChange={e => setResultHome(e.target.value)} />
              </div>
              <span className="text-gray-500 font-black text-2xl mt-4">:</span>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">{match.opponent}</p>
                <input type="number" min={0} max={20}
                  className="w-16 h-14 bg-white/10 border border-white/10 rounded-xl text-center text-white text-2xl font-black focus:outline-none focus:border-orange-400"
                  placeholder="0" value={resultAway} onChange={e => setResultAway(e.target.value)} />
              </div>
            </div>
            <button onClick={handleResult} disabled={submitting || resultHome === '' || resultAway === ''}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              {submitting ? '정산 중...' : '정산하기'}
            </button>
          </div>
        )}

        {/* 참가자 예측 현황 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">참가자 예측 현황</p>
            <span className="text-xs text-gray-600">{matchPreds.length}/{participantCount}명 예측</span>
          </div>
          {matchPreds.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">아직 예측한 참가자가 없습니다</p>
          ) : (
            <div className="divide-y divide-white/5">
              {matchPreds.map(p => {
                const isCorrect = match.is_finished && p.home_score === match.home_score && p.away_score === match.away_score
                const isMe = p.participant_name === myName
                return (
                  <div key={p.id} className={`flex items-center justify-between px-4 py-3 ${
                    isCorrect ? 'bg-green-500/10' : isMe ? 'bg-blue-500/10' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      {isCorrect && <span className="text-base">🏆</span>}
                      <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : isMe ? 'text-blue-300' : 'text-white'}`}>
                        {p.participant_name}
                        {isMe && <span className="ml-1 text-blue-400/60 text-xs">(나)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-black text-lg ${isCorrect ? 'text-green-400' : isMe ? 'text-blue-300' : 'text-gray-300'}`}>
                        {p.home_score}:{p.away_score}
                      </span>
                      {match.is_finished && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isCorrect ? '적중' : '빗나감'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
