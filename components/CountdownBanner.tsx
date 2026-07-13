'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

// 8 PM IST on 13 Jul 2026 = 14:30 UTC
const OPENS_AT = new Date('2026-07-13T14:30:00Z')

function getRemaining() {
  const diff = OPENS_AT.getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return { h, m, s, diff }
}

export default function CountdownBanner() {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null)
  const [mounted, setMounted] = useState(false)

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

  // Don't render until mounted (avoids SSR/hydration mismatch)
  if (!mounted || !remaining) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="bg-indigo-600 text-white">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="shrink-0 animate-pulse" />
          <span className="text-sm font-medium">
            Cultural event registrations open today at <strong>8:00 PM IST</strong>
          </span>
        </div>

        {/* Countdown digits */}
        <div className="flex items-center gap-1 font-mono">
          <Digit label="hr"  value={pad(remaining.h)} />
          <span className="text-indigo-300 font-bold mb-3">:</span>
          <Digit label="min" value={pad(remaining.m)} />
          <span className="text-indigo-300 font-bold mb-3">:</span>
          <Digit label="sec" value={pad(remaining.s)} />
        </div>
      </div>
    </div>
  )
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-indigo-500 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums leading-tight min-w-[2ch] text-center">
        {value}
      </span>
      <span className="text-[9px] text-indigo-300 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}
