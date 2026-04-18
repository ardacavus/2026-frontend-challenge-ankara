import type { InvestigationRecord, SourceType } from '../types'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Check-in',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Personal Note',
  tip: 'Anonymous Tip',
}

interface DetailPanelProps {
  record: InvestigationRecord | null
  allRecords: InvestigationRecord[]
  onPersonClick: (name: string) => void
}

export function DetailPanel({ record, allRecords, onPersonClick }: DetailPanelProps) {
  if (!record) {
    return (
      <div className="detail-panel detail-panel--empty">
        <p>Select a record to view details</p>
      </div>
    )
  }

  const linkedRecords = allRecords
    .filter(
      (r) =>
        r.id !== record.id &&
        (r.personName === record.personName ||
          r.relatedPersonName === record.personName ||
          (record.relatedPersonName && r.personName === record.relatedPersonName)),
    )
    .slice(0, 8)

  return (
    <div className="detail-panel">
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
          Related:{' '}
          <button className="detail-link" onClick={() => onPersonClick(record.relatedPersonName!)}>
            {record.relatedPersonName}
          </button>
        </p>
      )}

      <p className="detail-time">{new Date(record.timestamp).toLocaleString('tr-TR')}</p>

      {record.location && <p className="detail-location">📍 {record.location}</p>}
      {record.coordinates && (
        <p className="detail-coords">
          {record.coordinates.lat.toFixed(5)}, {record.coordinates.lng.toFixed(5)}
        </p>
      )}

      <div className="detail-content">{record.content}</div>

      {record.reliability && (
        <p className="detail-reliability">
          Reliability: <strong>{record.reliability}</strong>
        </p>
      )}

      {linkedRecords.length > 0 && (
        <div className="detail-linked">
          <h4 className="detail-linked-title">Linked Records ({linkedRecords.length})</h4>
          {linkedRecords.map((r) => (
            <div
              key={r.id}
              className={`detail-linked-item detail-linked-item--${r.sourceType}`}
            >
              <span className="detail-linked-type">{SOURCE_LABELS[r.sourceType]}</span>
              <span className="detail-linked-person">{r.personName}</span>
              <span className="detail-linked-time">
                {new Date(r.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
