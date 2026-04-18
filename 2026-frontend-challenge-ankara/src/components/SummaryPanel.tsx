import { useMemo } from 'react'
import type { InvestigationRecord } from '../types'
import { computeInvestigationSummary, type PersonScore, type SuspicionLevel } from '../utils/suspicion'

const LEVEL_CONFIG: Record<SuspicionLevel, { label: string; icon: string; className: string }> = {
  very:       { label: 'Very suspicious', icon: '🔴', className: 'susp--very' },
  suspicious: { label: 'Suspicious',      icon: '🟡', className: 'susp--suspicious' },
  watched:    { label: 'Watched',          icon: '⚪', className: 'susp--watched' },
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="susp-bar-track">
      <div className="susp-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function PersonRow({ p, max, onClick }: { p: PersonScore; max: number; onClick: () => void }) {
  const cfg = LEVEL_CONFIG[p.level]
  return (
    <button className={`susp-row ${cfg.className}`} onClick={onClick}>
      <div className="susp-row-top">
        <span className="susp-row-name">{p.name}</span>
        <span className="susp-row-score">{p.score} pts</span>
      </div>
      <ScoreBar score={p.score} max={max} />
      <div className="susp-row-reasons">{p.reasons.join(' · ')}</div>
    </button>
  )
}

interface SummaryPanelProps {
  allRecords: InvestigationRecord[]
  onPersonClick: (name: string) => void
  onRecordSelect: (r: InvestigationRecord) => void
}

export function SummaryPanel({ allRecords, onPersonClick, onRecordSelect }: SummaryPanelProps) {
  const summary = useMemo(() => computeInvestigationSummary(allRecords), [allRecords])
  const maxScore = summary.suspicionRanking[0]?.score ?? 1
  const maxLoc = summary.locationFrequency[0]?.count ?? 1

  const groups: SuspicionLevel[] = ['very', 'suspicious', 'watched']

  return (
    <div className="summary-panel">
      <h3 className="summary-title">📊 Investigation Summary</h3>

      {/* Last seen with Podo */}
      {summary.lastSeenWith && (
        <section className="summary-section">
          <h4 className="summary-section-title">Last seen with Podo</h4>
          <div className="summary-last-seen">
            <button
              className="summary-person-link"
              onClick={() => onPersonClick(summary.lastSeenWith!.person)}
            >
              {summary.lastSeenWith.person}
            </button>
            {summary.lastSeenWith.location && (
              <span className="summary-last-loc">@ {summary.lastSeenWith.location}</span>
            )}
            <span className="summary-last-time">
              {new Date(summary.lastSeenWith.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </section>
      )}

      {/* Suspicion ranking */}
      {summary.suspicionRanking.length > 0 && (
        <section className="summary-section">
          <h4 className="summary-section-title">Suspicion ranking</h4>
          {groups.map((level) => {
            const people = summary.suspicionRanking.filter((p) => p.level === level)
            if (people.length === 0) return null
            const cfg = LEVEL_CONFIG[level]
            return (
              <div key={level} className="susp-group">
                <p className={`susp-group-label ${cfg.className}`}>
                  {cfg.icon} {cfg.label}
                </p>
                {people.map((p) => (
                  <PersonRow
                    key={p.name}
                    p={p}
                    max={maxScore}
                    onClick={() => onPersonClick(p.name)}
                  />
                ))}
              </div>
            )
          })}
        </section>
      )}

      {/* Location frequency */}
      {summary.locationFrequency.length > 0 && (
        <section className="summary-section">
          <h4 className="summary-section-title">Location frequency</h4>
          <div className="summary-locations">
            {summary.locationFrequency.map(({ location, count }) => {
              const pct = Math.min(100, Math.round((count / maxLoc) * 100))
              return (
                <div key={location} className="summary-loc-row">
                  <span className="summary-loc-name">{location}</span>
                  <div className="summary-loc-bar-track">
                    <div className="summary-loc-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="summary-loc-count">{count}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* High-risk tips */}
      {summary.highRiskTips.length > 0 && (
        <section className="summary-section">
          <h4 className="summary-section-title">High-risk tips</h4>
          {summary.highRiskTips.map((r) => (
            <button key={r.id} className="summary-tip" onClick={() => onRecordSelect(r)}>
              <div className="summary-tip-top">
                <span className="summary-tip-suspect">{r.personName}</span>
                <span className={`summary-tip-conf summary-tip-conf--${r.reliability}`}>
                  {r.reliability}
                </span>
              </div>
              <div className="summary-tip-content">{r.content}</div>
            </button>
          ))}
        </section>
      )}
    </div>
  )
}
