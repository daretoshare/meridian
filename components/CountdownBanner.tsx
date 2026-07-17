'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

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

  useEffect(() => {
    setMounted(true)
    setRemaining(getRemaining())
    const id = setInterval(() => {
      const r = getRemaining()
      setRemaining(r)
      if (!r) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted || !remaining) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="shrink-0 animate-pulse" />
          <span className="text-sm font-medium">
            Competitive event registrations close today at <strong>5:00 PM IST</strong> — hurry up!
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <Digit label="hr"  value={pad(remaining.h)} />
          <span className="text-red-300 font-bold mb-3">:</span>
          <Digit label="min" value={pad(remaining.m)} />
          <span className="text-red-300 font-bold mb-3">:</span>
          <Digit label="sec" value={pad(remaining.s)} />
        </div>
      </div>
    </div>
  )
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-red-500 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums leading-tight min-w-[2ch] text-center">
        {value}
      </span>
      <span className="text-[9px] text-red-300 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}
