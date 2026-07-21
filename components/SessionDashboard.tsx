/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useEffect, useState } from 'react'
import { getSessionInfo, PRACTICAL_READ, SessionInfo } from '@/lib/sessions'

const trustColor = { high: 'var(--color-profit)', medium: 'var(--color-neutral)', low: 'var(--color-loss)' }
const trustBg = { high: 'rgba(52,195,147,0.12)', medium: 'rgba(227,166,75,0.12)', low: 'rgba(240,85,95,0.12)' }

export default function SessionDashboard() {
  const [info, setInfo] = useState<SessionInfo | null>(null)

  useEffect(() => {
  setInfo(getSessionInfo())
  const id = setInterval(() => setInfo(getSessionInfo()), 1000)   // was 15000
  return () => clearInterval(id)
}, [])

  if (!info) {
    return <div className="h-64 flex items-center justify-center text-sm text-[#7C8695] font-mono">Reading the clock...</div>
  }

     const timeLabel = info.wat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const effectiveH = info.hourDecimal < 1 ? info.hourDecimal + 24 : info.hourDecimal

  return (
    <div className="space-y-6">
      {/* Header: date + live clock */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">{info.dayLabel}</div>
          <div className="font-mono text-4xl font-medium mt-1">{timeLabel} <span className="text-lg text-[#7C8695]">WAT</span></div>
        </div>
        {info.isWeekend && (
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-full" style={{ color: 'var(--color-neutral)', background: 'rgba(227,166,75,0.12)' }}>
            Weekend · Observation Mode
          </span>
        )}
      </div>

      {info.isWeekend ? (
        <WeekendCard />
      ) : (
        <>
          {/* Current phase card */}
          <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Right now</div>
                <div className="font-display font-medium text-lg mt-0.5">{info.phase.label}</div>
              </div>
              <span
                className="font-mono text-[11px] px-2.5 py-1 rounded-full shrink-0"
                style={{ color: trustColor[info.phase.trust], background: trustBg[info.phase.trust] }}
              >
                {info.phase.trust} trust
              </span>
            </div>

            <p className="text-sm text-[#C4CAD3] mb-4">{info.phase.desc}</p>

            <div className="h-1.5 bg-[#1F252D] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${info.phase.progress * 100}%`, background: trustColor[info.phase.trust] }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#7C8695]">
              <span>{info.phase.minutesRemaining} min left in this window</span>
              <span>next: {info.phase.nextLabel}</span>
            </div>
          </div>

          {/* Active session badges */}
          <div>
            <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono mb-2.5">Active Sessions</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {info.activeSessions.map(s => (
                <div
                  key={s.name}
                  className="rounded-lg border px-3 py-3 text-center transition-colors"
                  style={{
                    borderColor: s.active ? 'var(--color-profit)' : '#1F252D',
                    background: s.active ? 'rgba(52,195,147,0.08)' : '#12161C',
                  }}
                >
                  <div className="text-xs font-medium" style={{ color: s.active ? 'var(--color-profit)' : '#7C8695' }}>
                    {s.name}
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: s.active ? 'var(--color-profit)' : '#3A4250' }}>
                    {s.active ? '● live' : 'closed'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical read reference table */}
          <div className="bg-[#12161C] border border-[#1F252D] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1F252D]">
              <div className="font-display font-medium text-sm">Practical Read for Your Day</div>
              <div className="text-xs text-[#7C8695] mt-0.5">WAT</div>
            </div>
            <div className="divide-y divide-[#1F252D]">
              {PRACTICAL_READ.map(row => {
                const isCurrent = effectiveH >= row.start && effectiveH < row.end
                return (
                  <div
                    key={row.range}
                    className="px-5 py-3 flex items-center gap-4"
                    style={{ background: isCurrent ? 'rgba(52,195,147,0.06)' : 'transparent' }}
                  >
                    <span className="font-mono text-xs w-28 shrink-0" style={{ color: isCurrent ? 'var(--color-profit)' : '#7C8695' }}>
                      {row.range}
                    </span>
                    <span className="text-sm" style={{ color: isCurrent ? '#E7EAEE' : '#7C8695' }}>{row.label}</span>
                    {isCurrent && <span className="ml-auto font-mono text-[10px] text-[var(--color-profit)]">● now</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function WeekendCard() {
  return (
    <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-6">
      <div className="text-[11px] text-[var(--color-neutral)] uppercase tracking-wider font-mono mb-2">Weekend Protocol</div>
      <h2 className="font-display font-medium text-lg mb-3">Observe only</h2>
      <p className="text-sm text-[#C4CAD3] leading-relaxed">
        Watch how price behaves in low volume, mark any zones that form, and come Monday you&apos;ll have a clean
        read on what&apos;s real versus what needs to be retested with actual volume behind it.
      </p>
      <p className="text-sm text-[#C4CAD3] leading-relaxed mt-3 font-medium" style={{ color: 'var(--color-profit)' }}>
        That&apos;s not wasted time — that&apos;s prep.
      </p>
    </div>
  )
}