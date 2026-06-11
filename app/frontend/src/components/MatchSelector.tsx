import { useState } from 'react'
import { addMatch } from '../api/rooms'

const STAGES = ['조별리그', '32강', '16강', '8강', '4강', '결승']

interface Props {
  roomCode: string
  onAdded: () => void
  onClose: () => void
}

export default function MatchSelector({ roomCode, onAdded, onClose }: Props) {
  const [stage, setStage] = useState('조별리그')
  const [opponent, setOpponent] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!opponent.trim() || !matchDate.trim()) {
      setError('상대팀과 일시를 모두 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addMatch(roomCode, opponent.trim(), matchDate.trim(), stage)
      setOpponent('')
      setMatchDate('')
      onAdded()
    } catch {
      setError('경기 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <p className="text-sm font-bold text-white">경기 추가</p>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
      </div>

      <div className="p-4 space-y-3">
        {/* 단계 선택 */}
        <div>
          <p className="text-xs text-gray-500 mb-2">단계</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  stage === s
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 상대팀 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">상대팀</p>
          <input
            className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500"
            placeholder="예: 포르투갈"
            value={opponent}
            onChange={e => setOpponent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {/* 경기 일시 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">경기 일시</p>
          <input
            className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500"
            placeholder="예: 2026-07-01 21:00 KST"
            value={matchDate}
            onChange={e => setMatchDate(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || !opponent.trim() || !matchDate.trim()}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-gray-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? '추가 중...' : '+ 경기 추가'}
        </button>
      </div>
    </div>
  )
}
