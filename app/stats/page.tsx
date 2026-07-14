'use client'
import { useEffect, useState } from 'react'
import { supabase, Trade } from '@/lib/supabase'
import EquityCurve from '@/components/EquityCurve'
import BreakdownPanel from '@/components/BreakdownPanel'

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

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-4">
      <div className="text-[10px] text-[#7C8695] uppercase tracking-wider font-mono">{label}</div>
      <div className="font-mono text-2xl mt-1.5" style={{ color: accent }}>{value}</div>
    </div>
  )
}

export default function StatsPage() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    supabase.from('trades').select('*, strategies(name), pairs(symbol)')
      .then(({ data }) => setTrades(data ?? []))
  }, [])

  const groupBy = (keyFn: (t: Trade) => string) =>
    Object.values(
      trades.reduce<Record<string, { key: string; trades: Trade[] }>>((acc, t) => {
        const key = keyFn(t)
        if (!acc[key]) acc[key] = { key, trades: [] }
        acc[key].trades.push(t)
        return acc
      }, {})
    )

  const byStrategy = groupBy(t => t.strategies?.name ?? 'Unassigned')
  const byPair = groupBy(t => t.pairs?.symbol ?? 'Unassigned')
  const byBoth = groupBy(t => `${t.strategies?.name ?? 'Unassigned'} / ${t.pairs?.symbol ?? 'Unassigned'}`)

  const overall = computeMetrics(trades)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">Stats</h1>
        <p className="text-sm text-[#7C8695] mt-1">Performance across every logged trade</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Trades" value={String(overall.count)} accent="#E7EAEE" />
        <KpiCard label="Win Rate" value={`${overall.winRate.toFixed(1)}%`} accent={overall.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'} />
        <KpiCard label="Avg R:R" value={overall.avgRR.toFixed(2)} accent="var(--color-neutral)" />
        <KpiCard label="Expectancy" value={`${overall.expectancy >= 0 ? '+' : ''}${overall.expectancy.toFixed(2)}R`} accent={overall.expectancy >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'} />
        <KpiCard label="Max Loss Streak" value={String(overall.maxLossStreak)} accent={overall.maxLossStreak >= 3 ? 'var(--color-loss)' : '#E7EAEE'} />
      </div>

      <EquityCurve trades={trades} />

      <div className="grid md:grid-cols-2 gap-4">
        <BreakdownPanel groups={byStrategy} title="By Strategy" subtitle="Sorted by expectancy, best first" />
        <BreakdownPanel groups={byPair} title="By Pair" subtitle="Sorted by expectancy, best first" />
      </div>

      <BreakdownPanel groups={byBoth} title="By Strategy × Pair" subtitle="Which strategy actually works on which pair" />
    </div>
  )
}