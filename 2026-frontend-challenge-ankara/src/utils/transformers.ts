import type { JotformSubmission, InvestigationRecord, Coordinates } from '../types'
import { normalizeName, normalizeLocation, parseTimestamp } from './normalize'

function ans(submission: JotformSubmission, fieldName: string): string {
  const entry = Object.values(submission.answers).find((a) => a.name === fieldName)
  const val = entry?.answer
  if (!val) return ''
  return typeof val === 'string' ? val : Array.isArray(val) ? val.join(', ') : JSON.stringify(val)
}

function parseCoordinates(raw: string): Coordinates | null {
  const [latStr, lngStr] = raw.split(',')
  const lat = parseFloat(latStr)
  const lng = parseFloat(lngStr)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

function loc(sub: JotformSubmission): string | null {
  const raw = ans(sub, 'location')
  return raw ? normalizeLocation(raw) : null
}

export function transformCheckin(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'checkin',
    personName: normalizeName(ans(sub, 'personName')),
    relatedPersonName: null,
    location: loc(sub),
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note').trim(),
    reliability: null,
    rawData: sub,
  }
}

export function transformMessage(sub: JotformSubmission): InvestigationRecord {
  const related = ans(sub, 'recipientName')
  return {
    id: sub.id,
    sourceType: 'message',
    personName: normalizeName(ans(sub, 'senderName')),
    relatedPersonName: related ? normalizeName(related) : null,
    location: loc(sub),
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'text').trim(),
    reliability: ans(sub, 'urgency') || null,
    rawData: sub,
  }
}

export function transformSighting(sub: JotformSubmission): InvestigationRecord {
  const related = ans(sub, 'seenWith')
  return {
    id: sub.id,
    sourceType: 'sighting',
    personName: normalizeName(ans(sub, 'personName')),
    relatedPersonName: related ? normalizeName(related) : null,
    location: loc(sub),
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note').trim(),
    reliability: null,
    rawData: sub,
  }
}

export function transformNote(sub: JotformSubmission): InvestigationRecord {
  const related = ans(sub, 'mentionedPeople')
  return {
    id: sub.id,
    sourceType: 'note',
    personName: normalizeName(ans(sub, 'authorName')),
    relatedPersonName: related ? normalizeName(related) : null,
    location: loc(sub),
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note').trim(),
    reliability: null,
    rawData: sub,
  }
}

export function transformTip(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'tip',
    personName: normalizeName(ans(sub, 'suspectName')),
    relatedPersonName: null,
    location: loc(sub),
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'tip').trim(),
    reliability: ans(sub, 'confidence') || null,
    rawData: sub,
  }
}
