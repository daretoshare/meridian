'use client'

import { useEffect, useState, useCallback } from 'react'
import { Swords, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface Match {
  category: string
  emoji: string
  p1: string
  p2: string
  date: string
  time: string
}

const MATCHES: Match[] = [
  // Men's Singles
  { category: "Men's Singles", emoji: '🏸', p1: 'Ketan Suthar', p2: 'Nikhil Panicker', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Gaurav Chakravorty', p2: 'Gaurav Jain', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Anshu Goel', p2: 'Shobhit Gupta', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Amit Kumar', p2: 'Kabir Anand', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Avinash Mishra', p2: 'DEBADATTA TRIPATHY', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Ankit Parichha', p2: 'Amit Agarwal', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Debasish Khan', p2: 'Kamlesh Nayak', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Nishant Niranjan', p2: 'Manoj Shenoy', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Dalbir Singh', p2: 'Naveen', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Singles", emoji: '🏸', p1: 'Samir Sahu', p2: 'Pradish Raghavan', date: '25 Jul', time: '4:00 PM' },
  // Men's Doubles
  { category: "Men's Doubles", emoji: '🏸', p1: 'Venkatesh S & Syam', p2: 'Ketan Suthar & Amit Kumar', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Doubles", emoji: '🏸', p1: 'DEBADATTA & Sumeet', p2: 'Anshu Goel & Ankit', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Doubles", emoji: '🏸', p1: 'Nishant & Rajeev R', p2: 'Avinash & Ayushman', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Doubles", emoji: '🏸', p1: 'Biswajeet & Manoj', p2: 'Gaurav C & Gaurav J', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Doubles", emoji: '🏸', p1: 'Vijay Bala & Abhishek', p2: 'Rithwij K & Pradish', date: '25 Jul', time: '4:00 PM' },
  { category: "Men's Doubles", emoji: '🏸', p1: 'Gopu K B & Debasish', p2: 'Peeyush & Shobhit', date: '25 Jul', time: '4:00 PM' },
  // Women's Singles
  { category: "Women's Singles", emoji: '🏸', p1: 'Priyansha Verma', p2: 'Nisha', date: '25 Jul', time: '4:00 PM' },
  { category: "Women's Singles", emoji: '🏸', p1: 'Aakansha Baluni', p2: 'Ankita Pattnaik', date: '25 Jul', time: '4:00 PM' },
  { category: "Women's Singles", emoji: '🏸', p1: 'Nisha Bansal', p2: 'Aditi Panigrahy', date: '25 Jul', time: '4:00 PM' },
  // Mixed Doubles
  { category: 'Mixed Doubles', emoji: '🏸', p1: 'Sanghamitra & Ankan', p2: 'Ketan & Komal', date: '25 Jul', time: '4:00 PM' },
  { category: 'Mixed Doubles', emoji: '🏸', p1: 'Biswajeet & Ankita', p2: 'Kamlesh & Ankita P', date: '25 Jul', time: '4:00 PM' },
  { category: 'Mixed Doubles', emoji: '🏸', p1: 'DEBADATTA & Lipsa', p2: 'Gaurav & Priyanka', date: '25 Jul', time: '4:00 PM' },
  { category: 'Mixed Doubles', emoji: '🏸', p1: 'Priyansha & Prashant', p2: 'Aryan & Samaira', date: '25 Jul', time: '4:00 PM' },
  { category: 'Mixed Doubles', emoji: '🏸', p1: 'Naveen & Adithi', p2: 'Shobhit & Shruti', date: '25 Jul', time: '4:00 PM' },
  // Boys Singles
  { category: 'Boys Singles (10–16)', emoji: '🏸', p1: 'Ishan Deb', p2: 'Tabish Ansari', date: '25 Jul', time: '4:00 PM' },
  { category: 'Boys Singles (10–16)', emoji: '🏸', p1: 'Tanmay Gupta', p2: 'Arshit', date: '25 Jul', time: '4:00 PM' },
  { category: 'Boys Singles (10–16)', emoji: '🏸', p1: 'Atharv Singhal', p2: 'Ridhaan Vijayshekar', date: '25 Jul', time: '4:00 PM' },
  { category: 'Boys Singles (10–16)', emoji: '🏸', p1: 'Vishaj Jha', p2: 'Qualifier', date: '25 Jul', time: '4:00 PM' },
  // Girls Singles
  { category: 'Girls Singles (10–16)', emoji: '🏸', p1: 'Anushree Mathur', p2: 'Saanvi Agrawal', date: '25 Jul', time: '4:00 PM' },
  { category: 'Girls Singles (10–16)', emoji: '🏸', p1: 'Ashwika Gopu', p2: 'Siya Mathur', date: '25 Jul', time: '4:00 PM' },
  { category: 'Girls Singles (10–16)', emoji: '🏸', p1: 'Ziya Usmani', p2: 'Shreya Shaanvi', date: '25 Jul', time: '4:00 PM' },
  { category: 'Girls Singles (10–16)', emoji: '🏸', p1: 'Yuvika Gupta', p2: 'Samaira Agrawal', date: '25 Jul', time: '4:00 PM' },
  // Kids Boys Singles
  { category: 'Kids Boys Singles (5–10)', emoji: '🏸', p1: 'Sahil', p2: 'Vivaan Mishra', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Boys Singles (5–10)', emoji: '🏸', p1: 'Varenyam Rathore', p2: 'Abhiram K', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Boys Singles (5–10)', emoji: '🏸', p1: 'Netik Chowdary', p2: 'Darshit Dhairyawal', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Boys Singles (5–10)', emoji: '🏸', p1: 'Aryan Agarwal', p2: 'Aaveen Tripathy', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Boys Singles (5–10)', emoji: '🏸', p1: 'Nachiket Mishra', p2: 'Atharv Singhal', date: '25 Jul', time: '4:00 PM' },
  // Kids Girls Singles
  { category: 'Kids Girls Singles (5–10)', emoji: '🏸', p1: 'Pihu Mathur', p2: 'Pratyusha', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Girls Singles (5–10)', emoji: '🏸', p1: 'Maedhini S', p2: 'Tarnija', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Girls Singles (5–10)', emoji: '🏸', p1: 'Miraya', p2: 'Jahnvi Verma', date: '25 Jul', time: '4:00 PM' },
  { category: 'Kids Girls Singles (5–10)', emoji: '🏸', p1: 'Ishita Deb', p2: 'Kayra Singh', date: '25 Jul', time: '4:00 PM' },
  // Chess — Age 10+
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Aarush Pradish', p2: 'Yuvika Gupta', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Arjun Madiraju', p2: 'Tanmay Gupta', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Yuvika Gupta', p2: 'Arjun Madiraju', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Arshit', p2: 'Aarush Pradish', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Arjun Madiraju', p2: 'Arshit', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Tanmay Gupta', p2: 'Yuvika Gupta', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Arshit', p2: 'Tanmay Gupta', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Aarush Pradish', p2: 'Arjun Madiraju', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Tanmay Gupta', p2: 'Aarush Pradish', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Yuvika Gupta', p2: 'Arshit', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Amit Kumar', p2: 'Samaira Agrawal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Aarav Jain', p2: 'Nisha Bansal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Samaira Agrawal', p2: 'Nisha Bansal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Amit Kumar', p2: 'Aarav Jain', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Aarav Jain', p2: 'Samaira Agrawal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Age 10+)', emoji: '♟', p1: 'Nisha Bansal', p2: 'Amit Kumar', date: '25 Jul', time: '2:00 PM' },
  // Chess — Age up to 10 (Group A)
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Divij Nupur Singhal', p2: 'Avyaan', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Varenyam Rathore', p2: 'Saroj Kumar', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Nevaan Chamria', p2: 'Netik Chowdary', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Avyaan', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Divij Nupur Singhal', p2: 'Netik Chowdary', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Varenyam Rathore', p2: 'Nevaan Chamria', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Saroj Kumar', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Avyaan', p2: 'Netik Chowdary', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Divij Nupur Singhal', p2: 'Varenyam Rathore', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Netik Chowdary', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Saroj Kumar', p2: 'Nevaan Chamria', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Avyaan', p2: 'Varenyam Rathore', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Nevaan Chamria', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Netik Chowdary', p2: 'Varenyam Rathore', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Saroj Kumar', p2: 'Divij Nupur Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Varenyam Rathore', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Nevaan Chamria', p2: 'Divij Nupur Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Saroj Kumar', p2: 'Avyaan', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Shaun Bex', p2: 'Divij Nupur Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Nevaan Chamria', p2: 'Avyaan', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Netik Chowdary', p2: 'Saroj Kumar', date: '25 Jul', time: '2:00 PM' },
  // Chess — Age up to 10 (Group B)
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Evan Joe Jerin', p2: 'Aviroon Das', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Atharv Singhal', p2: 'Aryan Agarwal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Vruksha', p2: 'Vivaan Mishra', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Evan Joe Jerin', p2: 'Aryan Agarwal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Aviroon Das', p2: 'Vivaan Mishra', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Atharv Singhal', p2: 'Vruksha', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Evan Joe Jerin', p2: 'Vivaan Mishra', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Aryan Agarwal', p2: 'Vruksha', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Aviroon Das', p2: 'Atharv Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Evan Joe Jerin', p2: 'Vruksha', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Vivaan Mishra', p2: 'Atharv Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Aryan Agarwal', p2: 'Aviroon Das', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Evan Joe Jerin', p2: 'Atharv Singhal', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Vruksha', p2: 'Aviroon Das', date: '25 Jul', time: '2:00 PM' },
  { category: 'Chess (Under 10)', emoji: '♟', p1: 'Vivaan Mishra', p2: 'Aryan Agarwal', date: '25 Jul', time: '2:00 PM' },
]

