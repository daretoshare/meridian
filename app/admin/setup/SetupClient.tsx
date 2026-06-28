'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, AlertTriangle, Copy, Check,
  ExternalLink, ArrowLeft, RefreshCw, Database, Loader2,
} from 'lucide-react'

interface CheckResult {
  label: string
  ok: boolean
  detail: string
}

interface Props {
  checks: CheckResult[]
  allOk: boolean
  migrationSql: string
  serviceRoleKey: string
}

export default function SetupClient({ checks, allOk, migrationSql, serviceRoleKey }: Props) {
  const [copied, setCopied] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ ok: boolean; message: string } | null>(null)

  const copy = () => {
    navigator.clipboard.writeText(migrationSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const seedEvents = async () => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/seed-events', {
        method: 'POST',
        headers: { 'x-seed-secret': serviceRoleKey },
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setSeedResult({
          ok: true,
          message: `✓ Synced ${json.upserted} events to Supabase. ${json.deactivated > 0 ? `Deactivated ${json.deactivated} old event(s).` : ''} Refresh this page to re-run checks.`,
        })
      } else {
        setSeedResult({ ok: false, message: `Error: ${json.error ?? 'unknown'}` })
      }
    } catch (e) {
      setSeedResult({ ok: false, message: `Network error: ${String(e)}` })
    } finally {
      setSeeding(false)
    }
  }

  const supabaseUrl = typeof window !== 'undefined'
    ? (document.querySelector('meta[name="supabase-url"]') as HTMLMetaElement)?.content ?? ''
    : ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    ?? 'jigfhupaaycijqzkewxf'
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`

  const stableIdsCheck = checks.find((c) => c.label.includes('Stable'))
  const profileCheck   = checks.find((c) => c.label.includes('profiles'))
  const needsSql       = profileCheck && !profileCheck.ok
  const needsSeed      = stableIdsCheck && !stableIdsCheck.ok

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <a href="/admin/setup" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <RefreshCw size={13} /> Re-run checks
          </a>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Setup</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fix Supabase configuration so form submissions work correctly.
          </p>
        </div>

        {/* Overall status */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          allOk
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {allOk
            ? <CheckCircle size={20} className="shrink-0 mt-0.5" />
            : <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">
            {allOk
              ? 'All checks passed — the registration form is ready.'
              : 'Setup required. Follow the steps below.'}
          </p>
        </div>

        {/* Check results */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {checks.map((c) => (
            <div key={c.label} className="flex items-start gap-3 px-5 py-4">
              {c.ok
                ? <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                : <XCircle    size={18} className="text-red-500 shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{c.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono break-all">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Step 1: Seed events (can do automatically) ── */}
        {needsSeed && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <h2 className="font-semibold text-slate-800">Sync events to database</h2>
            </div>
            <p className="text-sm text-slate-500 ml-8">
              The events in <code className="bg-slate-100 px-1 rounded text-xs">content/events.md</code> need to be pushed to Supabase so the registration form can link registrations to the correct event IDs.
            </p>
            <div className="ml-8">
              <button
                onClick={seedEvents}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {seeding
                  ? <><Loader2 size={15} className="animate-spin" /> Syncing…</>
                  : <><Database size={15} /> Sync Events Now</>}
              </button>
              {seedResult && (
                <p className={`text-xs mt-2 ${seedResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {seedResult.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: RLS policy fix (needs SQL editor) ── */}
        {needsSql && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                {needsSeed ? '2' : '1'}
              </span>
              <h2 className="font-semibold text-slate-800">Fix database permissions</h2>
            </div>
            <p className="text-sm text-slate-500 ml-8">
              The profiles table is blocking inserts due to a missing RLS policy. This requires running SQL in the Supabase dashboard — it takes about 30 seconds.
            </p>
            <ol className="space-y-2 text-sm text-slate-600 ml-8">
              <li className="flex gap-2">
                <span className="text-slate-400 shrink-0">1.</span>
                <span>
                  Open{' '}
                  <a href={sqlEditorUrl} target="_blank" rel="noopener noreferrer"
                    className="text-orange-600 hover:underline inline-flex items-center gap-1">
                    Supabase SQL Editor <ExternalLink size={11} />
                  </a>
                  , click <strong>New query</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400 shrink-0">2.</span>
                <span>Paste the SQL below and click <strong>Run</strong> (▶).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400 shrink-0">3.</span>
                <a href="/admin/setup" className="text-orange-600 hover:underline">Refresh this page</a>
                <span>to confirm all checks pass.</span>
              </li>
            </ol>

            {/* Minimal SQL — just the RLS fix, not the full seed */}
            <div className="ml-8 bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
                <span className="text-xs text-slate-400 font-mono">SQL — paste this in Supabase</span>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white">
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <pre className="p-4 text-xs text-green-300 overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed">
{`-- Fix RLS policies so form submissions work
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.profiles      to service_role;
grant select, insert, update, delete on public.events        to service_role;
grant select, insert, update, delete on public.registrations to service_role;
grant select         on public.events        to anon;
grant select, insert on public.profiles      to anon;
grant select, insert on public.registrations to anon;

drop policy if exists "profiles_insert_anon"    on public.profiles;
drop policy if exists "profiles_all_authenticated" on public.profiles;

create policy "profiles_insert_anon"
  on public.profiles for insert to anon, authenticated, service_role
  with check (true);

create policy "profiles_all_authenticated"
  on public.profiles for all to authenticated, service_role
  using (true) with check (true);`}
              </pre>
            </div>
          </div>
        )}

        {allOk && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
            <CheckCircle size={32} className="text-green-500 mx-auto" />
            <p className="font-semibold text-green-800">Database is fully configured!</p>
            <div className="flex gap-3 justify-center">
              <Link href="/"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                Open registration form →
              </Link>
              <Link href="/admin"
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Go to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
