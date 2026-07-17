'use client'

import { useState, useEffect } from 'react'
import type { RegistrationStatus } from '@/lib/content'

interface Props {
  culturalStatus: RegistrationStatus
  competitiveStatus: RegistrationStatus
}

const INTERVAL = 3500

export default function AnnouncementBar({ culturalStatus, competitiveStatus }: Props) {
  const showCultural    = culturalStatus === 'open'
  const showCompetitive = competitiveStatus === 'open'

  if (!showCultural && !showCompetitive) return null

  const messages = [
    ...(showCultural ? [{
      emoji: '🎭',
      text: 'Cultural event registrations are open — closes 20 July 2026. Register now!',
      accent: 'from-emerald-500 to-teal-500',
      dot: 'bg-emerald-200',
    }] : []),
  ]

  return <Ticker messages={messages} />
}

function Ticker({ messages }: { messages: { emoji: string; text: string; accent: string; dot: string }[] }) {
  const [active, setActive]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(i => (i + 1) % messages.length)
        setVisible(true)
      }, 400)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [messages.length])

  const msg = messages[active]

  return (
    <div className={`relative bg-gradient-to-r ${msg.accent} text-white overflow-hidden transition-all duration-500`}>
      {/* Subtle moving highlight */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 20%, white 50%, transparent 80%)',
          animation: 'sweep 3s ease-in-out infinite',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${msg.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-white`} />
        </span>

        {/* Message */}
        <p
          className="text-sm font-semibold text-center leading-snug transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {msg.emoji} {msg.text}
        </p>

        {/* Dot indicators */}
        {messages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            {messages.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
