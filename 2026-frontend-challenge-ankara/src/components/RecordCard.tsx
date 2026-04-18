import type { InvestigationRecord, SourceType } from '../types'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Checkin',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Note',
  tip: 'Tip',
}

interface RecordCardProps {
  record: InvestigationRecord
  isSelected: boolean
  onClick: () => void
}

export function RecordCard({ record, isSelected, onClick }: RecordCardProps) {
  const time = new Date(record.timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`record-card record-card--${record.sourceType}${isSelected ? ' record-card--selected' : ''}`}
      onClick={onClick}
    >
      <div className="record-card-header">
        <span className={`record-badge record-badge--${record.sourceType}`}>
          {SOURCE_LABELS[record.sourceType]}
        </span>
        <span className="record-card-time">{time}</span>
      </div>
      <div className="record-card-person">
        <strong>{record.personName}</strong>
        {record.relatedPersonName && (
          <span className="record-card-related"> → {record.relatedPersonName}</span>
        )}
      </div>
      {record.location && <div className="record-card-location">📍 {record.location}</div>}
      <div className="record-card-content">{record.content}</div>
    </div>
  )
}
