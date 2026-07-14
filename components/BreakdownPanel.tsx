'use client'
import { Trade } from '@/lib/supabase'

type Group = { key: string; trades: Trade[] }

function computeMetrics(trades: Trade[]) {
  const decisive = trades.filter(t => t.outcome === 'Win' || t.outcome === 'Loss')
  const wins = trades.filter(t => t.outcome === 'Win').length
  const winRate = decisive.length ? (wins / decisive.length) * 100 : 0
  const rrValues = trades.map(t => t.planned_rr).filter((x): x is number => x != null)
  const avgRR = rrValues.length ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0
  const resultValues = trades.map(t => t.result_r).filter((x): x is number => x != null)
  const expectancy = resultValues.length ? resultValues.reduce((a, b) => a + b, 0) / resultValues.length : 0

  const chrono = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  let maxLossStreak = 0, streak = 0
  for (const t of chrono) {
    if (t.outcome === 'Loss') { streak++; maxLossStreak = Math.max(maxLossStreak, streak) }
    else if (t.outcome === 'Win') streak = 0
  }

  return { count: trades.length, winRate, avgRR, expectancy, maxLossStreak }
}

export default function BreakdownPanel({ groups, title, subtitle }: { groups: Group[]; title: string; subtitle: string }) {
  const rows = groups
    .map(g => ({ key: g.key, ...computeMetrics(g.trades) }))
    .sort((a, b) => b.expectancy - a.expectancy)

  return (
    <div className="bg-[#12161C] border border-[#1F252D] rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1F252D]">
        <div className="font-display font-medium text-sm">{title}</div>
        <div className="text-xs text-[#7C8695] mt-0.5">{subtitle}</div>
      </div>
      <div className="divide-y divide-[#1F252D]">
        {rows.length === 0 && (
          <div className="px-5 py-6 text-sm text-[#7C8695] font-mono">No trades logged yet</div>
        )}
        {rows.map(r => (
          <div key={r.key} className="px-5 py-3.5 grid grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-sm font-medium truncate">{r.key}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1.5 flex-1 max-w-[140px] bg-[#1F252D] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.winRate}%`, background: r.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)' }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[#7C8695]">{r.winRate.toFixed(0)}% win · {r.count} trades</span>
              </div>
            </div>
            <div className="flex gap-5 font-mono text-sm">
              <div className="text-right">
                <div className="text-[10px] text-[#7C8695] uppercase tracking-wider">Avg R:R</div>
                <div>{r.avgRR.toFixed(2)}</div>
              </div>
              <div className="text-right w-14">
                <div className="text-[10px] text-[#7C8695] uppercase tracking-wider">Expect.</div>
                <div style={{ color: r.expectancy >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                  {r.expectancy >= 0 ? '+' : ''}{r.expectancy.toFixed(2)}
                </div>
              </div>
              <div className="text-right w-10">
                <div className="text-[10px] text-[#7C8695] uppercase tracking-wider">Streak</div>
                <div className={r.maxLossStreak >= 3 ? 'text-[var(--color-loss)]' : ''}>{r.maxLossStreak}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}