function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    const target = new Date(`2026-07-25T10:30:00+05:30`).getTime()

    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setCountdown('Event is live!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (d > 0) setCountdown(`${d}d ${h}h ${m}m ${s}s`)
      else setCountdown(`${h}h ${m}m ${s}s`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return countdown
}

function pickRandom(exclude: number): number {
  if (MATCHES.length <= 1) return 0
  let next: number
  do { next = Math.floor(Math.random() * MATCHES.length) } while (next === exclude)
  return next
}

export default function MatchFlashCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MATCHES.length))
  const [key, setKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const countdown = useCountdown('2026-07-25')

  const goTo = useCallback((next: number) => {
    setIndex(next)
    setKey(k => k + 1)
  }, [])

  const next = useCallback(() => goTo(pickRandom(index)), [goTo, index])
  const prev = useCallback(() => goTo(pickRandom(index)), [goTo, index])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, paused])

  const match = MATCHES[index]

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a1200 100%)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ambient glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #f97316 0%, transparent 70%)' }} />

      <div key={key} className="relative px-6 py-5 match-card-enter">
        {/* top row */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
            {match.emoji} {match.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock size={11} />
            {match.date} · {match.time}
          </span>
        </div>

        {/* players */}
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="match-p1-enter flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Challenger</p>
            <p className="text-white font-extrabold text-lg sm:text-xl leading-tight truncate">{match.p1}</p>
          </div>

          <div className="match-vs-enter shrink-0 flex flex-col items-center gap-0.5">
            <Swords size={18} className="text-orange-400" />
            <span className="text-orange-400 font-black text-sm tracking-widest">VS</span>
          </div>

          <div className="match-p2-enter flex-1 min-w-0 text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Opponent</p>
            <p className="text-white font-extrabold text-lg sm:text-xl leading-tight truncate">{match.p2}</p>
          </div>
        </div>

        {/* countdown */}
        <div className="match-meta-enter mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-xs text-slate-400">
              Countdown: <span className="text-orange-300 font-mono font-bold">{countdown}</span>
            </span>
          </div>
          <span className="text-xs text-slate-600">
            {index + 1} / {MATCHES.length}
          </span>
        </div>
      </div>

      {/* nav buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); prev() }}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-orange-400 transition-colors"
        aria-label="Previous match"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-orange-400 transition-colors"
        aria-label="Next match"
      >
        <ChevronRight size={16} />
      </button>

      {/* progress bar */}
      {!paused && <div key={`bar-${key}`} className="absolute bottom-0 left-0 h-0.5 bg-orange-500 rounded-full"
        style={{ animation: 'progressBar 5s linear forwards' }} />}

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
