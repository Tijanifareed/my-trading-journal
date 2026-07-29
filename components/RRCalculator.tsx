/* eslint-disable react-hooks/static-components */
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
  const [mode, setMode] = useState<'risk' | 'margin'>('risk')
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long')
  const [accountSize, setAccountSize] = useState('')
  const [riskPct, setRiskPct] = useState('2')
  const [marginToUse, setMarginToUse] = useState('')
  const [entry, setEntry] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [feePct, setFeePct] = useState('0.055')
  const [leverage, setLeverage] = useState('1')

  const input = "bg-[#0B0E11] border border-[#1F252D] rounded-md px-3 py-2 w-full text-sm font-mono focus:outline-none focus:border-[#3A4250] transition-colors"

  const results = useMemo(() => {
    const e = parseFloat(entry)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const exit = parseFloat(exitPrice)
    const acct = parseFloat(accountSize)
    const risk = parseFloat(riskPct)
    const fee = parseFloat(feePct) || 0
    const lev = parseFloat(leverage) || 1
    const margin = parseFloat(marginToUse)

    if (isNaN(e) || isNaN(sl) || e === sl) return null

    const riskPerUnit = Math.abs(e - sl)
    const validDirection = (direction === 'Long' && sl < e) || (direction === 'Short' && sl > e)

    let riskAmount: number | null = null
    let positionSize: number | null = null
    let positionValue: number | null = null
    let marginRequired: number | null = null
    let impliedRiskPct: number | null = null

    if (mode === 'risk') {
      // Risk-first: you set the dollar risk, position size is derived.
      // Leverage only affects margin locked up — P&L is unaffected by leverage in this mode.
      if (!isNaN(acct) && !isNaN(risk) && acct > 0 && risk > 0) {
        riskAmount = acct * (risk / 100)
        positionSize = riskAmount / riskPerUnit
        positionValue = positionSize * e
        marginRequired = lev > 0 ? positionValue / lev : null
      }
    } else {
      // Margin-first: you set margin + leverage, position size (and therefore risk/profit) is derived from that.
      if (!isNaN(margin) && margin > 0 && lev > 0) {
        marginRequired = margin
        positionValue = margin * lev
        positionSize = positionValue / e
        riskAmount = positionSize * riskPerUnit
        if (!isNaN(acct) && acct > 0) {
          impliedRiskPct = (riskAmount / acct) * 100
        }
      }
    }

    // USDT P&L for a given exit price, given current position size, including entry+exit fees
    function pnlFor(exitPx: number): { gross: number; fees: number; net: number } | null {
      if (positionSize == null || positionValue == null) return null
      const gross = direction === 'Long'
        ? (exitPx - e) * positionSize
        : (e - exitPx) * positionSize
      const exitValue = positionSize * exitPx
      const feesPaid = (positionValue * (fee / 100)) + (exitValue * (fee / 100))
      return { gross, fees: feesPaid, net: gross - feesPaid }
    }

    let plannedRR: number | null = null
    let tpValid = true
    let plannedPnL: ReturnType<typeof pnlFor> = null
    if (!isNaN(tp)) {
      const rewardPerUnit = direction === 'Long' ? tp - e : e - tp
      plannedRR = rewardPerUnit / riskPerUnit
      tpValid = rewardPerUnit > 0
      plannedPnL = pnlFor(tp)
    }

    // Approximate liquidation price — ignores maintenance margin & funding, exchange-specific in reality
    let liqPrice: number | null = null
    let liqInsideStop = false
    if (positionValue != null && lev > 0) {
      liqPrice = direction === 'Long' ? e * (1 - 1 / lev) : e * (1 + 1 / lev)
      liqInsideStop = direction === 'Long' ? liqPrice >= sl : liqPrice <= sl
    }

    let resultR: number | null = null
    let actualPnL: ReturnType<typeof pnlFor> = null
    if (!isNaN(exit)) {
      const movePerUnit = direction === 'Long' ? exit - e : e - exit
      resultR = movePerUnit / riskPerUnit
      actualPnL = pnlFor(exit)
    }

    const stopLossPnL = pnlFor(sl)

    return {
      riskPerUnit, validDirection, riskAmount, positionSize, positionValue, marginRequired,
      impliedRiskPct, plannedRR, tpValid, plannedPnL, resultR, actualPnL, stopLossPnL, risk,
      lev, liqPrice, liqInsideStop,
    }
  }, [mode, direction, accountSize, riskPct, marginToUse, entry, stopLoss, takeProfit, exitPrice, feePct, leverage])

  function copyResultR() {
    if (results?.resultR != null) navigator.clipboard.writeText(results.resultR.toFixed(2))
  }

  const PnLRow = ({ label, pnl, sub }: { label: string; pnl: { gross: number; fees: number; net: number } | null; sub?: string }) => {
    if (!pnl) return null
    return (
      <div className="flex justify-between items-start py-2 border-b border-[#1F252D] last:border-0">
        <div>
          <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">{label}</span>
          {sub && <div className="text-[10px] text-[#3A4250] font-mono mt-0.5">{sub}</div>}
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-medium" style={{ color: pnl.net >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
            {pnl.net >= 0 ? '+' : ''}{pnl.net.toFixed(2)} USDT
          </div>
          <div className="text-[10px] text-[#7C8695] font-mono">gross {pnl.gross >= 0 ? '+' : ''}{pnl.gross.toFixed(2)} · fees -{pnl.fees.toFixed(2)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Inputs */}
      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5 space-y-4">
        <div>
          <div className="font-display font-medium text-sm">Trade Inputs</div>
          <div className="text-xs text-[#7C8695] mt-0.5">Fill in what you have results update live</div>
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

        <Field label="Sizing Method">
          <div className="flex gap-2">
            {(['risk', 'margin'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 rounded-md py-2 text-xs font-mono transition-colors border"
                style={{
                  borderColor: mode === m ? '#3A4250' : '#1F252D',
                  color: mode === m ? '#E7EAEE' : '#7C8695',
                  background: mode === m ? '#1F252D' : 'transparent',
                }}
              >
                {m === 'risk' ? 'Risk-based (2% rule)' : 'Margin-based (leverage sizes it)'}
              </button>
            ))}
          </div>
        </Field>

        {mode === 'risk' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Size (USDT)"><input type="number" step="any" className={input} placeholder="1000" value={accountSize} onChange={e => setAccountSize(e.target.value)} /></Field>
            <Field label="Risk % (max 2)"><input type="number" step="any" className={input} placeholder="2" value={riskPct} onChange={e => setRiskPct(e.target.value)} /></Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Margin to Use (USDT)"><input type="number" step="any" className={input} placeholder="500" value={marginToUse} onChange={e => setMarginToUse(e.target.value)} /></Field>
            <Field label="Account Size (USDT, optional)"><input type="number" step="any" className={input} placeholder="for % check" value={accountSize} onChange={e => setAccountSize(e.target.value)} /></Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fee % per side (taker ≈ 0.055)">
            <input type="number" step="any" className={input} placeholder="0.055" value={feePct} onChange={e => setFeePct(e.target.value)} />
          </Field>
          <Field label="Leverage (1 = spot/no leverage)">
            <input type="number" step="any" className={input} placeholder="1" value={leverage} onChange={e => setLeverage(e.target.value)} />
          </Field>
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
          <div className="text-xs text-[#7C8695] mt-0.5">Position size, R:R, and USDT P&L (fees included)</div>
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

            {/* Sizing */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Risk per unit</span>
                <span className="font-mono text-sm">{results.riskPerUnit.toFixed(4)}</span>
              </div>

              {results.riskAmount != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">
                    {mode === 'risk' ? 'Risk amount (set by you)' : 'Risk amount (derived)'}
                  </span>
                  <span
                    className="font-mono text-sm"
                    style={{ color: (mode === 'risk' ? results.risk > 2 : (results.impliedRiskPct ?? 0) > 2) ? 'var(--color-loss)' : 'var(--color-neutral)' }}
                  >
                    {results.riskAmount.toFixed(2)} USDT
                    {mode === 'margin' && results.impliedRiskPct != null && ` (${results.impliedRiskPct.toFixed(2)}% of account)`}
                    {mode === 'risk' && results.risk > 2 && ' ⚠ over 2% rule'}
                    {mode === 'margin' && results.impliedRiskPct != null && results.impliedRiskPct > 2 && ' ⚠ over 2% rule'}
                  </span>
                </div>
              )}

              {results.marginRequired != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#1F252D]">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Margin ({results.lev}x)</span>
                  <span className="font-mono text-sm">{results.marginRequired.toFixed(2)} USDT</span>
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

              {results.lev > 1 && results.liqPrice != null && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Est. liquidation price</span>
                  <span className="font-mono text-sm" style={{ color: results.liqInsideStop ? 'var(--color-loss)' : '#E7EAEE' }}>
                    {results.liqPrice.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {results.liqInsideStop && (
              <div className="text-xs font-mono px-3 py-2 rounded-md" style={{ color: 'var(--color-loss)', background: 'rgba(240,85,95,0.1)' }}>
                ⚠ Liquidation price sits before your stop loss — you&apos;d get liquidated before your stop fills. Lower leverage or widen margin.
              </div>
            )}

            {/* USDT outcome */}
            {(results.plannedPnL || results.actualPnL || results.stopLossPnL) && (
              <>
                <div className="h-px bg-[#1F252D]" />
                <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">USDT Outcome</div>
                <PnLRow label="If stopped out" pnl={results.stopLossPnL} sub="worst case at your stop loss" />
                <PnLRow label="If TP hits (planned)" pnl={results.plannedPnL} />
                {results.actualPnL && (
                  <div className="flex justify-between items-start py-2">
                    <div>
                      <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Actual exit</span>
                      {results.resultR != null && (
                        <div className="text-[10px] text-[#3A4250] font-mono mt-0.5">{results.resultR >= 0 ? '+' : ''}{results.resultR.toFixed(2)}R</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono text-lg font-medium" style={{ color: results.actualPnL.net >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                          {results.actualPnL.net >= 0 ? '+' : ''}{results.actualPnL.net.toFixed(2)} USDT
                        </div>
                        <div className="text-[10px] text-[#7C8695] font-mono">gross {results.actualPnL.gross >= 0 ? '+' : ''}{results.actualPnL.gross.toFixed(2)} · fees -{results.actualPnL.fees.toFixed(2)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={copyResultR}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-[#1F252D] hover:bg-[#2A313B] text-[#7C8695] hover:text-[#E7EAEE] transition-colors shrink-0"
                      >
                        copy R
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}