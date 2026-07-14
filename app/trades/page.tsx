'use client'
import { useEffect, useState } from 'react'
import { supabase, Strategy, Pair, Trade } from '@/lib/supabase'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import TradeDetailModal from '@/components/TradeDetailModal'

export default function TradesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [pairs, setPairs] = useState<Pair[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [filterStrategy, setFilterStrategy] = useState('')
  const [filterPair, setFilterPair] = useState('')
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  async function loadAll() {
    const [{ data: s }, { data: p }, { data: t }] = await Promise.all([
      supabase.from('strategies').select('*').order('name'),
      supabase.from('pairs').select('*').order('symbol'),
      supabase.from('trades').select('*, strategies(name), pairs(symbol)').order('date', { ascending: false }),
    ])
    setStrategies(s ?? [])
    setPairs(p ?? [])
    setTrades(t ?? [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAll() }, [])

  const filtered = trades.filter(t =>
    (!filterStrategy || t.strategy_id === filterStrategy) &&
    (!filterPair || t.pair_id === filterPair)
  )

  const selectClass = "bg-[#12161C] border border-[#1F252D] rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#3A4250] transition-colors"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">Trade Log</h1>
        <p className="text-sm text-[#7C8695] mt-1">Log a trade, then filter and review below</p>
      </div>

      <TradeForm strategies={strategies} pairs={pairs} onSaved={loadAll} onStrategyAdded={loadAll} onPairAdded={loadAll} />

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#7C8695] uppercase tracking-wider font-mono">Filter</span>
        <select className={selectClass} value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)}>
          <option value="">All strategies</option>
          {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className={selectClass} value={filterPair} onChange={e => setFilterPair(e.target.value)}>
          <option value="">All pairs</option>
          {pairs.map(p => <option key={p.id} value={p.id}>{p.symbol}</option>)}
        </select>
        {(filterStrategy || filterPair) && (
          <button onClick={() => { setFilterStrategy(''); setFilterPair('') }}
            className="text-xs text-[#7C8695] hover:text-[#E7EAEE] font-mono transition-colors">
            clear
          </button>
        )}
      </div>

      <TradeTable trades={filtered} onSelect={setSelectedTrade} />
      <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </div>
  )
}