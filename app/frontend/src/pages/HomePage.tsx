import { useState } from 'react'
import { createRoom, joinRoom } from '../api/rooms'

interface Props {
  onEnter: (code: string, name: string, isHost: boolean) => void
}

export default function HomePage({ onEnter }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('join')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [betAmount, setBetAmount] = useState(5000)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요.')
    setLoading(true)
    setError('')
    try {
      const room = await createRoom(name.trim(), betAmount)
      onEnter(room.code, name.trim(), true)
    } catch {
      setError('방 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요.')
    if (!code.trim()) return setError('방 코드를 입력해주세요.')
    setLoading(true)
    setError('')
    try {
      const participant = await joinRoom(code.trim().toUpperCase(), name.trim())
      onEnter(code.trim().toUpperCase(), name.trim(), participant.is_host)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? '방 입장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-2xl font-bold text-gray-800">MatchScore</h1>
          <p className="text-gray-500 text-sm mt-1">월드컵 스코어 맞추기 내기</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          {(['join', 'create'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'join' ? '방 입장' : '방 만들기'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="내 이름 입력"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          {tab === 'join' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">방 코드</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: AB1C2D"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인당 베팅 금액</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={betAmount}
                  onChange={e => setBetAmount(Number(e.target.value))}
                />
                <span className="text-gray-500 text-sm">원</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={tab === 'join' ? handleJoin : handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? '처리 중...' : tab === 'join' ? '입장하기' : '방 만들기'}
          </button>
        </div>
      </div>
    </div>
  )
}
