const DIACRITIC_MARKS = /[̀-ͯ]/g
const INVISIBLE_WHITESPACE = /[ ​‌‍﻿]/g

// Company-name aliases and Roman numerals, standardized to one canonical form before scoring.
const TOKEN_ALIASES = {
  pvt: 'private',
  ltd: 'limited',
  co: 'company',
  corp: 'corporation',
  inc: 'incorporated',
  i: '1',
  ii: '2',
  iii: '3',
  iv: '4',
  v: '5',
  vi: '6',
  vii: '7',
  viii: '8',
  ix: '9',
  x: '10',
}
const TOKEN_ALIAS_PATTERN = new RegExp(`\\b(${Object.keys(TOKEN_ALIASES).join('|')})\\b`, 'g')

export function normalizeText(value) {
  if (value === null || value === undefined) return ''

  return String(value)
    .normalize('NFKD')
    .replace(DIACRITIC_MARKS, '') // strip accents so "Pó" and "Po" compare equal
    .replace(INVISIBLE_WHITESPACE, ' ') // NBSP and zero-width chars -> space
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // strip punctuation, dots, commas, and other special characters
    .trim()
    .replace(TOKEN_ALIAS_PATTERN, (token) => TOKEN_ALIASES[token]) // "Pvt"->"private", "Ltd"->"limited", "II"->"2", ...
    .replace(/\s+/g, ' ')
    .trim()
}

function toPercentage(value) {
  return Math.round(value * 100)
}

function tokenize(text) {
  return text.split(' ').filter(Boolean)
}

// Character-level edit distance between two strings.
function levenshteinDistance(a, b) {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previousRow = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i += 1) {
    const currentRow = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      currentRow[j] = Math.min(
        previousRow[j] + 1, // deletion
        currentRow[j - 1] + 1, // insertion
        previousRow[j - 1] + substitutionCost, // substitution
      )
    }
    previousRow = currentRow
  }

  return previousRow[b.length]
}

function levenshteinSimilarity(a, b) {
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLength
}

// Levenshtein similarity computed on alphabetically-sorted tokens, so word order doesn't matter.
function tokenSortRatio(a, b) {
  const sortedA = tokenize(a).sort().join(' ')
  const sortedB = tokenize(b).sort().join(' ')
  return levenshteinSimilarity(sortedA, sortedB)
}

// Jaccard similarity: overlap of the two token sets relative to their union.
function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  if (setA.size === 0 && setB.size === 0) return 1

  let intersectionSize = 0
  for (const token of setA) {
    if (setB.has(token)) intersectionSize += 1
  }

  const unionSize = setA.size + setB.size - intersectionSize
  return unionSize === 0 ? 0 : intersectionSize / unionSize
}

// Composite fuzzy score: the strongest signal across character-level and token-level comparison,
// so missing/truncated/reordered words still surface a meaningful similarity instead of 0%.
function fuzzySimilarity(a, b) {
  return Math.max(levenshteinSimilarity(a, b), tokenSortRatio(a, b), jaccardSimilarity(a, b))
}

function findExactMatch(normalizedQuery, candidates) {
  const match = candidates.find((candidate) => candidate.normalizedValue === normalizedQuery)
  return match ? { value: match.value, score: 100 } : null
}

function findPartialMatch(normalizedQuery, candidates) {
  const match = candidates
    .filter((candidate) => candidate.normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(candidate.normalizedValue))
    .map((candidate) => {
      const similarity = Math.min(normalizedQuery.length, candidate.normalizedValue.length) / Math.max(normalizedQuery.length, candidate.normalizedValue.length)
      return { value: candidate.value, score: toPercentage(similarity) }
    })
    .sort((first, second) => second.score - first.score)[0]

  return match ?? null
}

function findFuzzyMatch(normalizedQuery, candidates) {
  let best = null

  for (const candidate of candidates) {
    const score = toPercentage(fuzzySimilarity(normalizedQuery, candidate.normalizedValue))
    if (!best || score > best.score) best = { value: candidate.value, score }
  }

  return best
}

// Score-based status, per enterprise fuzzy-matching convention: 100% is an exact match, 50-99% is
// a plausible partial match worth reviewing, and anything below (or no candidate at all) is not.
function classifyMatchStatus(score) {
  if (score === null || score === undefined || Number.isNaN(score) || score < 50) return 'No Match'
  if (score >= 100) return 'Matched'
  return 'Partial Match'
}

function findBestMatch(normalizedQuery, candidates, method) {
  if (normalizedQuery === '' || candidates.length === 0) return null

  const primary = method === 'exact'
    ? findExactMatch(normalizedQuery, candidates)
    : method === 'partial'
      ? findPartialMatch(normalizedQuery, candidates)
      : null

  // Always fall back to fuzzy similarity so missing, truncated, or abbreviated values resolve to
  // their real best-effort score instead of a flat 0% / "No Match".
  const fuzzy = findFuzzyMatch(normalizedQuery, candidates)

  if (!primary) return fuzzy
  if (!fuzzy) return primary
  return primary.score >= fuzzy.score ? primary : fuzzy
}

export function matchRows({ rows, headers, inputColumn, linkTextColumn, method }) {
  const inputColumnIndex = headers.indexOf(inputColumn)
  const linkTextColumnIndex = headers.indexOf(linkTextColumn)

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

    const bestMatch = findBestMatch(normalizedValue, candidates, method)

    return {
      originalRow: row,
      originalValue: String(inputValue ?? ''),
      normalizedValue,
      matchedValue: bestMatch ? String(bestMatch.value ?? '') : '',
      matchScore: bestMatch ? bestMatch.score : 0,
      matchStatus: classifyMatchStatus(bestMatch ? bestMatch.score : null),
    }
  })
}
