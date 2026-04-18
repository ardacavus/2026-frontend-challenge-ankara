import type { InvestigationRecord, LinkResult, SourceType } from '../types'
import { computeLinks, groupByConfidence } from '../utils/linking'
import { SummaryPanel } from './SummaryPanel'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Check-in',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Personal Note',
  tip: 'Anonymous Tip',
}

const CONFIDENCE_LABEL = {
  high: 'High confidence',
  possible: 'Possible match',
  weak: 'Weak match',
} as const

const CONFIDENCE_ICON = {
  high: '🔴',
  possible: '🟡',
  weak: '⚪',
} as const

interface LinkedItemProps {
  link: LinkResult
  onSelect: (r: InvestigationRecord) => void
}

function LinkedItem({ link, onSelect }: LinkedItemProps) {
  const { record: r, reasons } = link
  const time = new Date(r.timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <button
      className={`detail-linked-item detail-linked-item--${r.sourceType}`}
      onClick={() => onSelect(r)}
      title={reasons.join(' · ')}
    >
      <span className="detail-linked-type">{SOURCE_LABELS[r.sourceType]}</span>
      <span className="detail-linked-person">{r.personName}</span>
      {r.relatedPersonName && (
        <span className="detail-linked-related">→ {r.relatedPersonName}</span>
      )}
      <span className="detail-linked-time">{time}</span>
    </button>
  )
}

interface ConfidenceGroupProps {
  confidence: 'high' | 'possible' | 'weak'
  links: LinkResult[]
  onSelect: (r: InvestigationRecord) => void
}

function ConfidenceGroup({ confidence, links, onSelect }: ConfidenceGroupProps) {
  if (links.length === 0) return null
  return (
    <div className="detail-conf-group">
      <p className={`detail-conf-label detail-conf-label--${confidence}`}>
        {CONFIDENCE_ICON[confidence]} {CONFIDENCE_LABEL[confidence]}
        <span className="detail-section-count">{links.length}</span>
      </p>
      {links.map((l) => (
        <LinkedItem key={l.record.id} link={l} onSelect={onSelect} />
      ))}
    </div>
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
      <SummaryPanel
        allRecords={allRecords}
        onPersonClick={onPersonClick}
        onRecordSelect={onRecordSelect}
      />
    )
  }

  // Prev / Next within the filtered list
  const idx = filteredRecords.findIndex((r) => r.id === record.id)
  const prevRecord = idx > 0 ? filteredRecords[idx - 1] : null
  const nextRecord = idx < filteredRecords.length - 1 ? filteredRecords[idx + 1] : null

  // Linking engine
  const links = computeLinks(record, allRecords)
  const grouped = groupByConfidence(links)
  const totalLinks = links.length

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

      {/* ── Linked records (scored) ── */}
      {totalLinks > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">
            Linked records
            <span className="detail-section-count">{totalLinks}</span>
          </h4>
          <ConfidenceGroup confidence="high"     links={grouped.high}     onSelect={onRecordSelect} />
          <ConfidenceGroup confidence="possible" links={grouped.possible} onSelect={onRecordSelect} />
          <ConfidenceGroup confidence="weak"     links={grouped.weak}     onSelect={onRecordSelect} />
        </div>
      )}

    </div>
  )
}
