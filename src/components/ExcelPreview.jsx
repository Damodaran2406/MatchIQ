import { Table2 } from 'lucide-react'

function ExcelPreview({ headers, rows }) {
  const previewRows = rows.slice(0, 50)

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm shadow-emerald-950/5">
      <div className="flex flex-col gap-3 border-b border-emerald-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]"><Table2 className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900">Excel preview</h2>
          <p className="mt-1 text-sm text-slate-500">Showing the first {previewRows.length} of {rows.length} total rows.</p>
        </div></div>
        <span className="w-fit rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">{rows.length} total rows</span>
      </div>

      {headers.length > 0 ? (
        <div className="max-h-[28rem] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#F4FBF6] shadow-sm">
              <tr>
                <th scope="col" className="sticky left-0 z-20 border-b border-r border-emerald-100 bg-[#F4FBF6] px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">#</th>
                {headers.map((header, index) => (
                  <th key={`${header}-${index}`} scope="col" className="whitespace-nowrap border-b border-emerald-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-emerald-50/50">
                  <td className="sticky left-0 z-10 border-r border-emerald-50 bg-white px-4 py-3 text-xs font-medium text-slate-400">{rowIndex + 1}</td>
                  {headers.map((header, columnIndex) => (
                    <td key={`${header}-${columnIndex}`} className="max-w-xs whitespace-nowrap px-4 py-3 text-slate-600">
                      <span className="block truncate">{row[columnIndex] === '' ? '—' : String(row[columnIndex] ?? '')}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewRows.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">This spreadsheet has headers but no data rows.</p>}
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-slate-500">No columns are available to preview.</p>
      )}
    </section>
  )
}

export default ExcelPreview
