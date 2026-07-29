/* eslint-disable react/no-unescaped-entities */
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
        <h1 className="font-display font-bold text-2xl tracking-tight mt-1">Pullback + BnR</h1>
        <p className="text-sm text-[#7C8695] mt-1">Break and Retest — trend continuation entries off confirmed level breaks, with structured partial profit-taking</p>
      </div>

      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg px-5">
        <RuleBlock number="Rule 0" title="Trend Alignment">
          <p>Daily and 4H must align in direction before taking any setup. Must be visually confirmed by inspecting actual Daily candle structure — screenshot it, don&apos;t infer it from the 4H.</p>
          <p>1H is entry refinement only, never used for direction.</p>
        </RuleBlock>

        <RuleBlock number="Rule 0b" title="Trend-Continuation Levels">
          <p>In a strong trend, a single decisive swing point break (broken LL/HH) counts as a valid level without needing 2+ touches.</p>
        </RuleBlock>

        <RuleBlock title="AOI / Level Definition">
          <p><span className="text-[#E7EAEE] font-medium">Trending market:</span> use trendlines to define trend and invalidation.</p>
          <p><span className="text-[#E7EAEE] font-medium">Ranging market:</span> use horizontal AOI boxes — mark LH/HH as resistance zone, LL/HL as support zone, using the price point touched most often as the zone boundary. Stay interested in that zone until price breaks it and prints a new LL (bearish) or new HH (bullish) — then the zone is dead, hunt for a new AOI.</p>

          <div className="mt-3 pl-4 border-l-2 border-[var(--color-neutral)]">
            <p className="text-[#E7EAEE] font-medium text-xs uppercase tracking-wide mb-1.5">Exception — flipped zone retest</p>
            <p>If price breaks the zone (new LL/HH printed) and then comes back into it, the zone isn&apos;t automatically dead. If price returns and shows rejection at the flipped level — former support now acting as resistance, or vice versa; this can be a trendline that flips role, or a previous swing support point used as the resistance level after price breaks bearish out of the zone — that&apos;s a valid short/long trigger off the flip.</p>
            <p>If price comes back in but does <span className="font-medium text-[#E7EAEE]">not</span> hit/reject at that flipped level, do not take the trade — wait.</p>
          </div>
        </RuleBlock>

        <RuleBlock title="Break Confirmation">
          <p>Price breaks the level, then prints a new HH (bullish) or new LL (bearish).</p>
        </RuleBlock>

        <RuleBlock title="Retest Confirmation">
          <p>Price returns to the broken level, an engulfing candle closes there, near the 20 EMA (strong trend) or 50 EMA (ranging/weak trend).</p>
        </RuleBlock>

        <RuleBlock title="Entry">
          <p>Next candle open after the retest engulfing candle closes.</p>
          <p className="font-medium text-[#E7EAEE]">Pullback must hit the line with a closed candle — a wick into the line is NOT sufficient for entry confirmation.</p>
        </RuleBlock>

        <RuleBlock title="Stop Loss">
          <p>Beyond the recent swing point, or slightly beyond the AOI zone — never inside it, never glued to entry.</p>
        </RuleBlock>

        <RuleBlock title="Take Profit">
          <p className="font-mono text-[var(--color-profit)]">Minimum 1:2 R:R — non-negotiable.</p>
        </RuleBlock>

        <RuleBlock title="Partial Profit Rule (NEW)">
          <p><span className="text-[#E7EAEE] font-medium">Trigger:</span> price touches a prior significant support/resistance zone or trendline sitting between entry and TP. A wick-touch <span className="font-medium">IS</span> sufficient to trigger this — different standard than entry.</p>
          <p><span className="text-[#E7EAEE] font-medium">Action:</span> close exactly 75% of the position. Not &quot;around&quot; 75% — 75%, measured before you act.</p>
          <p><span className="text-[#E7EAEE] font-medium">Remainder:</span> move stop loss to breakeven on the leftover 25%. Let it run to original TP or get stopped at breakeven. No further discretionary closes.</p>
          <div className="mt-3 pl-4 border-l-2 border-[var(--color-loss)]">
            <p className="text-[#E7EAEE] font-medium text-xs uppercase tracking-wide mb-1.5">Override clause</p>
            <p>The only thing that justifies closing <span className="font-medium">more</span> than 75% is a closed candle printing a full reversal structure (engulfing/rejection) at that zone, not a wick, not "it looks like it's turning." If that condition isn&apos;t met, the remaining 25% is untouchable until TP or breakeven stop.</p>
          </div>
        </RuleBlock>

        <RuleBlock title="Risk Per Trade">
          <p className="font-mono text-[var(--color-loss)]">Max 2% of total account.</p>
        </RuleBlock>
      </div>
    </div>
  )
}