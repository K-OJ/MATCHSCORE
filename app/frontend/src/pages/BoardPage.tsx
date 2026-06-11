import { useEffect, useState, useCallback } from 'react'
import { getBoard } from '../api/rooms'
import type { BoardResponse } from '../types'
import PrizeBanner from '../components/PrizeBanner'
import MatchCard from '../components/MatchCard'
import MatchSelector from '../components/MatchSelector'

interface Props {
  roomCode: string
  myName: string
  isHost: boolean
}


export default function BoardPage({ roomCode, myName, isHost }: Props) {
  const [board, setBoard] = useState<BoardResponse | null>(null)
  const [tab, setTab] = useState<'matches' | 'standings'>('matches')
  const [showMatchSelector, setShowMatchSelector] = useState(false)
  const [pendingOpponents, setPendingOpponents] = useState<Record<string, string>>({})
  const [addLoading, setAddLoading] = useState<string>('') // 추가 중인 stage
  const [addError, setAddError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(roomCode)
      setBoard(data)
    } catch {
      // 폴링 중 일시적 실패 무시
    }
  }, [roomCode])

  useEffect(() => {
    fetchBoard()
    const interval = setInterval(fetchBoard, 5000)
    return () => clearInterval(interval)
  }, [fetchBoard])

  useEffect(() => {
    if (roomCode) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('room') !== roomCode) {
        window.history.replaceState(null, '', `?room=${roomCode}`)
      }
    }
  }, [roomCode])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⚽</div>
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <div>
              <h1 className="font-black text-base leading-tight">Match<span className="text-green-400">Score</span></h1>
              <p className="text-gray-500 text-xs">2026 FIFA 월드컵</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleCopyCode}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all">
              <span className="font-mono font-black text-green-400 tracking-widest text-sm">{roomCode}</span>
              <span className="text-gray-500 text-xs">{copied ? '✓ 복사됨' : '링크 복사'}</span>
            </button>
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{myName}</p>
              {isHost && <p className="text-xs text-yellow-400 font-bold">방장</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 상금 배너 */}
        <PrizeBanner
          totalPrize={board.total_prize}
          cumulativePrize={board.cumulative_prize}
          participantCount={board.participant_count}
          betAmount={board.bet_amount}
        />

        {/* 탭 */}
        <div className="flex bg-white/5 rounded-2xl p-1">
          {(['matches', 'standings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === t
                  ? 'bg-white/10 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t === 'matches' ? '경기 목록' : '순위표'}
            </button>
          ))}
        </div>

        {/* 경기 목록 */}
        {tab === 'matches' && (
          <div className="space-y-3">
            {(board.matches ?? []).map(match => (
              <MatchCard
                key={match.id}
                roomCode={roomCode}
                match={match}
                predictions={board.predictions ?? []}
                myName={myName}
                isHost={isHost}
                onUpdated={fetchBoard}
              />
            ))}

            {isHost && (
              showMatchSelector ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">2026 FIFA 월드컵 경기 추가</p>
                    <button onClick={() => setShowMatchSelector(false)} className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
                  </div>
                  <MatchSelector
                    board={board}
                    roomCode={roomCode}
                    pendingOpponents={pendingOpponents}
                    setPendingOpponents={setPendingOpponents}
                    addLoading={addLoading}
                    setAddLoading={setAddLoading}
                    addError={addError}
                    setAddError={setAddError}
                    onAdded={fetchBoard}
                  />
                </div>
              ) : (
                <button onClick={() => setShowMatchSelector(true)}
                  className="w-full border-2 border-dashed border-white/10 hover:border-green-500/50 text-gray-500 hover:text-green-400 rounded-2xl py-4 text-sm font-semibold transition-all">
                  + 월드컵 경기 추가
                </button>
              )
            )}
          </div>
        )}

        {/* 순위표 */}
        {tab === 'standings' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">참가자 순위</p>
            </div>
            {(board.standings ?? []).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">아직 정산된 경기가 없습니다</p>
            ) : (
              <div>
                {(board.standings ?? []).map((s, i) => (
                  <div key={s.participant_name}
                    className={`flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 ${s.participant_name === myName ? 'bg-blue-500/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900'
                        : i === 1 ? 'bg-gray-400 text-gray-900'
                        : i === 2 ? 'bg-orange-600 text-white'
                        : 'bg-white/10 text-gray-400'
                      }`}>{i + 1}</span>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {s.participant_name}
                          {s.participant_name === myName && <span className="ml-1 text-blue-400 text-xs">(나)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-black text-base">{s.correct_count}<span className="text-xs font-normal text-gray-500 ml-1">적중</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
