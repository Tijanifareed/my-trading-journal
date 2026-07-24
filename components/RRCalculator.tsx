'use client'
import { useState, useMemo } from 'react'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function RRCalculator() {
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long')
  const [accountSize, setAccountSize] = useState('')
  const [riskPct, setRiskPct] = useState('2')
  const [entry, setEntry] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [exitPrice, setExitPrice] = useState('')

  const input = "bg-[#0B0E11] border border-[#1F252D] rounded-md px-3 py-2 w-full text-sm font-mono focus:outline-none focus:border-[#3A4250] transition-colors"

  const results = useMemo(() => {
    const e = parseFloat(entry)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const exit = parseFloat(exitPrice)
    const acct = parseFloat(accountSize)
    const risk = parseFloat(riskPct)

    if (isNaN(e) || isNaN(sl) || e === sl) return null

    const riskPerUnit = Math.abs(e - sl)
    const validDirection =
      (direction === 'Long' && sl < e) || (direction === 'Short' && sl > e)

    let riskAmount: number | null = null
    let positionSize: number | null = null
    if (!isNaN(acct) && !isNaN(risk) && acct > 0 && risk > 0) {
      riskAmount = acct * (risk / 100)
      positionSize = riskAmount / riskPerUnit
    }

    let plannedRR: number | null = null
    let tpValid = true
    if (!isNaN(tp)) {
      const rewardPerUnit = direction === 'Long' ? tp - e : e - tp
      plannedRR = rewardPerUnit / riskPerUnit
      tpValid = rewardPerUnit > 0
    }

    let resultR: number | null = null
    if (!isNaN(exit)) {
      const movePerUnit = direction === 'Long' ? exit - e : e - exit
      resultR = movePerUnit / riskPerUnit
    }

    return { riskPerUnit, validDirection, riskAmount, positionSize, plannedRR, tpValid, resultR, risk }
  }, [direction, accountSize, riskPct, entry, stopLoss, takeProfit, exitPrice])

  function copyResultR() {
    if (results?.resultR != null) {
      navigator.clipboard.writeText(results.resultR.toFixed(2))
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Inputs */}
      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5 space-y-4">
        <div>
          <div className="font-display font-medium text-sm">Trade Inputs</div>
          <div className="text-xs text-[#7C8695] mt-0.5">Fill in what you have — results update live</div>
        </div>

        <Field label="Direction">
          <div className="flex gap-2">
            {(['Long', 'Short'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className="flex-1 rounded-md py-2 text-sm font-mono transition-colors border"
                style={{
                  borderColor: direction === d ? (d === 'Long' ? 'var(--color-profit)' : 'var(--color-loss)') : '#1F252D',
                  color: direction === d ? (d === 'Long' ? 'var(--color-profit)' : 'var(--color-loss)') : '#7C8695',
                  background: direction === d ? (d === 'Long' ? 'rgba(52,195,147,0.08)' : 'rgba(240,85,95,0.08)') : 'transparent',
                }}
              >
                {d === 'Long' ? '▲ Long' : '▼ Short'}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Account Size ($)"><input type="number" step="any" className={input} placeholder="1000" value={accountSize} onChange={e => setAccountSize(e.target.value)} /></Field>
          <Field label="Risk % (max 2)"><input type="number" step="any" className={input} placeholder="2" value={riskPct} onChange={e => setRiskPct(e.target.value)} /></Field>
        </div>

        <div className="h-px bg-[#1F252D]" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Entry Price"><input type="number" step="any" className={input} placeholder="0.00" value={entry} onChange={e => setEntry(e.target.value)} /></Field>
          <Field label="Stop Loss"><input type="number" step="any" className={input} placeholder="0.00" value={stopLoss} onChange={e => setStopLoss(e.target.value)} /></Field>
          <Field label="Take Profit (planned)"><input type="number" step="any" className={input} placeholder="0.00" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} /></Field>
          <Field label="Exit Price (actual)"><input type="number" step="any" className={input} placeholder="optional" value={exitPrice} onChange={e => setExitPrice(e.target.value)} /></Field>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5 space-y-4">
        <div>
          <div className="font-display font-medium text-sm">Results</div>
          <div className="text-xs text-[#7C8695] mt-0.5">Position size, planned R:R, result R</div>
        </div>

        {!results ? (
          <div className="text-sm text-[#7C8695] font-mono py-8 text-center">Enter entry + stop loss to begin</div>
        ) : (
          <>
            {!results.validDirection && (
              <div className="text-xs font-mono px-3 py-2 rounded-md" style={{ color: 'var(--color-loss)', background: 'rgba(240,85,95,0.1)' }}>
                Stop loss is on the wrong side of entry for a {direction} — check your prices
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Risk per unit</span>
                <span className="font-mono text-sm">{results.riskPerUnit.toFixed(4)}</span>
              </div>

              {results.riskAmount != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Risk amount</span>
                  <span className="font-mono text-sm" style={{ color: results.risk > 2 ? 'var(--color-loss)' : 'var(--color-neutral)' }}>
                    ${results.riskAmount.toFixed(2)} {results.risk > 2 && '⚠ over 2% rule'}
                  </span>
                </div>
              )}

              {results.positionSize != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Position size</span>
                  <span className="font-mono text-sm">{results.positionSize.toFixed(6)} units</span>
                </div>
              )}

              {results.plannedRR != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Planned R:R</span>
                  <span className="font-mono text-sm" style={{ color: !results.tpValid ? 'var(--color-loss)' : results.plannedRR >= 2 ? 'var(--color-profit)' : 'var(--color-neutral)' }}>
                    {!results.tpValid ? 'TP is wrong side of entry' : `1 : ${results.plannedRR.toFixed(2)}`}
                    {results.tpValid && results.plannedRR < 2 && ' (below 1:2 min)'}
                  </span>
                </div>
              )}

              {results.resultR != null && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Result R</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-medium" style={{ color: results.resultR >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                      {results.resultR >= 0 ? '+' : ''}{results.resultR.toFixed(2)}R
                    </span>
                    <button
                      type="button"
                      onClick={copyResultR}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-[#1F252D] hover:bg-[#2A313B] text-[#7C8695] hover:text-[#E7EAEE] transition-colors"
                    >
                      copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}