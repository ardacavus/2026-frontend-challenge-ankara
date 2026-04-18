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
  const dt = new Date(record.timestamp)
  const date = dt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
  const time = dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={`record-card record-card--${record.sourceType}${isSelected ? ' record-card--selected' : ''}`}
      data-record-id={record.id}
      onClick={onClick}
    >
      <div className="record-card-header">
        <span className={`record-badge record-badge--${record.sourceType}`}>
          {SOURCE_LABELS[record.sourceType]}
        </span>
        <span className="record-card-time">
          <span className="record-card-date">{date}</span> {time}
        </span>
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
