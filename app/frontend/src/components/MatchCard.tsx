import type { Match, Prediction } from '../types'

interface Props {
  match: Match
  predictions: Prediction[]
  myName: string
  onClick: () => void
}

export default function MatchCard({ match, predictions, myName, onClick }: Props) {
  const myPred = predictions.find(p => p.participant_name === myName && p.match_id === match.id)
  const matchPreds = predictions.filter(p => p.match_id === match.id)
  const isCorrect = match.is_finished && myPred
    && myPred.home_score === match.home_score && myPred.away_score === match.away_score

  const stageColor = match.stage === '조별리그'
    ? 'bg-blue-500/20 text-blue-400'
    : match.stage === '결승'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-purple-500/20 text-purple-400'

  return (
    <button type="button" onClick={onClick} className={`w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] ${
      match.is_finished
        ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50'
        : 'bg-white/5 border border-white/10 hover:border-white/20'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 경기 정보 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${match.is_finished ? 'bg-gray-500' : 'bg-green-400 animate-pulse'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${stageColor}`}>{match.stage}</span>
                {match.is_finished && <span className="text-xs bg-gray-600/50 text-gray-400 px-2 py-0.5 rounded-full shrink-0">종료</span>}
              </div>
              <p className="text-sm font-bold text-white truncate">🇰🇷 대한민국 vs {match.opponent}</p>
              <p className="text-xs text-gray-500 mt-0.5">{match.match_date}</p>
            </div>
          </div>

          {/* 오른쪽: 결과/예측 뱃지 */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {match.is_finished && match.home_score !== null ? (
              <div className="text-center">
                <p className="text-xs text-green-400 font-semibold mb-0.5">결과</p>
                <p className="text-xl font-black text-green-400">{match.home_score}<span className="text-gray-500 mx-1 text-sm">:</span>{match.away_score}</p>
                {myPred && (
                  <p className={`text-xs font-bold mt-0.5 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '🏆 적중' : '빗나감'}
                  </p>
                )}
              </div>
            ) : myPred ? (
              <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                <p className="text-xs text-blue-400 mb-0.5">내 예측</p>
                <p className="text-lg font-black text-blue-400">{myPred.home_score}<span className="text-gray-500 mx-1 text-sm">:</span>{myPred.away_score}</p>
              </div>
            ) : (
              <div className="text-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">예측</p>
                <p className="text-xs font-bold text-gray-600">미입력</p>
              </div>
            )}
            <span className="text-gray-600 text-sm">›</span>
          </div>
        </div>

        {/* 예측 참가 현황 */}
        {matchPreds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
            <span className="text-xs text-gray-600">{matchPreds.length}명 예측 참여</span>
            <div className="flex gap-0.5 ml-1">
              {matchPreds.slice(0, 8).map(p => (
                <div key={p.id} className={`w-1.5 h-1.5 rounded-full ${
                  p.participant_name === myName ? 'bg-blue-400' : 'bg-gray-600'
                }`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
