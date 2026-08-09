import * as XLSX from 'xlsx'

const matchHeaders = ['Matched Value', 'Match Score', 'Match Status']

export function exportMatchingResults({ headers, results, fileName }) {
  const worksheetRows = [
    [...headers, ...matchHeaders],
    ...results.map((result) => [
      ...headers.map((_, index) => result.originalRow[index] ?? ''),
      result.matchedValue,
      result.matchScore,
      result.matchStatus,
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Matching Results')

  const baseName = fileName.replace(/\.[^/.]+$/, '') || 'matching-results'
  XLSX.writeFile(workbook, `${baseName}-matching-results.xlsx`)
}
