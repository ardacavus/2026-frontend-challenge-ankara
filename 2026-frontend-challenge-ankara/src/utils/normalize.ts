// Maps lowercase/variant spellings to canonical names found in the data
const NAME_ALIASES: Record<string, string> = {
  'kagan': 'Kağan',
  'kağan a.': 'Kağan',
  'kağan a': 'Kağan',
}

export function normalizeName(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  const lower = trimmed.toLowerCase()
  if (NAME_ALIASES[lower]) return NAME_ALIASES[lower]
  // Title-case each word
  return trimmed
    .split(/\s+/)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1))
    .join(' ')
}

// Canonical spellings for known locations (key: lowercase trimmed)
const LOCATION_CANONICAL: Record<string, string> = {
  'cermodern': 'CerModern',
  'cer modern': 'CerModern',
  'tunalı hilmi caddesi': 'Tunalı Hilmi Caddesi',
  'tunali hilmi caddesi': 'Tunalı Hilmi Caddesi',
  'kuğulu park': 'Kuğulu Park',
  'kugulu park': 'Kuğulu Park',
  'seğmenler parkı': 'Seğmenler Parkı',
  'segmenler parki': 'Seğmenler Parkı',
  'atakule': 'Atakule',
  'ankara kalesi': 'Ankara Kalesi',
  'hamamönü': 'Hamamönü',
  'hamamonu': 'Hamamönü',
}

export function normalizeLocation(raw: string): string {
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()
  return LOCATION_CANONICAL[lower] ?? trimmed
}

// Converts "DD-MM-YYYY HH:MM" → ISO string; falls back to raw value
export function parseTimestamp(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/)
  if (!match) return trimmed
  const [, day, month, year, hour, min] = match
  return new Date(`${year}-${month}-${day}T${hour}:${min}:00`).toISOString()
}
