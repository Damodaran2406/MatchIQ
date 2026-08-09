import { ArrowRight, Columns3 } from 'lucide-react'

function ColumnSelection({ headers, inputColumn, linkTextColumn, onInputColumnChange, onLinkTextColumnChange, onContinue }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm shadow-emerald-950/5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]"><Columns3 className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Step 2 · Configure</p><h2 className="mt-1 text-lg font-bold text-slate-900">Choose columns</h2><p className="mt-1 text-sm text-slate-500">Select the fields to use in your upcoming matching run.</p></div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-semibold text-slate-700">Input Column</span><select className="mt-2 block w-full rounded-xl border-0 bg-[#F4FBF6] px-3 py-3 text-sm text-slate-800 ring-1 ring-inset ring-emerald-100 transition focus:ring-2 focus:ring-inset focus:ring-[#16A34A]" value={inputColumn} onChange={(event) => onInputColumnChange(event.target.value)}><option value="">Select an input column</option>{headers.map((header, index) => <option key={`${header}-${index}`} value={header}>{header}</option>)}</select></label>
        <label className="block"><span className="text-sm font-semibold text-slate-700">Link Text / Title Column</span><select className="mt-2 block w-full rounded-xl border-0 bg-[#F4FBF6] px-3 py-3 text-sm text-slate-800 ring-1 ring-inset ring-emerald-100 transition focus:ring-2 focus:ring-inset focus:ring-[#16A34A]" value={linkTextColumn} onChange={(event) => onLinkTextColumnChange(event.target.value)}><option value="">Select a link text or title column</option>{headers.map((header, index) => <option key={`${header}-${index}`} value={header}>{header}</option>)}</select></label>
      </div>
      <div className="mt-7 flex justify-end border-t border-emerald-50 pt-5"><button type="button" disabled={!inputColumn || !linkTextColumn} onClick={onContinue} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto">Continue to matching <ArrowRight className="h-4 w-4" /></button></div>
    </section>
  )
}

export default ColumnSelection
