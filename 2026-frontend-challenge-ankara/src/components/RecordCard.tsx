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
  const dateTime = new Date(record.timestamp)

  const date = dateTime.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const time = dateTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      className={`record-card record-card--${record.sourceType}${isSelected ? ' record-card--selected' : ''}`}
      data-record-id={record.id}
      onClick={onClick}
      type="button"
    >
      <div className="record-card-header">
        <span className={`record-badge record-badge--${record.sourceType}`}>
          {SOURCE_LABELS[record.sourceType]}
        </span>

        <span className="record-card-time">
          <span className="record-card-date">{date}</span>
          <span>{time}</span>
        </span>
      </div>

      <div className="record-card-main">
        <div className="record-card-person-block">
          <div className="record-card-person">
            <strong>{record.personName}</strong>
          </div>

          {record.relatedPersonName && (
            <div className="record-card-related-row">
              <span className="record-card-related-label">Linked with</span>
              <span className="record-card-related">{record.relatedPersonName}</span>
            </div>
          )}
        </div>

        {record.reliability && (
          <span
            className={`record-reliability-badge record-reliability-badge--${record.reliability}`}
          >
            {record.reliability}
          </span>
        )}
      </div>

      {record.location && <div className="record-card-location">📍 {record.location}</div>}

      <div className="record-card-content">{record.content}</div>
    </button>
  )
}