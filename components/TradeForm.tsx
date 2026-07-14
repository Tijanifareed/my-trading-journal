'use client'
import { useState } from 'react'
import { supabase, Strategy, Pair } from '@/lib/supabase'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[#7C8695] uppercase tracking-wider font-mono mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function SelectWithAdd({
  label, value, onChange, options, onAdd, inputClass,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; name: string }[]
  onAdd: (name: string) => Promise<void>
  inputClass: string
}) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    await onAdd(newName.trim())
    setSaving(false)
    setNewName('')
    setAdding(false)
  }

  if (adding) {
    return (
      <Field label={label}>
        <div className="flex gap-1">
          <input
            autoFocus
            placeholder={`New ${label.toLowerCase()}`}
            className={inputClass}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
              if (e.key === 'Escape') setAdding(false)
            }}
          />
          <button type="button" disabled={saving} onClick={handleAdd}
            className="px-3 bg-[var(--color-profit)] hover:opacity-90 text-[#0B0E11] rounded-md text-sm font-medium shrink-0 transition-opacity">
            {saving ? '...' : 'Save'}
          </button>
          <button type="button" onClick={() => setAdding(false)}
            className="px-2.5 bg-[#1F252D] hover:bg-[#2A313B] rounded-md text-sm shrink-0 transition-colors">
            ✕
          </button>
        </div>
      </Field>
    )
  }

  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={e => {
          if (e.target.value === '__add__') setAdding(true)
          else onChange(e.target.value)
        }}
      >
        {options.length === 0 && <option value="">No {label.toLowerCase()}s yet</option>}
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        <option value="__add__">+ Add new {label.toLowerCase()}...</option>
      </select>
    </Field>
  )
}

export default function TradeForm({
  strategies, pairs, onSaved, onStrategyAdded, onPairAdded,
}: {
  strategies: Strategy[]
  pairs: Pair[]
  onSaved: () => void
  onStrategyAdded: (id: string) => void
  onPairAdded: (id: string) => void
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    strategy_id: strategies[0]?.id ?? '',
    pair_id: pairs[0]?.id ?? '',
    session: 'London',
    direction: 'Long',
    entry: '',
    stop_loss: '',
    take_profit: '',
    planned_rr: '',
    outcome: 'Win',
    result_r: '',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleAddStrategy(name: string) {
    const { data, error } = await supabase.from('strategies').insert({ name }).select().single()
    if (error) { alert(error.message); return }
    onStrategyAdded(data.id)
    setForm(f => ({ ...f, strategy_id: data.id }))
  }

  async function handleAddPair(symbol: string) {
    const { data, error } = await supabase.from('pairs').insert({ symbol }).select().single()
    if (error) { alert(error.message); return }
    onPairAdded(data.id)
    setForm(f => ({ ...f, pair_id: data.id }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    let screenshot_url: string | null = null

    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('trade-screenshots').upload(path, file)
      if (upErr) { alert(upErr.message); setSaving(false); return }
      screenshot_url = supabase.storage.from('trade-screenshots').getPublicUrl(path).data.publicUrl
    }

    const { error } = await supabase.from('trades').insert({
      ...form,
      strategy_id: form.strategy_id || null,
      pair_id: form.pair_id || null,
      entry: form.entry ? Number(form.entry) : null,
      stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
      take_profit: form.take_profit ? Number(form.take_profit) : null,
      planned_rr: form.planned_rr ? Number(form.planned_rr) : null,
      result_r: form.result_r ? Number(form.result_r) : null,
      screenshot_url,
    })

    setSaving(false)
    if (error) { alert(error.message); return }
    setFile(null)
    setForm(f => ({ ...f, entry: '', stop_loss: '', take_profit: '', planned_rr: '', result_r: '', notes: '' }))
    onSaved()
  }

  const input = "bg-[#0B0E11] border border-[#1F252D] rounded-md px-3 py-2 w-full text-sm font-mono focus:outline-none focus:border-[#3A4250] transition-colors"
  const outcomeColor = form.outcome === 'Win' ? 'var(--color-profit)' : form.outcome === 'Loss' ? 'var(--color-loss)' : 'var(--color-neutral)'

  return (
    <form onSubmit={handleSubmit} className="bg-[#12161C] border border-[#1F252D] rounded-lg p-5 space-y-5">
      <div>
        <div className="font-display font-medium text-sm">New Trade</div>
        <div className="text-xs text-[#7C8695] mt-0.5">Log entry, risk, and outcome</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Date">
          <input type="date" className={input} value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} required />
        </Field>

        <SelectWithAdd label="Strategy" value={form.strategy_id}
          onChange={v => setForm({ ...form, strategy_id: v })}
          options={strategies} onAdd={handleAddStrategy} inputClass={input} />

        <SelectWithAdd label="Pair" value={form.pair_id}
          onChange={v => setForm({ ...form, pair_id: v })}
          options={pairs.map(p => ({ id: p.id, name: p.symbol }))} onAdd={handleAddPair} inputClass={input} />

        <Field label="Session">
          <select className={input} value={form.session} onChange={e => setForm({ ...form, session: e.target.value })}>
            {['Asian', 'London', 'NY', 'Overlap'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="h-px bg-[#1F252D]" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Direction">
          <select className={input} value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
            <option>Long</option><option>Short</option>
          </select>
        </Field>
        <Field label="Entry">
          <input placeholder="0.00" type="number" step="any" className={input}
            value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} />
        </Field>
        <Field label="Stop Loss">
          <input placeholder="0.00" type="number" step="any" className={input}
            value={form.stop_loss} onChange={e => setForm({ ...form, stop_loss: e.target.value })} />
        </Field>
        <Field label="Take Profit">
          <input placeholder="0.00" type="number" step="any" className={input}
            value={form.take_profit} onChange={e => setForm({ ...form, take_profit: e.target.value })} />
        </Field>
      </div>

      <div className="h-px bg-[#1F252D]" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Planned R:R">
          <input placeholder="e.g. 2.0" type="number" step="any" className={input}
            value={form.planned_rr} onChange={e => setForm({ ...form, planned_rr: e.target.value })} />
        </Field>
        <Field label="Outcome">
          <select className={input} style={{ color: outcomeColor }} value={form.outcome}
            onChange={e => setForm({ ...form, outcome: e.target.value })}>
            <option>Win</option><option>Loss</option><option>Breakeven</option>
          </select>
        </Field>
        <Field label="Result R">
          <input placeholder="e.g. 2.5 or -1" type="number" step="any" className={input}
            value={form.result_r} onChange={e => setForm({ ...form, result_r: e.target.value })} />
        </Field>
        <Field label="Screenshot">
          <input type="file" accept="image/*"
            className="text-xs text-[#7C8695] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#1F252D] file:text-[#E7EAEE] file:text-xs hover:file:bg-[#2A313B] w-full"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea placeholder="What did you see? What would you do differently?" rows={2}
          className={`${input} font-body resize-none`}
          value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </Field>

      <button disabled={saving}
        className="w-full bg-[#E7EAEE] hover:bg-white text-[#0B0E11] rounded-md py-2.5 font-medium text-sm transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Log Trade'}
      </button>
    </form>
  )
}