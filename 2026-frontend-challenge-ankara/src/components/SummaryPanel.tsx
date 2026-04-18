import { useMemo } from 'react'
import type { InvestigationRecord } from '../types'
import {
  computeInvestigationSummary,
  type PersonScore,
  type SuspicionLevel,
} from '../utils/suspicion'

const LEVEL_CONFIG: Record<
  SuspicionLevel,
  { label: string; icon: string; className: string }
> = {
  very: { label: 'Very suspicious', icon: '🔴', className: 'susp--very' },
  suspicious: { label: 'Suspicious', icon: '🟡', className: 'susp--suspicious' },
  watched: { label: 'Watched', icon: '⚪', className: 'susp--watched' },
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="susp-bar-track">
      <div className="susp-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function PersonRow({
  person,
  max,
  onClick,
}: {
  person: PersonScore
  max: number
  onClick: () => void
}) {
  const config = LEVEL_CONFIG[person.level]

  return (
    <button className={`susp-row ${config.className}`} onClick={onClick} type="button">
      <div className="susp-row-top">
        <span className="susp-row-name">{person.name}</span>
        <span className="susp-row-score">{person.score} pts</span>
      </div>

      <ScoreBar score={person.score} max={max} />

      <div className="susp-row-meta">
        <span>{person.appearances} appearances</span>
        <span>{person.podoCo} with Podo</span>
        <span>{person.tipCount} tips</span>
      </div>

      <div className="susp-row-reasons">{person.reasons.join(' · ')}</div>
    </button>
  )
}

interface SummaryPanelProps {
  allRecords: InvestigationRecord[]
  onPersonClick: (name: string) => void
  onRecordSelect: (record: InvestigationRecord) => void
}

export function SummaryPanel({
  allRecords,
  onPersonClick,
  onRecordSelect,
}: SummaryPanelProps) {
  const summary = useMemo(() => computeInvestigationSummary(allRecords), [allRecords])

  const maxScore = summary.suspicionRanking[0]?.score ?? 1
  const maxLocationCount = summary.locationFrequency[0]?.count ?? 1
  const groups: SuspicionLevel[] = ['very', 'suspicious', 'watched']

  return (
    <div className="summary-panel">
      <div className="summary-hero">
        <p className="summary-eyebrow">Investigation Insights</p>
        <h3 className="summary-title">Case summary</h3>
        <p className="summary-subtitle">
          Review suspicious patterns, the latest Podo-linked clues, and location concentration
          across all Jotform submissions.
        </p>
      </div>

      <div className="summary-stat-grid">
        <div className="summary-stat-card">
          <span className="summary-stat-label">Total records</span>
          <strong className="summary-stat-value">{allRecords.length}</strong>
        </div>

        <div className="summary-stat-card">
          <span className="summary-stat-label">Podo-linked events</span>
          <strong className="summary-stat-value">
            {
              allRecords.filter(
                (record) =>
                  record.personName === 'Podo' || record.relatedPersonName === 'Podo',
              ).length
            }
          </strong>
        </div>

        <div className="summary-stat-card">
          <span className="summary-stat-label">High-risk tips</span>
          <strong className="summary-stat-value">{summary.highRiskTips.length}</strong>
        </div>

        <div className="summary-stat-card">
          <span className="summary-stat-label">Unique locations</span>
          <strong className="summary-stat-value">{summary.locationFrequency.length}</strong>
        </div>
      </div>

      {summary.lastSeenWith && (
        <section className="summary-section summary-feature-card">
          <div className="summary-feature-top">
            <span className="summary-feature-tag">Last seen with Podo</span>
          </div>

          <div className="summary-feature-main">
            <button
              className="summary-person-link"
              onClick={() => onPersonClick(summary.lastSeenWith!.person)}
              type="button"
            >
              {summary.lastSeenWith.person}
            </button>

            {summary.lastSeenWith.location && (
              <span className="summary-last-loc">@ {summary.lastSeenWith.location}</span>
            )}
          </div>

          <span className="summary-last-time">
            {new Date(summary.lastSeenWith.timestamp).toLocaleString('tr-TR')}
          </span>
        </section>
      )}

      {summary.suspicionRanking.length > 0 && (
        <section className="summary-section">
          <div className="summary-section-head">
            <h4 className="summary-section-title">Suspicion ranking</h4>
            <span className="summary-section-hint">Prioritized leads</span>
          </div>

          {groups.map((level) => {
            const people = summary.suspicionRanking.filter((person) => person.level === level)
            if (people.length === 0) return null

            const config = LEVEL_CONFIG[level]

            return (
              <div key={level} className="susp-group">
                <p className={`susp-group-label ${config.className}`}>
                  {config.icon} {config.label}
                </p>

                {people.map((person) => (
                  <PersonRow
                    key={person.name}
                    person={person}
                    max={maxScore}
                    onClick={() => onPersonClick(person.name)}
                  />
                ))}
              </div>
            )
          })}
        </section>
      )}

      {summary.locationFrequency.length > 0 && (
        <section className="summary-section">
          <div className="summary-section-head">
            <h4 className="summary-section-title">Location frequency</h4>
            <span className="summary-section-hint">Potential hotspots</span>
          </div>

          <div className="summary-locations">
            {summary.locationFrequency.map(({ location, count }) => {
              const pct = Math.min(100, Math.round((count / maxLocationCount) * 100))

              return (
                <div key={location} className="summary-loc-row">
                  <div className="summary-loc-top">
                    <span className="summary-loc-name">{location}</span>
                    <span className="summary-loc-count">{count}</span>
                  </div>

                  <div className="summary-loc-bar-track">
                    <div className="summary-loc-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {summary.highRiskTips.length > 0 && (
        <section className="summary-section">
          <div className="summary-section-head">
            <h4 className="summary-section-title">High-risk tips</h4>
            <span className="summary-section-hint">Actionable anonymous leads</span>
          </div>

          <div className="summary-tip-list">
            {summary.highRiskTips.map((record) => (
              <button
                key={record.id}
                className="summary-tip"
                onClick={() => onRecordSelect(record)}
                type="button"
              >
                <div className="summary-tip-top">
                  <span className="summary-tip-suspect">{record.personName}</span>
                  <span className={`summary-tip-conf summary-tip-conf--${record.reliability}`}>
                    {record.reliability}
                  </span>
                </div>

                {record.location && (
                  <div className="summary-tip-location">📍 {record.location}</div>
                )}

                <div className="summary-tip-content">{record.content}</div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}