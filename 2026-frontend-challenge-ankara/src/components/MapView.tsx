import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { InvestigationRecord, SourceType } from '../types'

const LOCATION_COORDS: Record<string, [number, number]> = {
  CerModern: [39.9366, 32.8506],
  'Tunalı Hilmi Caddesi': [39.8872, 32.8602],
  'Kuğulu Park': [39.8877, 32.862],
  'Seğmenler Parkı': [39.9055, 32.8499],
  Atakule: [39.8762, 32.8499],
  'Ankara Kalesi': [39.9405, 32.8631],
  Hamamönü: [39.9358, 32.8647],
}

const SOURCE_COLOR: Record<SourceType, string> = {
  checkin: '#3498db',
  message: '#27ae60',
  sighting: '#e67e22',
  note: '#9b59b6',
  tip: '#e74c3c',
}

const SOURCE_LABEL: Record<SourceType, string> = {
  checkin: 'Check-in',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Note',
  tip: 'Tip',
}

function makeIcon(color: string, count: number, selected: boolean): L.DivIcon {
  const size = selected ? 36 : 30
  const border = selected ? '3px solid #fff' : '2px solid rgba(255,255,255,.7)'
  const shadow = selected
    ? '0 0 0 3px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.35)'
    : '0 2px 6px rgba(0,0,0,.2)'

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${color};
      border:${border};
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fff;
      font-size:${count > 9 ? 10 : 12}px;
      font-weight:700;
      box-shadow:${shadow};
      cursor:pointer;
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

  const locationGroups = useMemo(() => {
    const groups = new Map<string, { coords: [number, number]; records: InvestigationRecord[] }>()

    for (const record of records) {
      if (!record.location) continue
      const coords = LOCATION_COORDS[record.location]
      if (!coords) continue

      if (!groups.has(record.location)) {
        groups.set(record.location, { coords, records: [] })
      }

      groups.get(record.location)!.records.push(record)
    }

    return groups
  }, [records])

  const unmappedCount = useMemo(
    () => records.filter((record) => !record.location || !LOCATION_COORDS[record.location]).length,
    [records],
  )

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

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    locationGroups.forEach(({ coords, records: groupedRecords }, locationName) => {
      const typeCounts: Partial<Record<SourceType, number>> = {}

      groupedRecords.forEach((record) => {
        typeCounts[record.sourceType] = (typeCounts[record.sourceType] ?? 0) + 1
      })

      const dominantType = (
        Object.entries(typeCounts).sort((a, b) => b[1]! - a[1]!)[0]?.[0] ?? 'checkin'
      ) as SourceType

      const isSelected = groupedRecords.some((record) => record.id === selectedId)
      const marker = L.marker(coords, {
        icon: makeIcon(SOURCE_COLOR[dominantType], groupedRecords.length, isSelected),
      })

      const rows = groupedRecords
        .slice(0, 8)
        .map((record) => {
          const isHighlighted = record.id === selectedId
          const date = record.timestamp
            ? new Date(record.timestamp).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'short',
              })
            : '?'

          return `<div class="map-popup-row${isHighlighted ? ' map-popup-row--selected' : ''}" data-id="${record.id}">
            <span class="map-popup-type map-popup-type--${record.sourceType}">${SOURCE_LABEL[record.sourceType]}</span>
            <span class="map-popup-main">${record.personName}${record.relatedPersonName ? ` → ${record.relatedPersonName}` : ''}</span>
            <span class="map-popup-date">${date}</span>
          </div>`
        })
        .join('')

      const more =
        groupedRecords.length > 8
          ? `<p class="map-popup-more">+${groupedRecords.length - 8} more</p>`
          : ''

      const popupHtml = `
        <div class="map-popup-card">
          <p class="map-popup-title">${locationName}</p>
          ${rows}
          ${more}
        </div>
      `

      const popup = L.popup({
        maxWidth: 320,
        minWidth: 240,
        closeButton: true,
      }).setContent(popupHtml)

      marker.bindPopup(popup)

      marker.on('popupopen', () => {
        const element = marker.getPopup()?.getElement()
        if (!element) return

        element.querySelectorAll<HTMLElement>('.map-popup-row').forEach((row) => {
          row.addEventListener('click', () => {
            const id = row.dataset.id
            const found = groupedRecords.find((record) => record.id === id)
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
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Map</p>
          <h2 className="section-title">Location-based investigation view</h2>
        </div>
        <span className="section-meta">{locationGroups.size} mapped spots</span>
      </div>

      <div ref={containerRef} className="map-container" />

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
    </div>
  )
}