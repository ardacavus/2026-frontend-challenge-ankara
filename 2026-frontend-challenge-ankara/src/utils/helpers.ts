import type { InvestigationRecord } from '../types'

export function involvedNames(r: InvestigationRecord): string[] {
  return [r.personName, r.relatedPersonName].filter((n): n is string => Boolean(n))
}

export function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60_000
}
