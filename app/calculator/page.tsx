import RRCalculator from '@/components/RRCalculator'

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">Calculator</h1>
        <p className="text-sm text-[#7C8695] mt-1">Position size, planned R:R, and result R — all from entry, stop, and target</p>
      </div>
      <RRCalculator />
    </div>
  )
}