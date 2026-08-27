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
        <p className="text-sm text-[#7C8695] mt-1">Break and Retest, trend continuation entries off confirmed level breaks, with structured partial profit-taking</p>
      </div>

      <div className="bg-[#12161C] border border-[#1F252D] rounded-lg px-5">
        <RuleBlock number="Rule 1" title="Daily Direction">
          <p>Identify Daily direction (higher timeframe).</p>
        </RuleBlock>

        <RuleBlock number="Rule 2" title="Daily Swing Points">
          <p>Mark swing high/low on Daily.</p>
        </RuleBlock>

        <RuleBlock number="Rule 3" title="4H Structure">
          <p>Go to 4H, identify direction, mark breaks of structure.</p>
        </RuleBlock>

        <RuleBlock number="Rule 4" title="Demand / Supply Zones">
          <p>Mark demand/supply zones on 4H and Daily: the last down candle before an impulsive up move (demand), or last up candle before an impulsive down move (supply).</p>
        </RuleBlock>

        <RuleBlock number="Rule 5" title="Box the Zones">
          <p>Box those zones.</p>
        </RuleBlock>

        <RuleBlock number="Rule 6" title="Ranging Markets">
          <p>If ranging, mark support/resistance zones instead.</p>
        </RuleBlock>

        <RuleBlock number="Rule 7" title="Reaction & Confirmation">
          <p>Wait for price to reach a boxed zone, observe the reaction, and look for continuation/reversal patterns on 1H/15m.</p>
        </RuleBlock>

        <RuleBlock number="Rule 8" title="Take Profit">
          <p>Place TP close to the swing low/high.</p>
        </RuleBlock>

        <RuleBlock number="Rule 9" title="Stop Loss">
          <p>Place SL a bit under/above liquidity (long/short respectively).</p>
        </RuleBlock>

        <RuleBlock number="Rule 10" title="Risk Per Trade">
          <p className="font-mono text-[var(--color-loss)]">Max 2% of total account.</p>
          <p className="font-mono text-[var(--color-profit)]">Minimum 1:2 R:R, non-negotiable.</p>
        </RuleBlock>
      </div>
    </div>
  )
}