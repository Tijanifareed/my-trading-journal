export type SessionInfo = {
  wat: Date
  hourDecimal: number
  dayLabel: string
  isWeekend: boolean
  activeSessions: { name: string; active: boolean }[]
  phase: {
    label: string
    desc: string
    trust: 'high' | 'medium' | 'low'
    progress: number // 0-1 through current phase
    minutesRemaining: number
    nextLabel: string
  }
}

const PHASES = [
  { start: 1, end: 8, label: 'Pre-London compression', desc: "Watch, mark zones, don't trust breaks yet", trust: 'low' as const },
  { start: 8, end: 9, label: 'Pre-London positioning', desc: 'European desks starting to come online, volume ticking up, but not session volume yet. Stay alert, don\u2019t act on it.', trust: 'low' as const },
  { start: 9, end: 14, label: 'London build', desc: 'Volatility building, stay alert', trust: 'medium' as const },
  { start: 14, end: 18, label: 'London/NY Overlap', desc: 'Your best trading window, highest-trust confirmations', trust: 'high' as const },
  { start: 18, end: 22, label: 'NY continuation', desc: 'Still decent NY volume, workable', trust: 'medium' as const },
  { start: 22, end: 25, label: 'Liquidity-grab window', desc: 'Low trust, treat any "confirmation" here with suspicion', trust: 'low' as const },
]

function getWATNow(): Date {
  // WAT (West Africa Time) is a fixed UTC+1 offset, no DST — Africa/Lagos matches it
  const now = new Date()
  const watString = now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' })
  return new Date(watString)
}

export function getSessionInfo(): SessionInfo {
  const wat = getWATNow()
  const hourDecimal = wat.getHours() + wat.getMinutes() / 60
  const effectiveH = hourDecimal < 1 ? hourDecimal + 24 : hourDecimal
  const day = wat.getDay() // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6

  const activeSessions = [
    { name: 'Asian', active: effectiveH >= 1 && effectiveH < 10 },
    { name: 'London', active: effectiveH >= 9 && effectiveH < 18 },
    { name: 'New York', active: effectiveH >= 14 && effectiveH < 23 },
    { name: 'Overlap', active: effectiveH >= 14 && effectiveH < 18 },
    { name: 'Thin / Liquidity-grab', active: effectiveH >= 22 && effectiveH < 25 },
  ]

  const phaseIndex = PHASES.findIndex(p => effectiveH >= p.start && effectiveH < p.end)
  const phase = PHASES[phaseIndex] ?? PHASES[0]
  const next = PHASES[(phaseIndex + 1) % PHASES.length]

  const progress = (effectiveH - phase.start) / (phase.end - phase.start)
  const minutesRemaining = Math.round((phase.end - effectiveH) * 60)

  return {
    wat,
    hourDecimal,
    dayLabel: wat.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Africa/Lagos' }),
    isWeekend,
    activeSessions,
    phase: {
      label: phase.label,
      desc: phase.desc,
      trust: phase.trust,
      progress: Math.min(Math.max(progress, 0), 1),
      minutesRemaining,
      nextLabel: next.label,
    },
  }
}

export const PRACTICAL_READ = [
  { range: '01:00–08:00', label: 'Watch, mark zones, don\u2019t trust breaks', start: 1, end: 8 },
  { range: '08:00–09:00', label: 'Desks stirring, volume ticking up, stay alert, don\u2019t act yet', start: 8, end: 9 },
  { range: '09:00–14:00', label: 'Volatility building, stay alert', start: 9, end: 14 },
  { range: '14:00–18:00', label: 'Your best trading window, highest-trust confirmations', start: 14, end: 18 },
  { range: '18:00–22:00', label: 'Still decent NY volume, workable', start: 18, end: 22 },
  { range: '22:00–01:00', label: 'Low trust, be skeptical of any signal', start: 22, end: 25 },
]