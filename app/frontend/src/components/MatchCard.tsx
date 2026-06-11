import { useState } from 'react'
import type { Match, Prediction } from '../types'
import { submitPrediction, submitResult } from '../api/rooms'

interface Props {
  roomCode: string
  match: Match
  predictions: Prediction[]
  myName: string
  isHost: boolean
  onUpdated: () => void
}

export default function MatchCard({ roomCode, match, predictions, myName, isHost, onUpdated }: Props) {
  const [myHome, setMyHome] = useState('')
  const [myAway, setMyAway] = useState('')
  const [resultHome, setResultHome] = useState('')
  const [resultAway, setResultAway] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [settlement, setSettlement] = useState<{ winners: string[]; prize: number; rollover: boolean } | null>(null)
  const [expanded, setExpanded] = useState(true)

  const myPred = predictions.find(p => p.participant_name === myName && p.match_id === match.id)
  const matchPreds = predictions.filter(p => p.match_id === match.id)

  const handlePredict = async () => {
    if (myHome === '' || myAway === '') return
    setSubmitting(true)
    try {
      await submitPrediction(roomCode, myName, match.id, Number(myHome), Number(myAway))
      onUpdated()
    } finally { setSubmitting(false) }
  }

  const handleResult = async () => {
    if (resultHome === '' || resultAway === '') return
    setSubmitting(true)
    try {
      const res = await submitResult(roomCode, match.id, Number(resultHome), Number(resultAway), myName)
      setSettlement({ winners: res.winners, prize: res.prize_per_winner, rollover: res.is_rollover })
      onUpdated()
    } finally { setSubmitting(false) }
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg transition-all ${
      match.is_finished ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/5 border border-white/10'
    }`}>
      {/* 경기 헤더 */}
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 상태 인디케이터 */}
              <div className={`w-2 h-2 rounded-full ${match.is_finished ? 'bg-gray-500' : 'bg-green-400 animate-pulse'}`} />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    match.stage === '조별리그'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>{match.stage}</span>
                  {match.is_finished && <span className="text-xs bg-gray-600/50 text-gray-400 px-2 py-0.5 rounded-full">종료</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">🇰🇷 대한민국</span>
                  <span className="text-gray-500 text-xs">vs</span>
                  <span className="text-sm font-bold text-white">{match.opponent}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{match.match_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {match.is_finished && match.home_score !== null ? (
                <div className="text-center bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-400 font-semibold mb-0.5">결과</p>
                  <p className="text-2xl font-black text-green-400">{match.home_score}<span className="text-gray-500 mx-1">:</span>{match.away_score}</p>
                </div>
              ) : myPred ? (
                <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                  <p className="text-xs text-blue-400 mb-0.5">내 예측</p>
                  <p className="text-xl font-black text-blue-400">{myPred.home_score}<span className="text-gray-500 mx-1">:</span>{myPred.away_score}</p>
                </div>
              ) : (
                <div className="text-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">예측</p>
                  <p className="text-sm font-bold text-gray-500">미입력</p>
                </div>
              )}
              <span className={`text-gray-500 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
            </div>
          </div>
        </div>
      </button>

      {/* 펼쳐지는 영역 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
          {/* 정산 결과 */}
          {settlement && (
            <div className={`mt-3 p-3 rounded-xl text-sm font-semibold text-center ${
              settlement.rollover
                ? 'bg-gray-700/50 text-gray-300'
                : 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/20 text-yellow-300'
            }`}>
              {settlement.rollover
                ? '아무도 맞추지 못했습니다. 상금이 다음 경기로 이월됩니다.'
                : `${settlement.winners.join(', ')} 님이 ${settlement.prize.toLocaleString()}원 획득!`}
            </div>
          )}

          {/* 내 예측 입력 */}
          {!match.is_finished && (
            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-400 mb-2">
                내 예측 {myPred && <span className="text-blue-300/70">(현재: {myPred.home_score}:{myPred.away_score})</span>}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-400 w-12 text-right shrink-0">한국</span>
                  <input type="number" min={0} max={20}
                    className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white font-bold focus:outline-none focus:border-blue-400"
                    placeholder="0" value={myHome} onChange={e => setMyHome(e.target.value)} />
                  <span className="text-gray-400 font-black">:</span>
                  <input type="number" min={0} max={20}
                    className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white font-bold focus:outline-none focus:border-blue-400"
                    placeholder="0" value={myAway} onChange={e => setMyAway(e.target.value)} />
                  <span className="text-xs text-gray-400 w-16 shrink-0">{match.opponent}</span>
                </div>
                <button onClick={handlePredict} disabled={submitting}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
                  {myPred ? '수정' : '예측'}
                </button>
              </div>
            </div>
          )}

          {/* 방장 결과 입력 */}
          {isHost && !match.is_finished && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-orange-400 mb-2">결과 입력 <span className="text-orange-300/60">(방장)</span></p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-400 w-12 text-right shrink-0">한국</span>
                  <input type="number" min={0} max={20}
                    className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white font-bold focus:outline-none focus:border-orange-400"
                    placeholder="0" value={resultHome} onChange={e => setResultHome(e.target.value)} />
                  <span className="text-gray-400 font-black">:</span>
                  <input type="number" min={0} max={20}
                    className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white font-bold focus:outline-none focus:border-orange-400"
                    placeholder="0" value={resultAway} onChange={e => setResultAway(e.target.value)} />
                  <span className="text-xs text-gray-400 w-16 shrink-0">{match.opponent}</span>
                </div>
                <button onClick={handleResult} disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
                  정산
                </button>
              </div>
            </div>
          )}

          {/* 참가자 예측 현황 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              참가자 예측 현황 <span className="text-gray-600">({matchPreds.length}명)</span>
            </p>
            {matchPreds.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-2">아직 예측한 참가자가 없습니다</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {matchPreds.map(p => {
                  const isCorrect = match.is_finished && p.home_score === match.home_score && p.away_score === match.away_score
                  const isMe = p.participant_name === myName
                  return (
                    <div key={p.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isCorrect
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : isMe
                          ? 'bg-blue-500/15 border border-blue-500/20 text-blue-300'
                          : 'bg-white/5 border border-white/5 text-gray-400'
                    }`}>
                      <span className="font-semibold truncate max-w-[60%]">
                        {isCorrect && '🏆 '}
                        {p.participant_name}
                        {isMe && <span className="ml-1 text-blue-400/70">(나)</span>}
                      </span>
                      <span className="font-mono font-black ml-2">{p.home_score}:{p.away_score}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
