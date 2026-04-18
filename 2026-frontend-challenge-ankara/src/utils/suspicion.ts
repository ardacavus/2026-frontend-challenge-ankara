import type { InvestigationRecord } from '../types'

export type SuspicionLevel = 'very' | 'suspicious' | 'watched'

export interface PersonScore {
  name: string
  score: number
  level: SuspicionLevel
  reasons: string[]
  // raw counts for UI
  appearances: number
  podoCo: number
  tipCount: number
}

export interface LocationFrequency {
  location: string
  count: number
}

export interface InvestigationSummary {
  lastSeenWith: { person: string; location: string | null; timestamp: string } | null
  suspicionRanking: PersonScore[]
  locationFrequency: LocationFrequency[]
  highRiskTips: InvestigationRecord[]
}

// ── Helpers ────────────────────────────────────────────

function involvedNames(r: InvestigationRecord): string[] {
  return [r.personName, r.relatedPersonName].filter((n): n is string => Boolean(n))
}

function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60_000
}

// Detect if a person appears in 3+ different locations within any 2-hour window
function mobilityBonus(records: InvestigationRecord[], name: string): number {
  const own = records.filter((r) => involvedNames(r).includes(name) && r.location)
  if (own.length < 3) return 0

  // Slide a 2-hour window over chronologically sorted records
  const sorted = [...own].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  let maxLocs = 0
  for (let i = 0; i < sorted.length; i++) {
    const window = sorted.filter((r) => minutesBetween(r.timestamp, sorted[i].timestamp) <= 120)
    const locs = new Set(window.map((r) => r.location)).size
    if (locs > maxLocs) maxLocs = locs
  }
  if (maxLocs >= 4) return 25
  if (maxLocs >= 3) return 15
  return 0
}

function toLevel(score: number): SuspicionLevel | null {
  if (score >= 80) return 'very'
  if (score >= 45) return 'suspicious'
  if (score >= 20) return 'watched'
  return null
}

// ── Main engine ────────────────────────────────────────

export function computeInvestigationSummary(records: InvestigationRecord[]): InvestigationSummary {
  // 1. Last seen with Podo
  const podoRecords = records
    .filter((r) => involvedNames(r).includes('Podo'))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  let lastSeenWith: InvestigationSummary['lastSeenWith'] = null
  for (const r of podoRecords) {
    const companion = r.personName === 'Podo' ? r.relatedPersonName : r.personName
    if (companion && companion !== 'Podo') {
      lastSeenWith = { person: companion, location: r.location, timestamp: r.timestamp }
      break
    }
  }

  // 2. Suspicion ranking (all people except Podo)
  const allNames = new Set<string>()
  records.forEach((r) => involvedNames(r).forEach((n) => { if (n !== 'Podo') allNames.add(n) }))

  const suspicionRanking: PersonScore[] = []

  for (const name of allNames) {
    const appearances = records.filter((r) => involvedNames(r).includes(name))
    const podoCo = records.filter(
      (r) => involvedNames(r).includes(name) && involvedNames(r).includes('Podo'),
    )
    const tipRecords = records.filter(
      (r) => r.sourceType === 'tip' && r.personName === name,
    )
    const urgentMessages = records.filter(
      (r) =>
        r.sourceType === 'message' &&
        r.personName === name &&
        (r.reliability === 'high' || r.reliability === 'medium'),
    )

    let score = 0
    const reasons: string[] = []

    const freq = appearances.length
    if (freq > 0) {
      score += freq * 5
      reasons.push(`Appears in ${freq} record${freq > 1 ? 's' : ''}`)
    }

    if (podoCo.length > 0) {
      score += podoCo.length * 15
      reasons.push(`${podoCo.length}× with Podo`)
    }

    if (tipRecords.length > 0) {
      score += tipRecords.length * 25
      const confidences = tipRecords.map((r) => r.reliability).filter(Boolean).join(', ')
      reasons.push(`${tipRecords.length} anonymous tip${tipRecords.length > 1 ? 's' : ''}${confidences ? ` (${confidences})` : ''}`)
    }

    const mob = mobilityBonus(records, name)
    if (mob > 0) {
      score += mob
      reasons.push('High location mobility')
    }

    if (urgentMessages.length > 0) {
      score += urgentMessages.length * 8
      reasons.push(`${urgentMessages.length} urgent message${urgentMessages.length > 1 ? 's' : ''}`)
    }

    const level = toLevel(score)
    if (level) {
      suspicionRanking.push({
        name,
        score,
        level,
        reasons,
        appearances: appearances.length,
        podoCo: podoCo.length,
        tipCount: tipRecords.length,
      })
    }
  }

  suspicionRanking.sort((a, b) => b.score - a.score)

  // 3. Location frequency
  const locMap = new Map<string, number>()
  records.forEach((r) => {
    if (r.location) locMap.set(r.location, (locMap.get(r.location) ?? 0) + 1)
  })
  const locationFrequency: LocationFrequency[] = [...locMap.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)

  // 4. High-risk tips (confidence = high or medium)
  const highRiskTips = records
    .filter((r) => r.sourceType === 'tip' && (r.reliability === 'high' || r.reliability === 'medium'))
    .sort((a, b) => {
      const order = { high: 0, medium: 1 }
      return (order[a.reliability as keyof typeof order] ?? 2) -
             (order[b.reliability as keyof typeof order] ?? 2)
    })

  return { lastSeenWith, suspicionRanking, locationFrequency, highRiskTips }
}
