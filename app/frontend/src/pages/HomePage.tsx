import { useState, useEffect } from 'react'
import { createRoom, joinRoom } from '../api/rooms'

interface Props {
  onEnter: (code: string, name: string, isHost: boolean) => void
  initialCode?: string
}

export default function HomePage({ onEnter, initialCode = '' }: Props) {
  const [tab, setTab] = useState<'join' | 'create'>('join')
  const [name, setName] = useState('')
  const [code, setCode] = useState(initialCode)
  const [betAmount, setBetAmount] = useState(5000)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialCode) setCode(initialCode)
  }, [initialCode])

  const handleCreate = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요.')
    setLoading(true); setError('')
    try {
      const room = await createRoom(name.trim(), betAmount)
      onEnter(room.code, name.trim(), true)
    } catch {
      setError('방 생성에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요.')
    if (!code.trim()) return setError('방 코드를 입력해주세요.')
    setLoading(true); setError('')
    try {
      const participant = await joinRoom(code.trim().toUpperCase(), name.trim())
      onEnter(code.trim().toUpperCase(), name.trim(), participant.is_host)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? '방 입장에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const presets = [3000, 5000, 10000, 20000]

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-3xl" />
      </div>

      {/* 로고 영역 */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30 mb-4">
          <span className="text-4xl">⚽</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Match<span className="text-green-400">Score</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">2026 FIFA 월드컵 스코어 내기</p>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        {/* 탭 */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
          {(['join', 'create'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === t
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {t === 'join' ? '방 입장' : '방 만들기'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">내 이름</label>
            <input
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          {tab === 'join' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">방 코드</label>
              <input
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 uppercase tracking-[0.3em] font-mono text-center text-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                placeholder="A B 1 C 2 D"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">인당 베팅 금액</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {presets.map(p => (
                  <button key={p} onClick={() => setBetAmount(p)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      betAmount === p
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}>
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                <input
                  type="number" min={1000} step={1000}
                  className="flex-1 bg-transparent text-white focus:outline-none"
                  value={betAmount}
                  onChange={e => setBetAmount(Number(e.target.value))}
                />
                <span className="text-gray-400 text-sm font-medium">원</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={tab === 'join' ? handleJoin : handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/30 text-sm tracking-wide"
          >
            {loading ? '처리 중...' : tab === 'join' ? '입장하기' : '방 만들기'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-xs mt-6">대한민국 🇰🇷 2026 FIFA World Cup</p>
    </div>
  )
}
