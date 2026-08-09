import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'

const PAGE_SIZE = 10

function compareValues(first, second) {
  const firstNumber = Number(first)
  const secondNumber = Number(second)

  if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
    return firstNumber - secondNumber
  }

  return String(first ?? '').localeCompare(String(second ?? ''), undefined, { numeric: true, sensitivity: 'base' })
}

function MatchResults({ headers, results, onExport }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState({ column: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const matchedCount = results.filter((result) => result.matchStatus === 'Matched').length

  const columns = useMemo(() => [
    ...headers.map((header, index) => ({ key: `original-${index}`, label: header, getValue: (result) => result.originalRow[index] })),
    { key: 'originalValue', label: 'Original Value', getValue: (result) => result.originalValue },
    { key: 'normalizedValue', label: 'Normalized Value', getValue: (result) => result.normalizedValue },
    { key: 'matchedValue', label: 'Matched Value', getValue: (result) => result.matchedValue },
    { key: 'matchScore', label: 'Match Score', getValue: (result) => result.matchScore },
    { key: 'matchStatus', label: 'Match Status', getValue: (result) => result.matchStatus },
  ], [headers])

  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = normalizedQuery === ''
      ? results
      : results.filter((result) => columns.some((column) => String(column.getValue(result) ?? '').toLowerCase().includes(normalizedQuery)))

    if (!sort.column) return filtered

    const selectedColumn = columns.find((column) => column.key === sort.column)
    if (!selectedColumn) return filtered

    return [...filtered].sort((first, second) => {
      const comparison = compareValues(selectedColumn.getValue(first), selectedColumn.getValue(second))
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [columns, results, searchQuery, sort])

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE))
  const pageResults = filteredResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sort])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  function toggleSort(column) {
    setSort((currentSort) => ({
      column: column.key,
      direction: currentSort.column === column.key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/5">
      <div className="border-b border-emerald-50 bg-white px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Results</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Matching results</h2>
            <p className="mt-1 text-sm text-slate-500">Original spreadsheet data with appended match results.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-[#16A34A]">{matchedCount} of {results.length} matched</span>
            <button type="button" onClick={onExport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2"><Download className="h-4 w-4" />Export to Excel</button>
          </div>
        </div>
        <label className="relative mt-6 block w-full max-w-lg">
          <span className="sr-only">Search results</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search all columns..." className="block w-full rounded-xl border-0 bg-[#F4FBF6] py-3 pl-10 pr-3 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-emerald-100 transition placeholder:text-slate-400 hover:ring-emerald-200 focus:ring-2 focus:ring-inset focus:ring-[#16A34A]" />
        </label>
      </div>

      <div className="max-h-[32rem] overflow-auto overscroll-contain">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-20 bg-[#F4FBF6] shadow-[0_2px_8px_rgba(22,163,74,0.08)]">
            <tr>
              {columns.map((column, index) => {
                const isSorted = sort.column === column.key
                const isResultColumn = index >= headers.length

                return (
                  <th key={column.key} scope="col" aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={`whitespace-nowrap border-b border-emerald-100 px-4 py-3.5 text-xs font-bold uppercase tracking-wide ${isResultColumn ? 'bg-emerald-50 text-[#16A34A]' : 'text-slate-500'} ${index === headers.length ? 'border-l border-emerald-100' : ''}`}>
                    <button type="button" onClick={() => toggleSort(column)} className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:text-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-1">
                      {column.label}
                      {isSorted ? <span className="text-sm leading-none text-[#16A34A]" aria-hidden="true">{sort.direction === 'asc' ? '↑' : '↓'}</span> : <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pageResults.map((result, rowIndex) => (
              <tr key={`${(currentPage - 1) * PAGE_SIZE + rowIndex}-${result.originalRow.join('|')}`} className="hover:bg-emerald-50/50">
                {headers.map((header, columnIndex) => <td key={`${header}-${columnIndex}`} className="max-w-xs whitespace-nowrap px-4 py-3 text-slate-600"><span className="block truncate">{result.originalRow[columnIndex] === '' ? '—' : String(result.originalRow[columnIndex] ?? '')}</span></td>)}
                <td className="max-w-xs whitespace-nowrap border-l border-emerald-100 px-4 py-3 text-slate-700"><span className="block truncate">{result.originalValue || '—'}</span></td>
                <td className="max-w-xs whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600"><span className="block truncate">{result.normalizedValue || '—'}</span></td>
                <td className="max-w-xs whitespace-nowrap px-4 py-3 text-slate-700"><span className="block truncate">{result.matchedValue || '—'}</span></td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">{result.matchScore}%</td>
                <td className="whitespace-nowrap px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${result.matchStatus === 'Matched' ? 'bg-emerald-50 text-[#16A34A] ring-1 ring-inset ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'}`}>{result.matchStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageResults.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No results match your search.</p>}
      </div>

      <div className="flex flex-col gap-4 border-t border-emerald-50 bg-[#F4FBF6]/50 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-slate-500">Showing {filteredResults.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredResults.length)} of {filteredResults.length} results</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 font-semibold text-slate-600 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Previous</button>
          <span className="min-w-[5rem] rounded-lg px-2 text-center text-sm font-bold text-slate-600">Page {currentPage} / {totalPages}</span>
          <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 font-semibold text-slate-600 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">Next<ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  )
}

export default MatchResults
