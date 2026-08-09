import { useRef, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react'

const acceptedExtensions = ['.xlsx', '.csv']

function isSupportedFile(file) {
  const fileName = file.name.toLowerCase()
  return acceptedExtensions.some((extension) => fileName.endsWith(extension))
}

function ExcelUpload({ onFileSelected }) {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  function selectFile(file) {
    if (!file) return

    if (!isSupportedFile(file)) {
      setSelectedFile(null)
      setError('Please choose an .xlsx or .csv file.')
      return
    }

    setSelectedFile(file)
    setError('')
    onFileSelected(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  return (
    <div
      className={`group mx-auto flex h-[240px] w-full max-w-[650px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-all duration-300 sm:px-10 ${isDragging ? 'scale-[1.01] border-[#16A34A] bg-emerald-50 shadow-lg shadow-emerald-200/60' : 'border-emerald-200 bg-[#F4FBF6] hover:-translate-y-0.5 hover:border-[#16A34A] hover:bg-emerald-50/80 hover:shadow-lg hover:shadow-emerald-200/50'}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false) }}
      onDrop={handleDrop}
    >
      <input ref={inputRef} className="sr-only" type="file" accept=".xlsx,.csv" onChange={(event) => selectFile(event.target.files[0])} />
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#16A34A] shadow-sm ring-1 ring-emerald-200 transition duration-300 group-hover:scale-105 group-hover:bg-emerald-200" aria-hidden="true"><Upload className="h-5 w-5" strokeWidth={2.25} /></div>
      {!selectedFile && <><h3 className="mt-4 text-base font-bold text-slate-800">Drag & drop your spreadsheet</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">Upload a file to start your matching workflow.</p></>}
      <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2 active:translate-y-0" onClick={() => inputRef.current?.click()}><FileSpreadsheet className="h-4 w-4" strokeWidth={2.25} />Browse files</button>
      {!selectedFile && <p className="mt-2.5 text-xs font-medium text-slate-400">Supported formats: .xlsx and .csv</p>}

      {selectedFile && (
        <div className="mx-auto mt-4 w-full max-w-md rounded-xl bg-white px-3.5 py-3 text-left shadow-sm ring-1 ring-inset ring-emerald-200">
          <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#16A34A]" aria-hidden="true"><CheckCircle2 className="h-5 w-5" /></div>
          <div className="min-w-0"><p className="text-xs font-medium text-slate-500">Selected file</p><p className="truncate text-sm font-semibold text-slate-800">{selectedFile.name}</p></div>
          <span className="ml-auto text-xs font-bold text-[#16A34A]">100%</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full w-full rounded-full bg-[#16A34A] transition-all duration-500" /></div>
        </div>
      )}
      {error && <p className="mt-4 text-sm font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  )
}

export default ExcelUpload
