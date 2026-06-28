'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, AlertTriangle, Copy, Check,
  ExternalLink, ArrowLeft, RefreshCw,
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
}

export default function SetupClient({ checks, allOk, migrationSql }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(migrationSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectRef  = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? ''
  const sqlEditorUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : 'https://supabase.com/dashboard'

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
            Checks that Supabase tables, grants, and seed data are correctly configured.
          </p>
        </div>

        {/* Status banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          allOk
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {allOk
            ? <CheckCircle size={20} className="shrink-0 mt-0.5" />
            : <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-medium text-sm">
              {allOk ? 'All checks passed — database is ready.' : 'Some checks failed. Run the migration SQL below to fix them.'}
            </p>
            {!allOk && (
              <p className="text-xs mt-1 opacity-80">
                Copy the SQL, open the Supabase SQL Editor, paste and run it, then refresh this page.
              </p>
            )}
          </div>
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

        {/* Steps */}
        {!allOk && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-800">How to fix</h2>

            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <span>
                  Open the{' '}
                  <a href={sqlEditorUrl} target="_blank" rel="noopener noreferrer"
                    className="text-orange-600 hover:underline inline-flex items-center gap-1">
                    Supabase SQL Editor <ExternalLink size={11} />
                  </a>
                  {' '}for this project.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <span>Click <strong>New query</strong>, paste the SQL below, and click <strong>Run</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <span>Refresh this page — all checks should turn green.</span>
              </li>
            </ol>
          </div>
        )}

        {/* SQL block */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              supabase/migrations/002_fix_grants_and_seed.sql
            </span>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy SQL</>}
            </button>
          </div>
          <pre className="p-4 text-xs text-slate-700 overflow-x-auto max-h-96 leading-relaxed font-mono whitespace-pre-wrap">
            {migrationSql}
          </pre>
        </div>

        {allOk && (
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Go to registration form →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
