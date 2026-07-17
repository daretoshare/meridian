'use client'

import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

// Competitive registration closes 5 PM IST on 17 Jul 2026 = 11:30 UTC
const CLOSES_AT = new Date('2026-07-17T11:30:00Z')

function getRemaining() {
  const diff = CLOSES_AT.getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return { h, m, s }
}

export default function CountdownBanner() {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null)
  const [mounted, setMounted]     = useState(false)
  const [flash, setFlash]         = useState(false)

  useEffect(() => {
    setMounted(true)
    setRemaining(getRemaining())

    const tick = setInterval(() => {
      const r = getRemaining()
      setRemaining(r)
      if (!r) clearInterval(tick)
    }, 1000)

    // Flash the banner every 2 seconds for urgency
    const flasher = setInterval(() => setFlash(f => !f), 2000)

    return () => { clearInterval(tick); clearInterval(flasher) }
  }, [])

  if (!mounted || !remaining) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const isUrgent = remaining.h < 2

  return (
    <div
      className="relative overflow-hidden text-white transition-colors duration-700"
      style={{ background: isUrgent
        ? (flash ? '#b91c1c' : '#dc2626')   // red pulse when < 2h left
        : (flash ? '#92400e' : '#b45309')    // amber pulse otherwise
      }}
    >
      {/* Animated diagonal stripes */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 10px, transparent 10px, transparent 20px)',
          animation: 'slide-stripes 1.2s linear infinite',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {/* Label */}
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
          <Zap size={15} className="shrink-0 fill-current" />
          <span>COMPETITIVE REGISTRATION CLOSES TODAY AT 5:00 PM IST — HURRY UP!</span>
          <Zap size={15} className="shrink-0 fill-current" />
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1">
          <Digit value={pad(remaining.h)} label="hr"  urgent={isUrgent} />
          <Sep />
          <Digit value={pad(remaining.m)} label="min" urgent={isUrgent} />
          <Sep />
          <Digit value={pad(remaining.s)} label="sec" urgent={isUrgent} />
        </div>
      </div>

      <style>{`
        @keyframes slide-stripes {
          from { background-position: 0 0; }
          to   { background-position: 28px 0; }
        }
      `}</style>
    </div>
  )
}

function Digit({ value, label, urgent }: { value: string; label: string; urgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`rounded px-1.5 py-0.5 text-sm font-black tabular-nums leading-tight min-w-[2ch] text-center transition-colors ${urgent ? 'bg-red-900/60' : 'bg-amber-900/50'}`}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-75">{label}</span>
    </div>
  )
}

function Sep() {
  return <span className="font-black opacity-60 mb-3 text-lg leading-none">:</span>
}
