import { addMatch } from '../api/rooms'
import type { BoardResponse } from '../types'

const WORLD_CUP_SCHEDULE = [
  { stage: '조별리그', opponent: '우루과이', match_date: '2026-06-12 11:00 KST' },
  { stage: '조별리그', opponent: '볼리비아', match_date: '2026-06-17 08:00 KST' },
  { stage: '조별리그', opponent: '체코',    match_date: '2026-06-22 05:00 KST' },
  { stage: '32강',   opponent: '',          match_date: '2026-07-01' },
  { stage: '16강',   opponent: '',          match_date: '2026-07-06' },
  { stage: '8강',    opponent: '',          match_date: '2026-07-11' },
  { stage: '4강',    opponent: '',          match_date: '2026-07-15' },
  { stage: '결승',   opponent: '',          match_date: '2026-07-19' },
]

interface Props {
  board: BoardResponse
  roomCode: string
  pendingOpponents: Record<string, string>
  setPendingOpponents: React.Dispatch<React.SetStateAction<Record<string, string>>>
  addLoading: string
  setAddLoading: (v: string) => void
  addError: string
  setAddError: (v: string) => void
  onAdded: () => void
}

export default function MatchSelector({
  board, roomCode, pendingOpponents, setPendingOpponents,
  addLoading, setAddLoading, addError, setAddError, onAdded,
}: Props) {
  const boardMatches = board.matches ?? []

  const isAdded = (stage: string, opponent: string) => {
    if (stage === '조별리그') return boardMatches.some(m => m.opponent === opponent)
    return boardMatches.some(m => m.stage === stage)
  }

  const available = WORLD_CUP_SCHEDULE.filter(s => !isAdded(s.stage, s.opponent))

  const doAdd = async (stage: string, opponent: string, matchDate: string) => {
    const opp = opponent.trim()
    if (!opp) return
    setAddLoading(stage)
    setAddError('')
    try {
      await addMatch(roomCode, opp, matchDate, stage)
      onAdded()
    } catch {
      setAddError(stage + ' 경기 추가 실패. 다시 시도해주세요.')
    } finally {
      setAddLoading('')
    }
  }

  if (available.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-6">모든 경기가 추가되었습니다</p>
  }

  return (
    <div className="divide-y divide-white/5">
      {addError && (
        <p className="text-red-400 text-xs px-4 py-2 bg-red-500/10">{addError}</p>
      )}
      {available.map((s) => {
        const isTBD = s.opponent === ''
        const inputVal = pendingOpponents[s.stage] ?? ''
        const opp = isTBD ? inputVal.trim() : s.opponent
        const isThis = addLoading === s.stage
        const busy = addLoading !== ''
        const stageColor = s.stage === '조별리그'
          ? 'bg-blue-500/20 text-blue-400'
          : s.stage === '결승'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-purple-500/20 text-purple-400'

        return (
          <div key={s.stage + s.opponent} className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${stageColor}`}>
                {s.stage}
              </span>
              <p className="text-sm font-semibold text-white flex-1">
                🇰🇷 대한민국 vs {s.opponent || <span className="text-gray-500">상대팀 미정</span>}
              </p>
              <span className="text-xs text-gray-600 shrink-0">{s.match_date}</span>
            </div>

            {isTBD && (
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400"
                placeholder="상대팀 입력 (예: 포르투갈)"
                value={inputVal}
                onChange={e => setPendingOpponents(p => ({ ...p, [s.stage]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && opp) doAdd(s.stage, opp, s.match_date) }}
              />
            )}

            <button
              type="button"
              onClick={() => doAdd(s.stage, opp, s.match_date)}
              disabled={busy || !opp}
              className="w-full py-2 rounded-lg text-sm font-bold transition-colors bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-gray-500"
            >
              {isThis ? '추가 중...' : (!isTBD || opp) ? '+ 추가하기' : '상대팀 입력 후 추가 가능'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
