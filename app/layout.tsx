import './globals.css'
import Link from 'next/link'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500','700'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500','600'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="bg-[#0B0E11] text-[#E7EAEE] min-h-screen font-body">
        <nav className="border-b border-[#1F252D] px-6 py-4 flex items-center gap-6">
          <span className="font-display font-bold tracking-tight">Trade Journal</span>
          <Link href="/trades" className="text-[#7C8695] hover:text-[#E7EAEE] text-sm transition-colors">Trade Log</Link>
          <Link href="/stats" className="text-[#7C8695] hover:text-[#E7EAEE] text-sm transition-colors">Stats</Link>
        </nav>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  )
}