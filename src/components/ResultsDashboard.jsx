import { BarChart3, CircleCheck, CircleDot, CircleX } from 'lucide-react'

function ResultsDashboard({ results }) {
  const totalRecords = results.length
  const matchedRecords = results.filter((result) => result.matchStatus === 'Matched').length
  const partialRecords = results.filter((result) => result.matchStatus === 'Partial Match').length
  const noMatchRecords = totalRecords - matchedRecords - partialRecords
  const stats = [
    { label: 'Total Records', value: totalRecords, icon: BarChart3, tone: 'bg-slate-100 text-slate-600' },
    { label: 'Matched', value: matchedRecords, icon: CircleCheck, tone: 'bg-emerald-100 text-[#16A34A]' },
    { label: 'Partial Match', value: partialRecords, icon: CircleDot, tone: 'bg-amber-100 text-amber-700' },
    { label: 'No Match', value: noMatchRecords, icon: CircleX, tone: 'bg-rose-100 text-rose-700' },
  ]

  return (
    <section aria-labelledby="results-dashboard-title">
      <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Latest run</p><h2 id="results-dashboard-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">Results overview</h2><p className="mt-1 text-sm text-slate-500">A summary of your latest matching run.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-6"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-500">{stat.label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><Icon className="h-5 w-5" /></span></div><p className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p></article> })}
      </div>
    </section>
  )
}

export default ResultsDashboard
