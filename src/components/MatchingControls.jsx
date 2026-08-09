import { CircleCheck, CircleDot, CircleX, Play, SlidersHorizontal } from 'lucide-react'

const SCORE_TIERS = [
  { label: 'Matched', range: '100%', icon: CircleCheck, tone: 'text-[#16A34A]' },
  { label: 'Partial Match', range: '50-99%', icon: CircleDot, tone: 'text-amber-600' },
  { label: 'No Match', range: '< 50%', icon: CircleX, tone: 'text-rose-600' },
]

function MatchingControls({ method, onMethodChange, onRunMatching, isRunning }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm shadow-emerald-950/5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]"><SlidersHorizontal className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Step 3 · Match</p><h2 className="mt-1 text-lg font-bold text-slate-900">Matching settings</h2><p className="mt-1 text-sm text-slate-500">Choose how values should be compared. Fuzzy similarity is always used as a fallback for missing or truncated values.</p></div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-semibold text-slate-700">Matching method</span><select className="mt-2 block w-full rounded-xl border-0 bg-[#F4FBF6] px-3 py-3 text-sm text-slate-800 ring-1 ring-inset ring-emerald-100 focus:ring-2 focus:ring-inset focus:ring-[#16A34A]" value={method} onChange={(event) => onMethodChange(event.target.value)}><option value="exact">Exact match</option><option value="partial">Partial match</option><option value="fuzzy">Fuzzy match</option></select></label>
        <div className="rounded-xl bg-[#F4FBF6] p-3.5 ring-1 ring-inset ring-emerald-100">
          <p className="text-sm font-semibold text-slate-700">Score thresholds</p>
          <ul className="mt-2 space-y-1.5">
            {SCORE_TIERS.map((tier) => {
              const Icon = tier.icon
              return (
                <li key={tier.label} className={`flex items-center gap-2 text-xs font-semibold ${tier.tone}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{tier.label}</span>
                  <span className="text-slate-500">{tier.range}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="mt-7 flex justify-end border-t border-emerald-50 pt-5"><button type="button" onClick={onRunMatching} disabled={isRunning} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-300 sm:w-auto"><Play className="h-4 w-4" fill="currentColor" />{isRunning ? 'Running match...' : 'Run matching'}</button></div>
    </section>
  )
}

export default MatchingControls
