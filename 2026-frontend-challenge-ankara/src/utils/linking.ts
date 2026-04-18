import type { InvestigationRecord, LinkResult, LinkConfidence } from '../types'
import { involvedNames, minutesBetween } from './helpers'

// ── Scoring weights ────────────────────────────────────
const W = {
  EXACT_NAME: 50,       // any name in A exactly matches any name in B
  PODO_BOTH: 20,        // both records involve Podo (key subject of investigation)
  SAME_LOCATION: 20,    // exact same location string
  CLOSE_TIME_30: 20,    // timestamps within 30 minutes
  CLOSE_TIME_60: 10,    // timestamps within 60 minutes (exclusive with above)
  SIMILAR_NAME: 15,     // fuzzy name match (first 4 chars, post-normalize)
} as const

// Confidence thresholds
const THRESHOLD: Record<LinkConfidence, number> = {
  high: 60,
  possible: 30,
  weak: 15,
}

// ── Helpers ────────────────────────────────────────────

function hasExactOverlap(namesA: string[], namesB: string[]): string[] {
  return namesA.filter((n) => namesB.includes(n))
}

function hasSimilarName(namesA: string[], namesB: string[]): boolean {
  return namesA.some((a) =>
    namesB.some((b) => {
      if (a === b) return false // exact already handled
      const la = a.toLowerCase()
      const lb = b.toLowerCase()
      // Share at least 4 chars at start (handles initials, abbreviations)
      return la.slice(0, 4) === lb.slice(0, 4) && la.slice(0, 4).length >= 4
    }),
  )
}

function toConfidence(score: number): LinkConfidence | null {
  if (score >= THRESHOLD.high) return 'high'
  if (score >= THRESHOLD.possible) return 'possible'
  if (score >= THRESHOLD.weak) return 'weak'
  return null
}

// ── Main engine ────────────────────────────────────────

export function computeLinks(
  record: InvestigationRecord,
  allRecords: InvestigationRecord[],
): LinkResult[] {
  const namesA = involvedNames(record)

  const results: LinkResult[] = []

  for (const r of allRecords) {
    if (r.id === record.id) continue

    let score = 0
    const reasons: string[] = []
    const namesB = involvedNames(r)

    // 1. Exact name overlap
    const exact = hasExactOverlap(namesA, namesB)
    if (exact.length > 0) {
      score += W.EXACT_NAME
      reasons.push(`Same person: ${exact.join(', ')}`)
    }

    // 2. Both involve Podo (core subject — extra weight)
    if (namesA.includes('Podo') && namesB.includes('Podo')) {
      score += W.PODO_BOTH
      reasons.push('Both involve Podo')
    }

    // 3. Same location
    if (record.location && r.location && record.location === r.location) {
      score += W.SAME_LOCATION
      reasons.push(`Same location: ${record.location}`)
    }

    // 4. Close timestamp (only one tier applies)
    const diff = minutesBetween(record.timestamp, r.timestamp)
    if (diff <= 30) {
      score += W.CLOSE_TIME_30
      reasons.push(`Within 30 min (${Math.round(diff)} min apart)`)
    } else if (diff <= 60) {
      score += W.CLOSE_TIME_60
      reasons.push(`Within 1 hour (${Math.round(diff)} min apart)`)
    }

    // 5. Similar (fuzzy) name — only if no exact match found
    if (exact.length === 0 && hasSimilarName(namesA, namesB)) {
      score += W.SIMILAR_NAME
      reasons.push('Similar name')
    }

    const confidence = toConfidence(score)
    if (confidence) {
      results.push({ record: r, score, confidence, reasons })
    }
  }

  // Sort: highest score first
  return results.sort((a, b) => b.score - a.score)
}

export function groupByConfidence(links: LinkResult[]): {
  high: LinkResult[]
  possible: LinkResult[]
  weak: LinkResult[]
} {
  return {
    high: links.filter((l) => l.confidence === 'high'),
    possible: links.filter((l) => l.confidence === 'possible'),
    weak: links.filter((l) => l.confidence === 'weak'),
  }
}
