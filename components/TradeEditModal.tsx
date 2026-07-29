/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { supabase, Strategy, Pair, Trade } from '@/lib/supabase'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
     return (
          <div>
               <label className="block text-[10px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">{label}</label>
               {children}
          </div>
     )
}

export default function TradeEditModal({
     trade, strategies, pairs, onClose, onSaved, onDeleted,
}: {
     trade: Trade
     strategies: Strategy[]
     pairs: Pair[]
     onClose: () => void
     onSaved: () => void
     onDeleted: () => void
}) {
     const [form, setForm] = useState<{
          date: string
          strategy_id: string
          pair_id: string
          session: 'Asian' | 'London' | 'NY' | 'Overlap'
          direction: 'Long' | 'Short'
          entry: string
          stop_loss: string
          take_profit: string
          planned_rr: string
          outcome: 'Win' | 'Loss' | 'Breakeven'
          result_r: string
          notes: string
     }>({
          date: trade.date,
          strategy_id: trade.strategy_id ?? '',
          pair_id: trade.pair_id ?? '',
          session: trade.session ?? 'London',
          direction: trade.direction ?? 'Long',
          entry: trade.entry?.toString() ?? '',
          stop_loss: trade.stop_loss?.toString() ?? '',
          take_profit: trade.take_profit?.toString() ?? '',
          planned_rr: trade.planned_rr?.toString() ?? '',
          outcome: trade.outcome ?? 'Win',
          result_r: trade.result_r?.toString() ?? '',
          notes: trade.notes ?? '',
     })
     const [fileDaily, setFileDaily] = useState<File | null>(null)
     const [file4h, setFile4h] = useState<File | null>(null)
     const [saving, setSaving] = useState(false)
     const [deleting, setDeleting] = useState(false)

     const input = "bg-[#0B0E11] border border-[#1F252D] rounded-md px-3 py-2 w-full text-sm font-mono focus:outline-none focus:border-[#3A4250] transition-colors"

     async function uploadShot(file: File) {
          const path = `${Date.now()}-${file.name}`
          const { error } = await supabase.storage.from('trade-screenshots').upload(path, file)
          if (error) throw error
          return supabase.storage.from('trade-screenshots').getPublicUrl(path).data.publicUrl
     }

     async function handleSave(e: React.FormEvent) {
          e.preventDefault()
          if (!form.strategy_id) { alert('Please select a strategy'); return }
          if (!form.pair_id) { alert('Please select a pair'); return }
          setSaving(true)

          let screenshot_daily_url = trade.screenshot_daily_url
          let screenshot_4h_url = trade.screenshot_4h_url

          try {
               if (fileDaily) screenshot_daily_url = await uploadShot(fileDaily)
               if (file4h) screenshot_4h_url = await uploadShot(file4h)
          } catch (err: any) {
               alert(err.message)
               setSaving(false)
               return
          }

          const { error } = await supabase.from('trades').update({
               date: form.date,
               strategy_id: form.strategy_id,
               pair_id: form.pair_id,
               session: form.session,
               direction: form.direction,
               entry: form.entry ? Number(form.entry) : null,
               stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
               take_profit: form.take_profit ? Number(form.take_profit) : null,
               planned_rr: form.planned_rr ? Number(form.planned_rr) : null,
               outcome: form.outcome,
               result_r: form.result_r ? Number(form.result_r) : null,
               notes: form.notes,
               screenshot_daily_url,
               screenshot_4h_url,
          }).eq('id', trade.id)

          setSaving(false)
          if (error) { alert(error.message); return }
          onSaved()
     }

     async function handleDelete() {
          if (!confirm('Delete this trade? This cannot be undone.')) return
          setDeleting(true)
          const { error } = await supabase.from('trades').delete().eq('id', trade.id)
          setDeleting(false)
          if (error) { alert(error.message); return }
          onDeleted()
     }

     return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
               <form
                    onSubmit={handleSave}
                    className="bg-[#12161C] border border-[#1F252D] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
               >
                    <div className="sticky top-0 bg-[#12161C] border-b border-[#1F252D] px-5 py-4 flex items-center justify-between">
                         <div className="font-display font-medium text-sm">Edit Trade</div>
                         <button type="button" onClick={onClose} className="text-[#7C8695] hover:text-[#E7EAEE] text-xl leading-none transition-colors">✕</button>
                    </div>

                    <div className="p-5 space-y-4">
                         <div className="grid grid-cols-2 gap-3">
                              <Field label="Date">
                                   <input type="date" className={input} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                              </Field>
                              <Field label="Session">
                                   <select className={input} value={form.session}
                                        onChange={e => setForm({ ...form, session: e.target.value as 'Asian' | 'London' | 'NY' | 'Overlap' })}>
                                        {['Asian', 'London', 'NY', 'Overlap'].map(s => <option key={s}>{s}</option>)}
                                   </select>
                              </Field>

                              <Field label="Strategy">
                                   <select className={input} value={form.strategy_id} onChange={e => setForm({ ...form, strategy_id: e.target.value })}>
                                        {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                   </select>
                              </Field>
                              <Field label="Pair">
                                   <select className={input} value={form.pair_id} onChange={e => setForm({ ...form, pair_id: e.target.value })}>
                                        {pairs.map(p => <option key={p.id} value={p.id}>{p.symbol}</option>)}
                                   </select>
                              </Field>

                              <Field label="Direction">
                                   <select className={input} value={form.direction}
                                        onChange={e => setForm({ ...form, direction: e.target.value as 'Long' | 'Short' })}>
                                        <option>Long</option><option>Short</option>
                                   </select>
                              </Field>
                              <Field label="Outcome">
                                   <select className={input} value={form.outcome}
                                        onChange={e => setForm({ ...form, outcome: e.target.value as 'Win' | 'Loss' | 'Breakeven' })}>
                                        <option>Win</option><option>Loss</option><option>Breakeven</option>
                                   </select>
                              </Field>

                              <Field label="Entry">
                                   <input type="number" step="any" className={input} value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} />
                              </Field>
                              <Field label="Stop Loss">
                                   <input type="number" step="any" className={input} value={form.stop_loss} onChange={e => setForm({ ...form, stop_loss: e.target.value })} />
                              </Field>
                              <Field label="Take Profit">
                                   <input type="number" step="any" className={input} value={form.take_profit} onChange={e => setForm({ ...form, take_profit: e.target.value })} />
                              </Field>
                              <Field label="Planned R:R">
                                   <input type="number" step="any" className={input} value={form.planned_rr} onChange={e => setForm({ ...form, planned_rr: e.target.value })} />
                              </Field>
                              <Field label="Result R">
                                   <input type="number" step="any" className={input} value={form.result_r} onChange={e => setForm({ ...form, result_r: e.target.value })} />
                              </Field>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                              <Field label={`Screenshot — Daily ${trade.screenshot_daily_url ? '(replace)' : ''}`}>
                                   <input type="file" accept="image/*"
                                        className="text-xs text-[#7C8695] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#1F252D] file:text-[#E7EAEE] file:text-xs hover:file:bg-[#2A313B] w-full"
                                        onChange={e => setFileDaily(e.target.files?.[0] ?? null)} />
                              </Field>
                              <Field label={`Screenshot — 4H ${trade.screenshot_4h_url ? '(replace)' : ''}`}>
                                   <input type="file" accept="image/*"
                                        className="text-xs text-[#7C8695] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#1F252D] file:text-[#E7EAEE] file:text-xs hover:file:bg-[#2A313B] w-full"
                                        onChange={e => setFile4h(e.target.files?.[0] ?? null)} />
                              </Field>
                         </div>

                         <Field label="Notes">
                              <textarea rows={3} className={`${input} font-body resize-none`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                         </Field>
                    </div>

                    <div className="sticky bottom-0 bg-[#12161C] border-t border-[#1F252D] px-5 py-4 flex gap-3">
                         <button
                              type="button"
                              onClick={handleDelete}
                              disabled={deleting}
                              className="text-sm font-mono text-[var(--color-loss)] hover:opacity-80 transition-opacity disabled:opacity-50"
                         >
                              {deleting ? 'Deleting...' : 'Delete trade'}
                         </button>
                         <div className="flex-1" />
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm bg-[#1F252D] hover:bg-[#2A313B] transition-colors">
                              Cancel
                         </button>
                         <button type="submit" disabled={saving} className="px-4 py-2 rounded-md text-sm bg-[#E7EAEE] hover:bg-white text-[#0B0E11] font-medium transition-colors disabled:opacity-50">
                              {saving ? 'Saving...' : 'Save Changes'}
                         </button>
                    </div>
               </form>
          </div>
     )
}