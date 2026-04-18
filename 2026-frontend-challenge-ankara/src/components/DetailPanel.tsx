import type { InvestigationRecord, SourceType } from '../types'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Check-in',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Personal Note',
  tip: 'Anonymous Tip',
}

interface LinkedItemProps {
  record: InvestigationRecord
  onSelect: (r: InvestigationRecord) => void
}

function LinkedItem({ record, onSelect }: LinkedItemProps) {
  const time = new Date(record.timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <button
      className={`detail-linked-item detail-linked-item--${record.sourceType}`}
      onClick={() => onSelect(record)}
    >
      <span className="detail-linked-type">{SOURCE_LABELS[record.sourceType]}</span>
      <span className="detail-linked-person">{record.personName}</span>
      {record.relatedPersonName && (
        <span className="detail-linked-related">→ {record.relatedPersonName}</span>
      )}
      <span className="detail-linked-time">{time}</span>
    </button>
  )
}

interface DetailPanelProps {
  record: InvestigationRecord | null
  allRecords: InvestigationRecord[]
  filteredRecords: InvestigationRecord[]
  onPersonClick: (name: string) => void
  onRecordSelect: (record: InvestigationRecord) => void
}

export function DetailPanel({
  record,
  allRecords,
  filteredRecords,
  onPersonClick,
  onRecordSelect,
}: DetailPanelProps) {
  if (!record) {
    return (
      <div className="detail-panel detail-panel--empty">
        <p>Select a record to view details</p>
      </div>
    )
  }

  // Prev / Next within the currently filtered + ordered list
  const idx = filteredRecords.findIndex((r) => r.id === record.id)
  const prevRecord = idx > 0 ? filteredRecords[idx - 1] : null
  const nextRecord = idx < filteredRecords.length - 1 ? filteredRecords[idx + 1] : null

  // People involved in this record
  const involvedNames = [record.personName, record.relatedPersonName].filter(Boolean) as string[]

  // Same person — records that share any involved name (from ALL records, for full context)
  const samePerson = allRecords.filter(
    (r) =>
      r.id !== record.id &&
      (involvedNames.includes(r.personName) || involvedNames.includes(r.relatedPersonName ?? '')),
  )

  // Same location — records at the same place, not already in samePerson
  const samePersonIds = new Set(samePerson.map((r) => r.id))
  const sameLocation = record.location
    ? allRecords.filter(
        (r) => r.id !== record.id && r.location === record.location && !samePersonIds.has(r.id),
      )
    : []

  return (
    <div className="detail-panel">

      {/* ── Navigation ── */}
      <div className="detail-nav">
        <button
          className="detail-nav-btn"
          disabled={!prevRecord}
          onClick={() => prevRecord && onRecordSelect(prevRecord)}
        >
          ← Prev
        </button>
        <span className="detail-nav-pos">
          {idx + 1} / {filteredRecords.length}
        </span>
        <button
          className="detail-nav-btn"
          disabled={!nextRecord}
          onClick={() => nextRecord && onRecordSelect(nextRecord)}
        >
          Next →
        </button>
      </div>

      {/* ── Header ── */}
      <span className={`detail-badge detail-badge--${record.sourceType}`}>
        {SOURCE_LABELS[record.sourceType]}
      </span>

      <h3 className="detail-title">
        <button className="detail-name-btn" onClick={() => onPersonClick(record.personName)}>
          {record.personName}
        </button>
      </h3>

      {record.relatedPersonName && (
        <p className="detail-related">
          with{' '}
          <button className="detail-link" onClick={() => onPersonClick(record.relatedPersonName!)}>
            {record.relatedPersonName}
          </button>
        </p>
      )}

      {/* ── Meta ── */}
      <p className="detail-time">{new Date(record.timestamp).toLocaleString('tr-TR')}</p>
      {record.location && <p className="detail-location">📍 {record.location}</p>}
      {record.coordinates && (
        <p className="detail-coords">
          {record.coordinates.lat.toFixed(5)}, {record.coordinates.lng.toFixed(5)}
        </p>
      )}

      {/* ── Content ── */}
      <div className="detail-content">{record.content}</div>

      {record.reliability && (
        <p className="detail-reliability">
          Reliability: <strong>{record.reliability}</strong>
        </p>
      )}

      {/* ── Same person ── */}
      {samePerson.length > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">
            Same person
            <span className="detail-section-count">{samePerson.length}</span>
          </h4>
          {samePerson.map((r) => (
            <LinkedItem key={r.id} record={r} onSelect={onRecordSelect} />
          ))}
        </div>
      )}

      {/* ── Same location ── */}
      {sameLocation.length > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">
            Same location
            <span className="detail-section-count">{sameLocation.length}</span>
          </h4>
          {sameLocation.map((r) => (
            <LinkedItem key={r.id} record={r} onSelect={onRecordSelect} />
          ))}
        </div>
      )}

    </div>
  )
}
