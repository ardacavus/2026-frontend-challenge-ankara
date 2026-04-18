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
  onRecordSelect: (r: InvestigationRecord) => void
}

export function PodoTimeline({ allRecords, onRecordSelect }: PodoTimelineProps) {
  const podoRecords = allRecords
    .filter((r) => r.personName === 'Podo' || r.relatedPersonName === 'Podo')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  if (podoRecords.length === 0) {
    return <p className="record-list-empty">No records found involving Podo.</p>
  }

  return (
    <div className="podo-timeline">
      <div className="podo-timeline-header">
        <h2 className="podo-timeline-title">Podo Sightings Chain</h2>
        <span className="podo-timeline-count">{podoRecords.length} events</span>
      </div>

      <div className="podo-timeline-list">
        {podoRecords.map((record, i) => {
          const dt = new Date(record.timestamp)
          const time = dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          const date = dt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })

          // Who Podo was with
          const withPerson =
            record.personName === 'Podo'
              ? record.relatedPersonName
              : record.personName

          // Minutes since previous event
          let gapLabel: string | null = null
          if (i > 0) {
            const prevTime = new Date(podoRecords[i - 1].timestamp).getTime()
            const gap = Math.round((dt.getTime() - prevTime) / 60_000)
            if (gap > 0) gapLabel = `+${gap} min`
          }

          return (
            <div key={record.id} className="podo-timeline-entry-wrapper">
              {gapLabel && (
                <div className="podo-timeline-gap">{gapLabel}</div>
              )}
              <button
                className={`podo-timeline-entry podo-entry--${record.sourceType}`}
                onClick={() => onRecordSelect(record)}
              >
                {/* Dot + line */}
                <div className="podo-entry-track">
                  <div className={`podo-entry-dot podo-entry-dot--${record.sourceType}`} />
                  {i < podoRecords.length - 1 && <div className="podo-entry-line" />}
                </div>

                {/* Content */}
                <div className="podo-entry-body">
                  <div className="podo-entry-meta">
                    <span className="podo-entry-time">{date} — {time}</span>
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
