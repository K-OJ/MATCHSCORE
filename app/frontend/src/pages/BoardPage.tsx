import { useEffect, useState, useCallback } from 'react'
import { getBoard, addMatch } from '../api/rooms'
import type { BoardResponse } from '../types'
import PrizeBanner from '../components/PrizeBanner'
import MatchCard from '../components/MatchCard'

interface Props {
  roomCode: string
  myName: string
  isHost: boolean
}

export default function BoardPage({ roomCode, myName, isHost }: Props) {
  const [board, setBoard] = useState<BoardResponse | null>(null)
  const [tab, setTab] = useState<'matches' | 'standings'>('matches')
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [newOpponent, setNewOpponent] = useState('')
  const [newDate, setNewDate] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(roomCode)
      setBoard(data)
    } catch {
      // 에러 무시 (폴링 중 일시적 실패)
    }
  }, [roomCode])

  useEffect(() => {
    fetchBoard()
    const interval = setInterval(fetchBoard, 5000)
    return () => clearInterval(interval)
  }, [fetchBoard])

  const handleAddMatch = async () => {
    if (!newOpponent.trim() || !newDate.trim()) return
    setAddLoading(true)
    try {
      await addMatch(roomCode, newOpponent.trim(), newDate.trim(), '토너먼트')
      setShowAddMatch(false)
      setNewOpponent('')
      setNewDate('')
      fetchBoard()
    } finally {
      setAddLoading(false)
    }
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-blue-800 text-white px-4 py-4 sticky top-0 z-10 shadow">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">⚽ MatchScore</h1>
            <p className="text-blue-200 text-xs">방 코드: <span className="font-mono font-bold">{roomCode}</span></p>
          </div>
          <div className="text-right text-xs text-blue-200">
            <p>{myName} {isHost && <span className="bg-yellow-400 text-yellow-900 px-1 rounded text-xs">방장</span>}</p>
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
        <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
          {(['matches', 'standings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {t === 'matches' ? '경기 목록' : '순위'}
            </button>
          ))}
        </div>

        {/* 경기 목록 탭 */}
        {tab === 'matches' && (
          <div className="space-y-4">
            {board.matches.map(match => (
              <MatchCard
                key={match.id}
                roomCode={roomCode}
                match={match}
                predictions={board.predictions}
                myName={myName}
                isHost={isHost}
                onUpdated={fetchBoard}
              />
            ))}

            {/* 방장: 경기 추가 */}
            {isHost && (
              <div>
                {showAddMatch ? (
                  <div className="bg-white rounded-xl shadow p-4 space-y-3">
                    <p className="font-medium text-sm text-gray-700">토너먼트 경기 추가</p>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="상대팀 (예: 포르투갈)" value={newOpponent}
                      onChange={e => setNewOpponent(e.target.value)} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="경기 일시 (예: 2026-06-28 21:00 KST)" value={newDate}
                      onChange={e => setNewDate(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddMatch(false)}
                        className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm">취소</button>
                      <button onClick={handleAddMatch} disabled={addLoading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">추가</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddMatch(true)}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-400 rounded-xl py-3 text-sm hover:border-blue-400 hover:text-blue-500 transition-colors">
                    + 토너먼트 경기 추가
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 순위 탭 */}
        {tab === 'standings' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">순위</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">이름</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-medium">적중</th>
                </tr>
              </thead>
              <tbody>
                {board.standings.map((s, i) => (
                  <tr key={s.participant_name} className={`border-t ${s.participant_name === myName ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {s.participant_name}
                      {s.participant_name === myName && <span className="ml-1 text-xs text-blue-500">(나)</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{s.correct_count}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
