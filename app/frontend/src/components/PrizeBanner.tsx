interface Props {
  totalPrize: number
  cumulativePrize: number
  participantCount: number
  betAmount: number
}

export default function PrizeBanner({ totalPrize, cumulativePrize, participantCount, betAmount }: Props) {
  const displayPrize = totalPrize + cumulativePrize

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-white shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">현재 상금</p>
          <p className="text-3xl font-bold">{displayPrize.toLocaleString()}원</p>
        </div>
        <div className="text-right text-sm opacity-90">
          <p>{participantCount}명 참가</p>
          <p>인당 {betAmount.toLocaleString()}원</p>
          {cumulativePrize > 0 && (
            <p className="font-semibold">이월 포함 +{cumulativePrize.toLocaleString()}원</p>
          )}
        </div>
      </div>
    </div>
  )
}
