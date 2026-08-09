import Fuse from 'fuse.js'

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\bprivate\s+limited\b/g, 'pvt ltd')
    .replace(/\bpvt\s+ltd\b/g, 'pvt ltd')
    .replace(/\bcompany\b/g, 'co')
    .replace(/\blimited\b/g, 'ltd')
    .replace(/\s+/g, ' ')
    .trim()
}

function toPercentage(value) {
  return Math.round(value * 100)
}

function findExactMatch(query, candidates) {
  const normalizedQuery = normalizeText(query)
  const match = candidates.find((candidate) => candidate.normalizedValue === normalizedQuery)

  return match ? { value: match.value, score: 100 } : null
}

function findPartialMatch(query, candidates) {
  const normalizedQuery = normalizeText(query)
  const match = candidates
    .filter((candidate) => {
      return candidate.normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(candidate.normalizedValue)
    })
    .map((candidate) => {
      const similarity = Math.min(normalizedQuery.length, candidate.normalizedValue.length) / Math.max(normalizedQuery.length, candidate.normalizedValue.length)
      return { value: candidate.value, score: toPercentage(similarity) }
    })
    .sort((first, second) => second.score - first.score)[0]

  return match ?? null
}

function findFuzzyMatch(query, candidates) {
  const fuse = new Fuse(candidates, {
    keys: ['normalizedValue'],
    includeScore: true,
    ignoreLocation: true,
    threshold: 1,
  })
  const match = fuse.search(normalizeText(query))[0]

  return match ? { value: match.item.value, score: toPercentage(1 - (match.score ?? 1)) } : null
}

export function matchRows({ rows, headers, inputColumn, linkTextColumn, method, threshold }) {
  const inputColumnIndex = headers.indexOf(inputColumn)
  const linkTextColumnIndex = headers.indexOf(linkTextColumn)
  const minimumScore = Number(threshold)

  if (inputColumnIndex === -1 || linkTextColumnIndex === -1) {
    throw new Error('Choose valid input and link text columns before running a match.')
  }

  return rows.map((row, rowIndex) => {
    const inputValue = row[inputColumnIndex]
    const normalizedValue = normalizeText(inputValue)
    const candidates = rows
      .map((candidateRow, candidateIndex) => ({
        value: candidateRow[linkTextColumnIndex],
        normalizedValue: normalizeText(candidateRow[linkTextColumnIndex]),
        rowIndex: candidateIndex,
      }))
      .filter((candidate) => candidate.normalizedValue !== '')
      .filter((candidate) => inputColumn !== linkTextColumn || candidate.rowIndex !== rowIndex)

    if (normalizedValue === '') {
      return {
        originalRow: row,
        originalValue: String(inputValue ?? ''),
        normalizedValue,
        matchedValue: '',
        matchScore: 0,
        matchStatus: 'No match',
      }
    }

    const match = method === 'exact'
      ? findExactMatch(inputValue, candidates)
      : method === 'partial'
        ? findPartialMatch(inputValue, candidates)
        : findFuzzyMatch(inputValue, candidates)

    const isMatch = match && match.score >= minimumScore

    return {
      originalRow: row,
      originalValue: String(inputValue ?? ''),
      normalizedValue,
      matchedValue: isMatch ? match.value : '',
      matchScore: isMatch ? match.score : 0,
      matchStatus: isMatch ? 'Matched' : 'No match',
    }
  })
}
