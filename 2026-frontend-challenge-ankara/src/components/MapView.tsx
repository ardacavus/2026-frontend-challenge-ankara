import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { InvestigationRecord, SourceType } from '../types'

// Known Ankara location coordinates
const LOCATION_COORDS: Record<string, [number, number]> = {
  'CerModern':              [39.9366, 32.8506],
  'Tunalı Hilmi Caddesi':  [39.8872, 32.8602],
  'Kuğulu Park':            [39.8877, 32.8620],
  'Seğmenler Parkı':        [39.9055, 32.8499],
  'Atakule':                [39.8762, 32.8499],
  'Ankara Kalesi':          [39.9405, 32.8631],
  'Hamamönü':               [39.9358, 32.8647],
}

const SOURCE_COLOR: Record<SourceType, string> = {
  checkin:  '#3498db',
  message:  '#27ae60',
  sighting: '#e67e22',
  note:     '#9b59b6',
  tip:      '#e74c3c',
}

const SOURCE_LABEL: Record<SourceType, string> = {
  checkin:  'Check-in',
  message:  'Message',
  sighting: 'Sighting',
  note:     'Note',
  tip:      'Tip',
}

function makeIcon(color: string, count: number, selected: boolean): L.DivIcon {
  const size = selected ? 36 : 30
  const border = selected ? `3px solid #fff` : `2px solid rgba(255,255,255,.7)`
  const shadow = selected ? '0 0 0 3px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.4)' : '0 2px 6px rgba(0,0,0,.25)'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border:${border};border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:${count > 9 ? 10 : 12}px;font-weight:700;
      box-shadow:${shadow};cursor:pointer;
      transition:transform .15s;
    ">${count > 1 ? count : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

interface MapViewProps {
  records: InvestigationRecord[]
  selectedId: string | null
  onRecordSelect: (record: InvestigationRecord) => void
}

export function MapView({ records, selectedId, onRecordSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Group mappable records by canonical location
  const locationGroups = useMemo(() => {
    const groups = new Map<string, { coords: [number, number]; records: InvestigationRecord[] }>()
    for (const r of records) {
      if (!r.location) continue
      const coords = LOCATION_COORDS[r.location]
      if (!coords) continue
      if (!groups.has(r.location)) groups.set(r.location, { coords, records: [] })
      groups.get(r.location)!.records.push(r)
    }
    return groups
  }, [records])

  const unmappedCount = useMemo(
    () => records.filter((r) => !r.location || !LOCATION_COORDS[r.location]).length,
    [records],
  )

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [39.9208, 32.8541],
      zoom: 13,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Re-render markers when records or selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    locationGroups.forEach(({ coords, records: recs }, locationName) => {
      // Dominant source type by count
      const typeCounts: Partial<Record<SourceType, number>> = {}
      recs.forEach((r) => { typeCounts[r.sourceType] = (typeCounts[r.sourceType] ?? 0) + 1 })
      const dominant = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'checkin') as SourceType
      const color = SOURCE_COLOR[dominant]

      const isSelected = recs.some((r) => r.id === selectedId)
      const marker = L.marker(coords, { icon: makeIcon(color, recs.length, isSelected) })

      // Build popup HTML
      const rows = recs
        .slice(0, 8)
        .map((r) => {
          const isHl = r.id === selectedId
          const date = r.timestamp ? new Date(r.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '?'
          return `<div class="map-popup-row${isHl ? ' map-popup-row--selected' : ''}" data-id="${r.id}" style="
            display:flex;gap:6px;align-items:flex-start;padding:5px 6px;border-radius:4px;cursor:pointer;
            ${isHl ? 'background:#edf5ff;' : ''}
          ">
            <span style="
              font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
              color:${SOURCE_COLOR[r.sourceType]};min-width:52px;padding-top:1px;
            ">${SOURCE_LABEL[r.sourceType]}</span>
            <span style="flex:1;font-size:12px;font-weight:600;color:#2c3e50;">${r.personName}${r.relatedPersonName ? ` → ${r.relatedPersonName}` : ''}</span>
            <span style="font-size:11px;color:#7f8c8d;white-space:nowrap;">${date}</span>
          </div>`
        })
        .join('')

      const more = recs.length > 8 ? `<p style="font-size:11px;color:#7f8c8d;margin:4px 6px 0;text-align:center;">+${recs.length - 8} more</p>` : ''

      const popupHtml = `
        <div style="min-width:220px;max-width:280px;font-family:system-ui,sans-serif;">
          <p style="font-size:12px;font-weight:700;color:#1a202c;margin:0 0 6px;padding:0 6px;">${locationName}</p>
          ${rows}${more}
        </div>`

      const popup = L.popup({ maxWidth: 300, minWidth: 240, closeButton: true }).setContent(popupHtml)
      marker.bindPopup(popup)

      marker.on('popupopen', () => {
        const el = marker.getPopup()?.getElement()
        if (!el) return
        el.querySelectorAll<HTMLElement>('.map-popup-row').forEach((row) => {
          row.addEventListener('click', () => {
            const id = row.dataset.id
            const found = recs.find((r) => r.id === id)
            if (found) {
              onRecordSelect(found)
              marker.closePopup()
            }
          })
        })
      })

      marker.addTo(map)
      markersRef.current.set(locationName, marker)

      if (isSelected) {
        setTimeout(() => marker.openPopup(), 80)
        map.setView(coords, Math.max(map.getZoom(), 14), { animate: true })
      }
    })
  }, [locationGroups, selectedId, onRecordSelect])

  return (
    <div className="map-view">
      <div ref={containerRef} className="map-container" />
      {unmappedCount > 0 && (
        <div className="map-legend">
          <div className="map-legend-sources">
            {(Object.entries(SOURCE_COLOR) as [SourceType, string][]).map(([type, color]) => (
              <span key={type} className="map-legend-item">
                <span className="map-legend-dot" style={{ background: color }} />
                {SOURCE_LABEL[type]}
              </span>
            ))}
          </div>
          <span className="map-legend-note">{unmappedCount} records without mapped location</span>
        </div>
      )}
    </div>
  )
}
