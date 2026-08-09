import { useState } from 'react'
import { CircleHelp, Database, LayoutDashboard, Menu, ShieldCheck, Workflow, X } from 'lucide-react'
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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

  const workflowSteps = [
    {
      step: '1',
      title: 'Data source',
      description: spreadsheet ? spreadsheet.fileName : 'Upload XLSX or CSV data',
      state: spreadsheet ? 'complete' : 'active',
    },
    {
      step: '2',
      title: 'Match configuration',
      description: inputColumn && linkTextColumn ? 'Columns selected' : 'Map columns and rules',
      state: spreadsheet ? (inputColumn && linkTextColumn ? 'complete' : 'active') : 'upcoming',
    },
    {
      step: '3',
      title: 'Results',
      description: matchingResults ? 'Ready to review and export' : 'Run matching to populate',
      state: matchingResults ? 'complete' : spreadsheet && isMatchingSetupVisible ? 'active' : 'upcoming',
    },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4FBF6] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 shadow-sm shadow-emerald-950/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <a href="#workspace" className="flex min-w-0 items-center gap-3" aria-label="MatchIQ home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-sm font-bold tracking-wide text-white shadow-sm shadow-emerald-200">MI</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold tracking-tight text-slate-900">MatchIQ</span>
              <span className="hidden truncate text-xs font-medium text-slate-500 sm:block">Intelligent Excel Data Matching Platform</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 rounded-xl border border-emerald-100 bg-[#F4FBF6] p-1 lg:flex" aria-label="Primary navigation">
            <a href="#workspace" className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#16A34A] shadow-sm"><LayoutDashboard className="h-4 w-4" />Dashboard</a>
            <a href="#preview" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"><Database className="h-4 w-4" />Data</a>
            <a href="#help" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"><CircleHelp className="h-4 w-4" />Help</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#16A34A] sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" />Secure workspace</span>
            <button
              type="button"
              aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2 lg:hidden"
            >
              {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isMobileNavOpen && (
          <nav className="border-t border-emerald-100 bg-white px-4 py-3 lg:hidden" aria-label="Primary navigation">
            <div className="flex flex-col gap-1">
              <a href="#workspace" onClick={() => setIsMobileNavOpen(false)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#16A34A]"><LayoutDashboard className="h-4 w-4" />Dashboard</a>
              <a href="#preview" onClick={() => setIsMobileNavOpen(false)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-emerald-50"><Database className="h-4 w-4" />Data</a>
              <a href="#help" onClick={() => setIsMobileNavOpen(false)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-emerald-50"><CircleHelp className="h-4 w-4" />Help</a>
            </div>
          </nav>
        )}
      </header>

      <main id="workspace" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-yellow-700 ring-1 ring-inset ring-yellow-100"><Workflow className="h-3.5 w-3.5" />MatchIQ</div>
              <h1 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Turn spreadsheet data into reliable matches.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Upload your Excel or CSV file, configure matching rules, review results, and export clean data.</p>
            </div>

            <div id="help" className="rounded-xl border border-emerald-100 bg-[#F4FBF6] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#16A34A]">Workflow</p>
              <ol className="mt-4 space-y-3">
                {workflowSteps.map((item) => {
                  const isComplete = item.state === 'complete'
                  const isActive = item.state === 'active'

                  return (
                    <li key={item.step} className="flex gap-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isComplete || isActive ? 'bg-[#16A34A] text-white' : 'bg-white text-slate-500 ring-1 ring-inset ring-emerald-100'}`}>{item.step}</span>
                      <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span><span className="mt-0.5 block truncate text-xs leading-5 text-slate-500">{item.description}</span></span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-6" aria-labelledby="upload-title">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#16A34A]">Step 1 - Data Source</p>
              <h2 id="upload-title" className="mt-1 text-lg font-bold tracking-tight text-slate-900">Upload a spreadsheet</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Import an XLSX or CSV file. The source data remains unchanged.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#16A34A] ring-1 ring-inset ring-emerald-100"><ShieldCheck className="h-3.5 w-3.5" />Local processing</span>
          </div>

          <div className="mt-5"><ExcelUpload onFileSelected={handleFileSelected} /></div>
          {isParsing && <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-[#16A34A] ring-1 ring-inset ring-emerald-100"><Workflow className="h-4 w-4 animate-pulse" />Reading spreadsheet...</p>}
          {parseError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-100" role="alert">{parseError}</p>}
        </section>

        {spreadsheet && (
          <div className="mt-5 space-y-5">
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
            {matchingResults && (
              <section id="results" className="space-y-5" aria-label="Step 3 results">
                <ResultsDashboard results={matchingResults} />
                <MatchResults headers={spreadsheet.headers} results={matchingResults} onExport={handleExport} />
              </section>
            )}
            <div id="preview">
              <ExcelPreview headers={spreadsheet.headers} rows={spreadsheet.rows} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
