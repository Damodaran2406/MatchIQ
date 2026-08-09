import Fuse from 'fuse.js'

const DIACRITIC_MARKS = /[̀-ͯ]/g
const INVISIBLE_WHITESPACE = /[ ​‌‍﻿]/g

const ROMAN_NUMERALS = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9', x: '10' }
const ROMAN_NUMERAL_PATTERN = new RegExp(`\\b(${Object.keys(ROMAN_NUMERALS).join('|')})\\b`, 'g')

export function normalizeText(value) {
  if (value === null || value === undefined) return ''

  return String(value)
    .normalize('NFKD')
    .replace(DIACRITIC_MARKS, '') // strip accents so "Pó" and "Po" compare equal
    .replace(INVISIBLE_WHITESPACE, ' ') // NBSP and zero-width chars -> space
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // strip dots, commas, and other punctuation
    .trim()
    .replace(/\bprivate\s+limited\b/g, 'pvt ltd')
    .replace(/\bpvt\s+ltd\b/g, 'pvt ltd')
    .replace(/\bcompany\b/g, 'co')
    .replace(/\blimited\b/g, 'ltd')
    .replace(ROMAN_NUMERAL_PATTERN, (token) => ROMAN_NUMERALS[token]) // "II" -> "2"
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

const FINDERS_BY_METHOD = { exact: findExactMatch, partial: findPartialMatch, fuzzy: findFuzzyMatch }

export function matchRows({ rows, headers, inputColumn, linkTextColumn, method, threshold }) {
  const inputColumnIndex = headers.indexOf(inputColumn)
  const linkTextColumnIndex = headers.indexOf(linkTextColumn)
  const minimumScore = Number(threshold)
  const primaryFinder = FINDERS_BY_METHOD[method] ?? findFuzzyMatch

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

    let match = primaryFinder(inputValue, candidates)

    // Missing/truncated/abbreviated values won't hit an exact or partial match — fall back to
    // fuzzy similarity against the sanitized candidates instead of reporting a flat 0%.
    if (primaryFinder !== findFuzzyMatch && (!match || match.score < minimumScore)) {
      const fallbackMatch = findFuzzyMatch(inputValue, candidates)
      if (fallbackMatch && (!match || fallbackMatch.score > match.score)) {
        match = fallbackMatch
      }
    }

    const isMatch = match && match.score >= minimumScore

    return {
      originalRow: row,
      originalValue: String(inputValue ?? ''),
      normalizedValue,
      matchedValue: isMatch ? String(match.value ?? '') : '',
      matchScore: isMatch ? match.score : 0,
      matchStatus: isMatch ? 'Matched' : 'No match',
    }
  })
}
