'use client'

import type { RegistrationStatus } from '@/lib/content'

interface Props {
  culturalStatus: RegistrationStatus
  competitiveStatus: RegistrationStatus
}

export default function AnnouncementBar({ culturalStatus, competitiveStatus }: Props) {
  const showCultural    = culturalStatus === 'open'
  const showCompetitive = competitiveStatus === 'open'

  if (!showCultural && !showCompetitive) return null

  const messages: { text: string; emoji: string; highlight?: boolean }[] = []

  if (showCultural) {
    messages.push({ text: 'Cultural event registrations are now open!', emoji: '🎭', highlight: true })
  }
  if (showCompetitive) {
    messages.push({ text: 'Competitive event registrations closing soon — hurry up!', emoji: '🏆', highlight: false })
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 text-white">
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
          animation: 'shimmer 2.5s infinite',
        }}
      />

      <div className="relative flex items-stretch divide-x divide-white/30">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5"
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-center">
              {msg.emoji} {msg.text}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
