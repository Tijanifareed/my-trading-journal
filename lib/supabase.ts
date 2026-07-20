import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Strategy = { id: string; name: string }
export type Pair = { id: string; symbol: string }
export type Trade = {
  id: string
  date: string
  strategy_id: string | null
  pair_id: string | null
  session: 'Asian' | 'London' | 'NY' | 'Overlap' | null
  direction: 'Long' | 'Short' | null
  entry: number | null
  stop_loss: number | null
  take_profit: number | null
  planned_rr: number | null
  outcome: 'Win' | 'Loss' | 'Breakeven' | null
  result_r: number | null
  screenshot_url: string | null       // legacy, old trades only
  screenshot_daily_url: string | null
  screenshot_4h_url: string | null
  notes: string | null
  created_at: string
  strategies?: { name: string } | null
  pairs?: { symbol: string } | null
}