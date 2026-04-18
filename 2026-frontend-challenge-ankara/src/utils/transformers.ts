import type { JotformSubmission, InvestigationRecord, Coordinates } from '../types'

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

// Converts "DD-MM-YYYY HH:MM" to ISO string; falls back to raw value
function parseTimestamp(raw: string): string {
  const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/)
  if (!match) return raw
  const [, day, month, year, hour, min] = match
  return new Date(`${year}-${month}-${day}T${hour}:${min}:00`).toISOString()
}

export function transformCheckin(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'checkin',
    personName: ans(sub, 'personName'),
    relatedPersonName: null,
    location: ans(sub, 'location') || null,
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note'),
    reliability: null,
    rawData: sub,
  }
}

export function transformMessage(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'message',
    personName: ans(sub, 'senderName'),
    relatedPersonName: ans(sub, 'recipientName') || null,
    location: ans(sub, 'location') || null,
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'text'),
    reliability: ans(sub, 'urgency') || null,
    rawData: sub,
  }
}

export function transformSighting(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'sighting',
    personName: ans(sub, 'personName'),
    relatedPersonName: ans(sub, 'seenWith') || null,
    location: ans(sub, 'location') || null,
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note'),
    reliability: null,
    rawData: sub,
  }
}

export function transformNote(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'note',
    personName: ans(sub, 'authorName'),
    relatedPersonName: ans(sub, 'mentionedPeople') || null,
    location: ans(sub, 'location') || null,
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'note'),
    reliability: null,
    rawData: sub,
  }
}

export function transformTip(sub: JotformSubmission): InvestigationRecord {
  return {
    id: sub.id,
    sourceType: 'tip',
    personName: ans(sub, 'suspectName'),
    relatedPersonName: null,
    location: ans(sub, 'location') || null,
    coordinates: parseCoordinates(ans(sub, 'coordinates')),
    timestamp: parseTimestamp(ans(sub, 'timestamp')),
    content: ans(sub, 'tip'),
    reliability: ans(sub, 'confidence') || null,
    rawData: sub,
  }
}
