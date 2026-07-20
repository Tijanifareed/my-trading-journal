/* eslint-disable react-hooks/static-components */
'use client'
import { useEffect } from 'react'
import { Trade } from '@/lib/supabase'

export default function TradeDetailModal({ trade, onClose }: { trade: Trade | null; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!trade) return null

  const outcomeColor = trade.outcome === 'Win' ? 'var(--color-profit)' : trade.outcome === 'Loss' ? 'var(--color-loss)' : 'var(--color-neutral)'
  const outcomeBg = trade.outcome === 'Win' ? 'rgba(52,195,147,0.12)' : trade.outcome === 'Loss' ? 'rgba(240,85,95,0.12)' : 'rgba(227,166,75,0.12)'

  const Row = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-[#1F252D] last:border-0">
      <span className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">{label}</span>
      <span className="font-mono text-sm" style={{ color }}>{value ?? '-'}</span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#12161C] border border-[#1F252D] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#12161C] border-b border-[#1F252D] px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-medium text-sm">{trade.pairs?.symbol ?? 'Unassigned pair'}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full" style={{ color: outcomeColor, background: outcomeBg }}>
                {trade.outcome}
              </span>
            </div>
            <div className="text-xs text-[#7C8695] mt-0.5 font-mono">{trade.date} · {trade.strategies?.name ?? 'Unassigned strategy'}</div>
          </div>
          <button onClick={onClose} className="text-[#7C8695] hover:text-[#E7EAEE] text-xl leading-none transition-colors">✕</button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {(trade.screenshot_daily_url || trade.screenshot_4h_url) ? (
              [
                { label: 'Daily', url: trade.screenshot_daily_url },
                { label: '4H', url: trade.screenshot_4h_url },
              ].map(shot => (
                <div key={shot.label}>
                  <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">{shot.label}</div>
                  {shot.url ? (
                    <a href={shot.url} target="_blank" rel="noreferrer" className="block group">
                      <img src={shot.url} alt={`${shot.label} screenshot`}
                        className="w-full rounded-md border border-[#1F252D] group-hover:opacity-90 transition-opacity" />
                    </a>
                  ) : (
                    <div className="w-full aspect-video rounded-md border border-dashed border-[#1F252D] flex items-center justify-center text-xs text-[#7C8695] font-mono">
                      Not attached
                    </div>
                  )}
                </div>
              ))
            ) : trade.screenshot_url ? (
              <div>
                <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">Screenshot</div>
                <a href={trade.screenshot_url} target="_blank" rel="noreferrer" className="block group">
                  <img src={trade.screenshot_url} alt="Trade screenshot"
                    className="w-full rounded-md border border-[#1F252D] group-hover:opacity-90 transition-opacity" />
                </a>
                <div className="text-[11px] text-[#7C8695] mt-2 font-mono">Logged before Daily/4H split</div>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-md border border-dashed border-[#1F252D] flex items-center justify-center text-sm text-[#7C8695] font-mono">
                No screenshot attached
              </div>
            )}

            {trade.notes && (
              <div>
                <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">Notes</div>
                <div className="text-sm text-[#E7EAEE] bg-[#0B0E11] border border-[#1F252D] rounded-md p-3 whitespace-pre-wrap">
                  {trade.notes}
                </div>
              </div>
            )}
          </div>

          <div>
            <Row label="Direction" value={trade.direction === 'Long' ? '▲ Long' : '▼ Short'} color={trade.direction === 'Long' ? 'var(--color-profit)' : 'var(--color-loss)'} />
            <Row label="Session" value={trade.session} color="#E7EAEE" />
            <Row label="Entry" value={trade.entry} color="#E7EAEE" />
            <Row label="Stop Loss" value={trade.stop_loss} color="#E7EAEE" />
            <Row label="Take Profit" value={trade.take_profit} color="#E7EAEE" />
            <Row label="Planned R:R" value={trade.planned_rr} color="var(--color-neutral)" />
            <Row
              label="Result R"
              value={trade.result_r != null ? `${trade.result_r >= 0 ? '+' : ''}${trade.result_r}R` : null}
              color={trade.result_r != null ? (trade.result_r >= 0 ? 'var(--color-profit)' : 'var(--color-loss)') : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}