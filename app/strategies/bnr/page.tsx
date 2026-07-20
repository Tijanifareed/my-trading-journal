function RuleBlock({ number, title, children }: { number?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-[#1F252D] last:border-0">
      <div className="flex items-baseline gap-3 mb-2">
        {number && <span className="font-mono text-xs text-[var(--color-neutral)]">{number}</span>}
        <h3 className="font-display font-medium text-sm">{title}</h3>
      </div>
      <div className="text-sm text-[#C4CAD3] leading-relaxed space-y-2 pl-0">{children}</div>
    </div>
  )
}

export default function BnRRulesetPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-[11px] text-[#7C8695] uppercase tracking-wider font-mono">Strategy Ruleset</div>
        <h1 className="font-display font-bold text-2xl tracking-tight mt-1">BnR</h1>
        <p className="text-sm text-[#7C8695] mt-1">Break and Retest trend continuation entries off confirmed level breaks</p>
      </div>

      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg px-5">
        <RuleBlock number="Rule 0" title="Trend alignment">
          <p>Daily and 4H must align in direction before taking any setup. Must be visually confirmed by inspecting actual Daily candle structure, screenshot it, don&apos;t infer it from the 4H.</p>
          <p>1H is entry refinement only, never used for direction.</p>
        </RuleBlock>

        <RuleBlock number="Rule 0b" title="Trend-continuation levels">
          <p>In a strong trend, a single decisive swing point break (broken LL/HH) counts as a valid level without needing 2+ touches.</p>
        </RuleBlock>

        <RuleBlock title="AOI / Level definition">
          <p><span className="text-[#E7EAEE] font-medium">Trending market:</span> use trendlines to define trend and invalidation.</p>
          <p><span className="text-[#E7EAEE] font-medium">Ranging market:</span> use horizontal AOI boxes, mark LH/HH as resistance zone, LL/HL as support zone, using the price point touched most often as the zone boundary. Stay interested in that zone until price breaks it and prints a new LL (bearish) or new HH (bullish), then the zone is dead, hunt for a new AOI.</p>
        </RuleBlock>

        <RuleBlock title="Break confirmation">
          <p>Price breaks the level, then prints a new HH (bullish) or new LL (bearish).</p>
        </RuleBlock>

        <RuleBlock title="Retest confirmation">
          <p>Price returns to the broken level, an engulfing candle closes there, near the 20 EMA (strong trend) or 50 EMA (ranging/weak trend).</p>
        </RuleBlock>

        <RuleBlock title="Entry">
          <p>Next candle open after the retest engulfing candle closes.</p>
        </RuleBlock>

        <RuleBlock title="Stop loss">
          <p>Beyond the recent swing point, or slightly beyond the AOI zone, never inside it, never glued to entry.</p>
        </RuleBlock>

        <RuleBlock title="Take profit">
          <p className="font-mono text-[var(--color-profit)]">Minimum 1:2 R:R — non-negotiable.</p>
        </RuleBlock>

        <RuleBlock title="Risk per trade">
          <p className="font-mono text-[var(--color-loss)]">Max 2% of total account.</p>
        </RuleBlock>
      </div>
    </div>
  )
}