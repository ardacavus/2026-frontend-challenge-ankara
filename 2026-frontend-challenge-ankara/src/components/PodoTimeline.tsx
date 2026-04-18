import type { InvestigationRecord, SourceType } from '../types'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Check-in',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Personal Note',
  tip: 'Tip',
}

const SOURCE_ICONS: Record<SourceType, string> = {
  checkin: '📋',
  message: '💬',
  sighting: '👁',
  note: '📝',
  tip: '🔔',
}

interface PodoTimelineProps {
  allRecords: InvestigationRecord[]
  onRecordSelect: (record: InvestigationRecord) => void
}

export function PodoTimeline({ allRecords, onRecordSelect }: PodoTimelineProps) {
  const podoRecords = allRecords
    .filter((record) => record.personName === 'Podo' || record.relatedPersonName === 'Podo')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  if (podoRecords.length === 0) {
    return <p className="record-list-empty">No records found involving Podo.</p>
  }

  return (
    <div className="podo-timeline">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Timeline</p>
          <h2 className="section-title">Podo sightings chain</h2>
        </div>
        <span className="section-meta">{podoRecords.length} events</span>
      </div>

      <div className="podo-timeline-list">
        {podoRecords.map((record, index) => {
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

          const withPerson =
            record.personName === 'Podo' ? record.relatedPersonName : record.personName

          let gapLabel: string | null = null
          if (index > 0) {
            const prevTime = new Date(podoRecords[index - 1].timestamp).getTime()
            const gap = Math.round((dateTime.getTime() - prevTime) / 60000)
            if (gap > 0) gapLabel = `+${gap} min`
          }

          return (
            <div key={record.id} className="podo-timeline-entry-wrapper">
              {gapLabel && <div className="podo-timeline-gap">{gapLabel}</div>}

              <button
                className={`podo-timeline-entry podo-entry--${record.sourceType}`}
                onClick={() => onRecordSelect(record)}
                type="button"
              >
                <div className="podo-entry-track">
                  <div className={`podo-entry-dot podo-entry-dot--${record.sourceType}`} />
                  {index < podoRecords.length - 1 && <div className="podo-entry-line" />}
                </div>

                <div className="podo-entry-body">
                  <div className="podo-entry-meta">
                    <span className="podo-entry-time">
                      {date} — {time}
                    </span>

                    <span className={`record-badge record-badge--${record.sourceType}`}>
                      {SOURCE_ICONS[record.sourceType]} {SOURCE_LABELS[record.sourceType]}
                    </span>
                  </div>

                  <div className="podo-entry-who">
                    {withPerson ? (
                      <>
                        <span className="podo-entry-with">with </span>
                        <strong>{withPerson}</strong>
                        {record.personName !== 'Podo' && (
                          <span className="podo-entry-role"> (reporter)</span>
                        )}
                      </>
                    ) : (
                      <span className="podo-entry-solo">alone / not specified</span>
                    )}
                  </div>

                  {record.location && (
                    <div className="podo-entry-location">📍 {record.location}</div>
                  )}

                  <div className="podo-entry-content">{record.content}</div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}