'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CollapsibleRules({ html }: { html: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-sm">Rules &amp; Format</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="px-6 pb-6 border-t border-slate-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
