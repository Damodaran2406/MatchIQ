import * as XLSX from 'xlsx'

export async function parseSpreadsheet(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    throw new Error('The selected file does not contain a worksheet.')
  }

  const sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    defval: '',
  })

  if (sheetRows.length === 0) {
    return { headers: [], rows: [] }
  }

  const [headerRow, ...dataRows] = sheetRows
  const headers = headerRow.map((header, index) => {
    const value = String(header).trim()
    return value || `Column ${index + 1}`
  })
  const rows = dataRows.filter((row) => row.some((cell) => String(cell).trim() !== ''))

  return { headers, rows }
}
