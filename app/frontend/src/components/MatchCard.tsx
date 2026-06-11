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

  const myPred = predictions.find(p => p.participant_name === myName && p.match_id === match.id)

  const handlePredict = async () => {
    if (myHome === '' || myAway === '') return
    setSubmitting(true)
    try {
      await submitPrediction(roomCode, myName, match.id, Number(myHome), Number(myAway))
      onUpdated()
    } finally {
      setSubmitting(false)
    }
  }

  const handleResult = async () => {
    if (resultHome === '' || resultAway === '') return
    setSubmitting(true)
    try {
      const res = await submitResult(roomCode, match.id, Number(resultHome), Number(resultAway), myName)
      setSettlement({ winners: res.winners, prize: res.prize_per_winner, rollover: res.is_rollover })
      onUpdated()
    } finally {
      setSubmitting(false)
    }
  }

  const stageColor = match.stage === '조별리그' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'

  return (
    <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${match.is_finished ? 'border-green-400' : 'border-blue-400'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColor}`}>{match.stage}</span>
          <h3 className="font-bold text-gray-800 mt-1">대한민국 vs {match.opponent}</h3>
          <p className="text-xs text-gray-400">{match.match_date}</p>
        </div>
        {match.is_finished && match.home_score !== null && (
          <div className="text-center">
            <p className="text-xs text-gray-400">결과</p>
            <p className="text-2xl font-bold text-green-600">{match.home_score} : {match.away_score}</p>
          </div>
        )}
      </div>

      {/* 내 예측 입력 */}
      {!match.is_finished && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-700 mb-2">
            내 예측 {myPred ? `(현재: ${myPred.home_score}:${myPred.away_score})` : '(미입력)'}
          </p>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={20}
              className="w-14 border rounded px-2 py-1 text-center text-sm"
              placeholder="0" value={myHome} onChange={e => setMyHome(e.target.value)} />
            <span className="font-bold text-gray-400">:</span>
            <input type="number" min={0} max={20}
              className="w-14 border rounded px-2 py-1 text-center text-sm"
              placeholder="0" value={myAway} onChange={e => setMyAway(e.target.value)} />
            <button onClick={handlePredict} disabled={submitting}
              className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
              {myPred ? '수정' : '예측'}
            </button>
          </div>
        </div>
      )}

      {/* 방장 결과 입력 */}
      {isHost && !match.is_finished && (
        <div className="mb-3 p-3 bg-orange-50 rounded-lg">
          <p className="text-xs font-medium text-orange-700 mb-2">결과 입력 (방장)</p>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={20}
              className="w-14 border rounded px-2 py-1 text-center text-sm"
              placeholder="0" value={resultHome} onChange={e => setResultHome(e.target.value)} />
            <span className="font-bold text-gray-400">:</span>
            <input type="number" min={0} max={20}
              className="w-14 border rounded px-2 py-1 text-center text-sm"
              placeholder="0" value={resultAway} onChange={e => setResultAway(e.target.value)} />
            <button onClick={handleResult} disabled={submitting}
              className="ml-auto bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
              정산
            </button>
          </div>
        </div>
      )}

      {/* 정산 결과 알림 */}
      {settlement && (
        <div className={`mb-3 p-3 rounded-lg text-sm font-medium ${settlement.rollover ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
          {settlement.rollover
            ? '아무도 맞추지 못했습니다. 상금이 다음 경기로 이월됩니다.'
            : `🎉 ${settlement.winners.join(', ')} 님이 ${settlement.prize.toLocaleString()}원 획득!`}
        </div>
      )}

      {/* 참가자별 예측 현황 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">참가자 예측 현황</p>
        {predictions.filter(p => p.match_id === match.id).length === 0 ? (
          <p className="text-xs text-gray-300">아직 예측이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {predictions.filter(p => p.match_id === match.id).map(p => {
              const isCorrect = match.is_finished && p.home_score === match.home_score && p.away_score === match.away_score
              return (
                <div key={p.id} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                  isCorrect ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-50 text-gray-600'
                }`}>
                  <span>{p.participant_name}</span>
                  <span className="font-mono">{p.home_score}:{p.away_score}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
