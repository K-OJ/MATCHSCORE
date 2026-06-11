interface Props {
  totalPrize: number
  cumulativePrize: number
  participantCount: number
  betAmount: number
}

export default function PrizeBanner({ totalPrize, cumulativePrize, participantCount, betAmount }: Props) {
  const displayPrize = totalPrize + cumulativePrize

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-px shadow-xl shadow-orange-500/20">
      <div className="relative rounded-2xl bg-gradient-to-br from-yellow-400/90 via-orange-400/90 to-red-500/90 p-5">
        {/* 배경 장식 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 font-black select-none">₩</div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-900/70 text-xs font-semibold uppercase tracking-wider">
                {cumulativePrize > 0 ? '이월 누적 상금' : '총 상금'}
              </span>
              {cumulativePrize > 0 && (
                <span className="bg-yellow-900/20 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  ROLLOVER
                </span>
              )}
            </div>
            <p className="text-4xl font-black text-white drop-shadow">
              {displayPrize.toLocaleString()}
              <span className="text-2xl ml-1">원</span>
            </p>
          </div>

          <div className="text-right">
            <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
              <p className="text-white font-black text-xl">{participantCount}<span className="text-sm font-semibold ml-0.5">명</span></p>
              <p className="text-yellow-100 text-xs">인당 {betAmount.toLocaleString()}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
