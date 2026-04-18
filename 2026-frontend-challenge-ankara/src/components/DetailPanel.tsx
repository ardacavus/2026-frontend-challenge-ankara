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

interface LinkedItemProps {
  link: LinkResult
  onSelect: (record: InvestigationRecord) => void
}

function LinkedItem({ link, onSelect }: LinkedItemProps) {
  const { record, reasons } = link

  return (
    <button
      className={`detail-linked-item detail-linked-item--${record.sourceType}`}
      onClick={() => onSelect(record)}
      title={reasons.join(' · ')}
      type="button"
    >
      <div className="detail-linked-top">
        <span className={`detail-mini-badge detail-mini-badge--${record.sourceType}`}>
          {SOURCE_LABELS[record.sourceType]}
        </span>
        <span className="detail-linked-time">
          {new Date(record.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="detail-linked-main">
        <strong>{record.personName}</strong>
        {record.relatedPersonName && <span> → {record.relatedPersonName}</span>}
      </div>

      {record.location && <div className="detail-linked-location">📍 {record.location}</div>}

      <div className="detail-linked-reasons">{reasons.join(' · ')}</div>
    </button>
  )
}

interface ConfidenceGroupProps {
  confidence: 'high' | 'possible' | 'weak'
  links: LinkResult[]
  onSelect: (record: InvestigationRecord) => void
}

function ConfidenceGroup({ confidence, links, onSelect }: ConfidenceGroupProps) {
  if (links.length === 0) return null

  return (
    <div className="detail-conf-group">
      <div className="detail-group-header">
        <p className={`detail-conf-label detail-conf-label--${confidence}`}>
          {CONFIDENCE_LABEL[confidence]}
        </p>
        <span className="detail-section-count">{links.length}</span>
      </div>

      <div className="detail-linked-list">
        {links.map((link) => (
          <LinkedItem key={link.record.id} link={link} onSelect={onSelect} />
        ))}
      </div>
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

  const index = filteredRecords.findIndex((item) => item.id === record.id)
  const prevRecord = index > 0 ? filteredRecords[index - 1] : null
  const nextRecord =
    index >= 0 && index < filteredRecords.length - 1 ? filteredRecords[index + 1] : null

  const links = computeLinks(record, allRecords)
  const grouped = groupByConfidence(links)
  const totalLinks = links.length

  return (
    <div className="detail-panel">
      <div className="detail-nav">
        <button
          className="detail-nav-btn"
          disabled={!prevRecord}
          onClick={() => prevRecord && onRecordSelect(prevRecord)}
          type="button"
        >
          ← Prev
        </button>

        <span className="detail-nav-pos">
          {index >= 0 ? index + 1 : 0} / {filteredRecords.length}
        </span>

        <button
          className="detail-nav-btn"
          disabled={!nextRecord}
          onClick={() => nextRecord && onRecordSelect(nextRecord)}
          type="button"
        >
          Next →
        </button>
      </div>

      <div className="detail-record-card">
        <div className="detail-header-row">
          <span className={`detail-badge detail-badge--${record.sourceType}`}>
            {SOURCE_LABELS[record.sourceType]}
          </span>

          {record.reliability && (
            <span className={`detail-reliability-badge detail-reliability-badge--${record.reliability}`}>
              {record.reliability}
            </span>
          )}
        </div>

        <div className="detail-title-block">
          <h3 className="detail-title">
            <button
              className="detail-name-btn"
              onClick={() => onPersonClick(record.personName)}
              type="button"
            >
              {record.personName}
            </button>
          </h3>

          {record.relatedPersonName && (
            <p className="detail-related">
              linked with{' '}
              <button
                className="detail-link"
                onClick={() => onPersonClick(record.relatedPersonName!)}
                type="button"
              >
                {record.relatedPersonName}
              </button>
            </p>
          )}
        </div>

        <div className="detail-meta-grid">
          <div className="detail-meta-card">
            <span className="detail-meta-label">Time</span>
            <strong className="detail-meta-value">
              {new Date(record.timestamp).toLocaleString('tr-TR')}
            </strong>
          </div>

          <div className="detail-meta-card">
            <span className="detail-meta-label">Location</span>
            <strong className="detail-meta-value">{record.location ?? 'Unknown'}</strong>
          </div>

          <div className="detail-meta-card">
            <span className="detail-meta-label">Linked records</span>
            <strong className="detail-meta-value">{totalLinks}</strong>
          </div>

          <div className="detail-meta-card">
            <span className="detail-meta-label">Coordinates</span>
            <strong className="detail-meta-value">
              {record.coordinates
                ? `${record.coordinates.lat.toFixed(4)}, ${record.coordinates.lng.toFixed(4)}`
                : 'Unavailable'}
            </strong>
          </div>
        </div>

        <div className="detail-section">
          <h4 className="detail-section-title">Record narrative</h4>
          <div className="detail-content">{record.content}</div>
        </div>

        {totalLinks > 0 && (
          <div className="detail-section">
            <div className="detail-group-header">
              <h4 className="detail-section-title">Linked records</h4>
              <span className="detail-section-count">{totalLinks}</span>
            </div>

            <ConfidenceGroup confidence="high" links={grouped.high} onSelect={onRecordSelect} />
            <ConfidenceGroup
              confidence="possible"
              links={grouped.possible}
              onSelect={onRecordSelect}
            />
            <ConfidenceGroup confidence="weak" links={grouped.weak} onSelect={onRecordSelect} />
          </div>
        )}
      </div>
    </div>
  )
}