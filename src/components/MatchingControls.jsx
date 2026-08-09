import { Play, SlidersHorizontal } from 'lucide-react'

function MatchingControls({ method, threshold, onMethodChange, onThresholdChange, onRunMatching, isRunning }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm shadow-emerald-950/5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]"><SlidersHorizontal className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Step 3 · Match</p><h2 className="mt-1 text-lg font-bold text-slate-900">Matching settings</h2><p className="mt-1 text-sm text-slate-500">Choose how values should be compared, then set the minimum accepted similarity.</p></div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-semibold text-slate-700">Matching method</span><select className="mt-2 block w-full rounded-xl border-0 bg-[#F4FBF6] px-3 py-3 text-sm text-slate-800 ring-1 ring-inset ring-emerald-100 focus:ring-2 focus:ring-inset focus:ring-[#16A34A]" value={method} onChange={(event) => onMethodChange(event.target.value)}><option value="exact">Exact match</option><option value="partial">Partial match</option><option value="fuzzy">Fuzzy match</option></select></label>
        <label className="block"><span className="flex justify-between text-sm font-semibold text-slate-700"><span>Similarity threshold</span><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">{threshold}%</span></span><input className="mt-4 block w-full accent-[#16A34A]" type="range" min="0" max="100" step="1" value={threshold} onChange={(event) => onThresholdChange(Number(event.target.value))} /><span className="mt-1 flex justify-between text-xs text-slate-400"><span>0%</span><span>100%</span></span></label>
      </div>
      <div className="mt-7 flex justify-end border-t border-emerald-50 pt-5"><button type="button" onClick={onRunMatching} disabled={isRunning} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-300 sm:w-auto"><Play className="h-4 w-4" fill="currentColor" />{isRunning ? 'Running match...' : 'Run matching'}</button></div>
    </section>
  )
}

export default MatchingControls
