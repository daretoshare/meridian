'use client'

import dynamic from 'next/dynamic'

const MatchFlashCard = dynamic(() => import('./MatchFlashCard'), {
  ssr: false,
  loading: () => (
    <div
      className="relative rounded-2xl overflow-hidden h-[136px] animate-pulse"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a1200 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #f97316 0%, transparent 70%)' }}
      />
      <div className="flex items-center justify-center h-full gap-6 px-8">
        <div className="h-5 w-28 rounded-lg bg-slate-700/60" />
        <div className="h-7 w-7 rounded-full bg-orange-500/30" />
        <div className="h-5 w-28 rounded-lg bg-slate-700/60" />
      </div>
    </div>
  ),
})

export default function MatchFlashCardLoader() {
  return <MatchFlashCard />
}
