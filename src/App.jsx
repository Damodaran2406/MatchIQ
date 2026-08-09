import { useState } from 'react'
import { Bell, Leaf, Menu, ShieldCheck, Sparkles, UserRound, Workflow } from 'lucide-react'
import ColumnSelection from './components/ColumnSelection'
import ExcelPreview from './components/ExcelPreview'
import ExcelUpload from './components/ExcelUpload'
import FileSummary from './components/FileSummary'
import MatchResults from './components/MatchResults'
import MatchingControls from './components/MatchingControls'
import ResultsDashboard from './components/ResultsDashboard'
import { exportMatchingResults } from './utils/exportMatchingResults'
import { matchRows } from './utils/matchingEngine'
import { parseSpreadsheet } from './utils/parseSpreadsheet'

function App() {
  const [spreadsheet, setSpreadsheet] = useState(null)
  const [inputColumn, setInputColumn] = useState('')
  const [linkTextColumn, setLinkTextColumn] = useState('')
  const [isMatchingSetupVisible, setIsMatchingSetupVisible] = useState(false)
  const [matchingMethod, setMatchingMethod] = useState('exact')
  const [similarityThreshold, setSimilarityThreshold] = useState(80)
  const [matchingResults, setMatchingResults] = useState(null)
  const [isMatching, setIsMatching] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  async function handleFileSelected(file) {
    setIsParsing(true)
    setParseError('')
    setSpreadsheet(null)
    setInputColumn('')
    setLinkTextColumn('')
    setIsMatchingSetupVisible(false)
    setMatchingResults(null)

    try {
      const { headers, rows } = await parseSpreadsheet(file)
      setSpreadsheet({ fileName: file.name, headers, rows })
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Unable to read the selected file.')
    } finally {
      setIsParsing(false)
    }
  }

  function handleRunMatching() {
    if (!spreadsheet) return

    setIsMatching(true)
    setMatchingResults(matchRows({
      rows: spreadsheet.rows,
      headers: spreadsheet.headers,
      inputColumn,
      linkTextColumn,
      method: matchingMethod,
      threshold: similarityThreshold,
    }))
    setIsMatching(false)
  }

  function handleExport() {
    if (!spreadsheet || !matchingResults) return

    exportMatchingResults({
      headers: spreadsheet.headers,
      results: matchingResults,
      fileName: spreadsheet.fileName,
    })
  }

  return (
    <div className="min-h-screen bg-[#F4FBF6] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-emerald-100/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#workspace" className="flex items-center gap-3" aria-label="Excel Match home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white shadow-lg shadow-emerald-200"><Leaf className="h-5 w-5" /></span>
            <span>
              <span className="block text-base font-bold tracking-tight text-slate-900">Excel Match</span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">Data intelligence workspace</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            <a href="#workspace" className="text-sm font-semibold text-[#16A34A]">Workspace</a>
            <a href="#results" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">Results</a>
            <a href="#preview" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">Data preview</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" aria-label="Open navigation" className="rounded-xl p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#16A34A] lg:hidden"><Menu className="h-5 w-5" /></button>
            <button type="button" aria-label="Notifications" className="relative hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-emerald-50 hover:text-[#16A34A] sm:inline-flex"><Bell className="h-5 w-5" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FACC15] ring-2 ring-white" /></button>
            <span className="hidden text-right sm:block"><span className="block text-sm font-semibold text-slate-700">Alex Morgan</span><span className="block text-xs text-slate-500">Workspace owner</span></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-[#16A34A] ring-4 ring-emerald-50"><UserRound className="h-5 w-5" /></span>
          </div>
        </div>
      </header>

      <main id="workspace" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-8 sm:py-10">
          <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#16A34A]/40 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-[#FACC15]/20 blur-2xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"><Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />Enterprise matching workspace</div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Make your spreadsheet data work harder.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Upload a source file, configure your matching strategy, and review precise, export-ready results in one secure workspace.</p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-7" aria-labelledby="upload-title">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">1</span>Data source</div>
                <h2 id="upload-title" className="mt-3 text-xl font-bold tracking-tight text-slate-900">Upload a spreadsheet</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Import a CSV or Excel workbook. Your source data stays unchanged.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700"><ShieldCheck className="h-3.5 w-3.5" />Secure processing</span>
            </div>
            <div className="mt-6"><ExcelUpload onFileSelected={handleFileSelected} /></div>
            {isParsing && <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-[#16A34A]"><Workflow className="h-4 w-4 animate-pulse" />Reading spreadsheet...</p>}
            {parseError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-100" role="alert">{parseError}</p>}
          </section>

          <aside className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">Workflow</p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">From file to insight</h2>
            <ol className="mt-6 space-y-5">
              {[
                ['1', 'Upload your file', 'Import CSV or XLSX data'],
                ['2', 'Map your columns', 'Choose values to compare'],
                ['3', 'Review results', 'Export your matched records'],
              ].map(([step, title, description], index) => (
                <li key={step} className="flex gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-[#16A34A] text-white' : 'bg-emerald-50 text-[#16A34A]'}`}>{step}</span>
                  <span><span className="block text-sm font-semibold text-slate-700">{title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        {spreadsheet && (
          <div className="mt-6 space-y-6">
            <FileSummary fileName={spreadsheet.fileName} headers={spreadsheet.headers} rowCount={spreadsheet.rows.length} />
            <ColumnSelection
              headers={spreadsheet.headers}
              inputColumn={inputColumn}
              linkTextColumn={linkTextColumn}
              onInputColumnChange={setInputColumn}
              onLinkTextColumnChange={setLinkTextColumn}
              onContinue={() => setIsMatchingSetupVisible(true)}
            />
            {isMatchingSetupVisible && (
              <MatchingControls
                method={matchingMethod}
                threshold={similarityThreshold}
                onMethodChange={(method) => { setMatchingMethod(method); setMatchingResults(null) }}
                onThresholdChange={(threshold) => { setSimilarityThreshold(threshold); setMatchingResults(null) }}
                onRunMatching={handleRunMatching}
                isRunning={isMatching}
              />
            )}
            {matchingResults && <div id="results"><ResultsDashboard results={matchingResults} /></div>}
            {matchingResults && <MatchResults headers={spreadsheet.headers} results={matchingResults} onExport={handleExport} />}
            <div id="preview"><ExcelPreview headers={spreadsheet.headers} rows={spreadsheet.rows} /></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
