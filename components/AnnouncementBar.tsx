'use client'

import { useState, useEffect } from 'react'
import type { RegistrationStatus } from '@/lib/content'

interface Props {
  culturalStatus: RegistrationStatus
  competitiveStatus: RegistrationStatus
}

const INTERVAL = 4000 // ms per message

export default function AnnouncementBar({ culturalStatus, competitiveStatus }: Props) {
  const showCultural    = culturalStatus === 'open'
  const showCompetitive = competitiveStatus === 'open'

  if (!showCultural && !showCompetitive) return null

  const messages = [
    ...(showCultural    ? [{ emoji: '🎭', text: 'Cultural event registrations are now open — register today!' }] : []),
    ...(showCompetitive ? [{ emoji: '🏆', text: 'Competitive event registrations closing soon — hurry up and register!' }] : []),
  ]

  return <Ticker messages={messages} />
}

function Ticker({ messages }: { messages: { emoji: string; text: string }[] }) {
  const [active, setActive]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      // fade out → swap → fade in
      setVisible(false)
      setTimeout(() => {
        setActive(i => (i + 1) % messages.length)
        setVisible(true)
      }, 350)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [messages.length])

  const msg = messages[active]

  return (
    <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-2.5 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>

        {/* Message — fades between items */}
        <p
          className="text-sm font-semibold text-center leading-snug transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {msg.emoji} {msg.text}
        </p>

        {/* Dot indicators (only when >1 message) */}
        {messages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 ml-1">
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
    </div>
  )
}
