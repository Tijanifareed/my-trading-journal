'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Trade } from '@/lib/supabase'

export default function EquityCurve({ trades }: { trades: Trade[] }) {
     const chrono = [...trades]
          .filter(t => t.result_r != null)
          .sort((a, b) => a.date.localeCompare(b.date))

     let running = 0
     const data = chrono.map((t, i) => {
          // eslint-disable-next-line react-hooks/immutability
          running += t.result_r ?? 0
          return { i: i + 1, date: t.date, cumR: Number(running.toFixed(2)) }
     })

     const last = data[data.length - 1]?.cumR ?? 0
     const color = last >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'

     if (data.length === 0) {
          return (
               <div className="h-64 flex items-center justify-center text-[#7C8695] text-sm font-mono border border-dashed border-[#1F252D] rounded-lg">
                    No closed trades yet — log a result to see your equity curve
               </div>
          )
     }

     return (
          <div className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5">
               <div className="flex items-baseline justify-between mb-4">
                    <div>
                         <div className="text-xs text-[#7C8695] font-mono uppercase tracking-wider">Equity Curve</div>
                         <div className="text-xs text-[#7C8695] mt-0.5">Cumulative R across all closed trades</div>
                    </div>
                    <div className="font-mono text-xl font-medium" style={{ color }}>
                         {last >= 0 ? '+' : ''}{last.toFixed(2)}R
                    </div>
               </div>
               <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                                   <stop offset="100%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                         </defs>
                         <XAxis dataKey="i" tick={{ fill: '#7C8695', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: '#1F252D' }} tickLine={false} />
                         <YAxis tick={{ fill: '#7C8695', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={40} />
                         <ReferenceLine y={0} stroke="#1F252D" />
                         <Tooltip
                              contentStyle={{ background: '#0B0E11', border: '1px solid #1F252D', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                              labelStyle={{ color: '#7C8695' }}
                              formatter={(v) => {
                                   const num = Number(v)
                                   return [`${num >= 0 ? '+' : ''}${num}R`, 'Cumulative']
                              }}
                              labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ''}
                         />
                         <Area type="monotone" dataKey="cumR" stroke={color} strokeWidth={2} fill="url(#equityFill)" />
                    </AreaChart>
               </ResponsiveContainer>
          </div>
     )
}