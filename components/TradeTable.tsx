'use client'
import { Trade } from '@/lib/supabase'

export default function TradeTable({ trades }: { trades: Trade[] }) {
  const outcomeStyle = (o: string | null) => {
    if (o === 'Win') return { color: 'var(--color-profit)', bg: 'rgba(52,195,147,0.12)' }
    if (o === 'Loss') return { color: 'var(--color-loss)', bg: 'rgba(240,85,95,0.12)' }
    return { color: 'var(--color-neutral)', bg: 'rgba(227,166,75,0.12)' }
  }

  return (
    <div className="bg-[#12161C] border border-[#1F252D] rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1F252D]">
        <div className="font-display font-medium text-sm">Trade Log</div>
        <div className="text-xs text-[#7C8695] mt-0.5">{trades.length} trade{trades.length !== 1 ? 's' : ''}</div>
      </div>

      {trades.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#7C8695] font-mono">No trades match these filters</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[#7C8695] uppercase tracking-wider font-mono border-b border-[#1F252D]">
                <th className="text-left px-5 py-2.5 font-normal">Date</th>
                <th className="text-left px-3 py-2.5 font-normal">Strategy</th>
                <th className="text-left px-3 py-2.5 font-normal">Pair</th>
                <th className="text-left px-3 py-2.5 font-normal">Session</th>
                <th className="text-left px-3 py-2.5 font-normal">Dir</th>
                <th className="text-right px-3 py-2.5 font-normal">Entry</th>
                <th className="text-right px-3 py-2.5 font-normal">SL</th>
                <th className="text-right px-3 py-2.5 font-normal">TP</th>
                <th className="text-right px-3 py-2.5 font-normal">R:R</th>
                <th className="text-left px-3 py-2.5 font-normal">Outcome</th>
                <th className="text-right px-3 py-2.5 font-normal">Result</th>
                <th className="text-center px-3 py-2.5 font-normal">Shot</th>
                <th className="text-left px-3 py-2.5 font-normal">Notes</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => {
                const os = outcomeStyle(t.outcome)
                return (
                  <tr key={t.id} className="border-b border-[#1F252D] last:border-0 hover:bg-[#161B22] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#7C8695] whitespace-nowrap">{t.date}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{t.strategies?.name ?? '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{t.pairs?.symbol ?? '-'}</td>
                    <td className="px-3 py-3 text-xs text-[#7C8695] whitespace-nowrap">{t.session}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span style={{ color: t.direction === 'Long' ? 'var(--color-profit)' : 'var(--color-loss)' }} className="font-mono text-xs">
                        {t.direction === 'Long' ? '▲ Long' : '▼ Short'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-right">{t.entry ?? '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-right text-[#7C8695]">{t.stop_loss ?? '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-right text-[#7C8695]">{t.take_profit ?? '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-right">{t.planned_rr ?? '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full" style={{ color: os.color, background: os.bg }}>
                        {t.outcome}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-right font-medium" style={{ color: t.result_r != null ? (t.result_r >= 0 ? 'var(--color-profit)' : 'var(--color-loss)') : '#7C8695' }}>
                      {t.result_r != null ? `${t.result_r >= 0 ? '+' : ''}${t.result_r}R` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {t.screenshot_url ? (
                        <a href={t.screenshot_url} target="_blank" rel="noreferrer"
                          className="text-[#7C8695] hover:text-[#E7EAEE] transition-colors" title="View screenshot">
                          🖼
                        </a>
                      ) : <span className="text-[#3A4250]">-</span>}
                    </td>
                    <td className="px-3 py-3 max-w-[200px] truncate text-xs text-[#7C8695]" title={t.notes ?? ''}>{t.notes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}