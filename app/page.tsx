import SessionDashboard from '@/components/SessionDashboard'

export default function Home() {
  return (
    <div className="space-y-1">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">Session Clock</h1>
        <p className="text-sm text-[#7C8695] mt-1">Where you are right now, and how much to trust it</p>
      </div>
      <div className="pt-4">
        <SessionDashboard />
      </div>
    </div>
  )
}