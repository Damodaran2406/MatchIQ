import { Columns3, FileSpreadsheet, Rows3 } from 'lucide-react'

function FileSummary({ fileName, headers, rowCount }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]"><FileSpreadsheet className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">File details</p><h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Workbook summary</h2></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-[#F4FBF6] p-4 ring-1 ring-inset ring-emerald-100"><p className="text-xs font-medium text-slate-500">File name</p><p className="mt-2 truncate text-sm font-semibold text-slate-800" title={fileName}>{fileName}</p></div>
        <div className="rounded-xl bg-[#F4FBF6] p-4 ring-1 ring-inset ring-emerald-100"><Rows3 className="mb-3 h-4 w-4 text-[#16A34A]" /><p className="text-xs font-medium text-slate-500">Total rows</p><p className="mt-1 text-xl font-bold text-slate-800">{rowCount}</p></div>
        <div className="rounded-xl bg-[#F4FBF6] p-4 ring-1 ring-inset ring-emerald-100"><Columns3 className="mb-3 h-4 w-4 text-[#16A34A]" /><p className="text-xs font-medium text-slate-500">Total columns</p><p className="mt-1 text-xl font-bold text-slate-800">{headers.length}</p></div>
      </div>
      <div className="mt-4 rounded-xl bg-[#F4FBF6] p-4 ring-1 ring-inset ring-emerald-100">
        <p className="text-sm font-bold text-slate-800">Detected columns</p>
        {headers.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{headers.map((header, index) => <span key={`${header}-${index}`} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-emerald-100">{header}</span>)}</div> : <p className="mt-2 text-sm text-slate-500">No column headers were found in this file.</p>}
      </div>
    </section>
  )
}

export default FileSummary
