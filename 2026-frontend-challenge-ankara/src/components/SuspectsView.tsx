import { useMemo, useState } from 'react'
import type { InvestigationRecord } from '../types'
import {
  computeInvestigationSummary,
  type PersonScore,
  type SuspicionLevel,
} from '../utils/suspicion'

const LEVEL_CONFIG: Record<SuspicionLevel, { label: string; color: string; bg: string }> = {
  very:       { label: 'High Risk',  color: '#c62828', bg: 'rgba(198,40,40,0.10)' },
  suspicious: { label: 'Suspicious', color: '#e65100', bg: 'rgba(230,81,0,0.10)'  },
  watched:    { label: 'Watched',    color: '#546e7a', bg: 'rgba(84,110,122,0.10)' },
}

function SuspectCard({
  person,
  rank,
  maxScore,
  onClick,
  onAccuse,
}: {
  person: PersonScore
  rank: number
  maxScore: number
  onClick: () => void
  onAccuse: () => void
}) {
  const cfg = LEVEL_CONFIG[person.level]
  const pct = Math.min(100, Math.round((person.score / maxScore) * 100))

  return (
    <div className="suspect-card">
      <div className="suspect-rank" style={{ color: cfg.color, background: cfg.bg }}>
        #{rank}
      </div>
      <div className="suspect-body">
        <div className="suspect-top">
          <span className="suspect-name">{person.name}</span>
          <span className="suspect-level-badge" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          <span className="suspect-score">{person.score} pts</span>
        </div>
        <div className="suspect-bar-track">
          <div
            className="suspect-bar-fill"
            style={{ width: `${pct}%`, background: cfg.color }}
          />
        </div>
        <div className="suspect-meta">
          <span>{person.appearances} appearances</span>
          <span>{person.podoCo} with Podo</span>
          <span>{person.tipCount} tips</span>
        </div>
        <div className="suspect-reasons">{person.reasons.join(' · ')}</div>
        <div className="suspect-actions">
          <button className="suspect-filter-btn" onClick={onClick} type="button">
            View Records
          </button>
          <button
            className="suspect-accuse-btn"
            onClick={(e) => { e.stopPropagation(); onAccuse() }}
            type="button"
          >
            ⚖ Accuse
          </button>
        </div>
      </div>
    </div>
  )
}

interface VerdictOverlayProps {
  person: PersonScore
  onReopen: () => void
  onViewRecords: () => void
}

function VerdictOverlay({ person, onReopen, onViewRecords }: VerdictOverlayProps) {
  const cfg = LEVEL_CONFIG[person.level]
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="verdict-overlay">
      <div className="verdict-card">
        <div className="verdict-stamp">CASE CLOSED</div>
        <div className="verdict-icon">⚖</div>
        <p className="verdict-label">PRIMARY SUSPECT</p>
        <h2 className="verdict-name">{person.name}</h2>
        <span className="verdict-level" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>

        <div className="verdict-score-row">
          <span className="verdict-score-num">{person.score}</span>
          <span className="verdict-score-unit">suspicion points</span>
        </div>

        <div className="verdict-evidence">
          <p className="verdict-evidence-title">Evidence summary</p>
          <ul className="verdict-evidence-list">
            {person.reasons.map((r, i) => (
              <li key={i} className="verdict-evidence-item">
                <span className="verdict-evidence-bullet">▸</span>
                {r}
              </li>
            ))}
            <li className="verdict-evidence-item">
              <span className="verdict-evidence-bullet">▸</span>
              {person.appearances} total appearances in the investigation
            </li>
            <li className="verdict-evidence-item">
              <span className="verdict-evidence-bullet">▸</span>
              Co-occurred with Podo in {person.podoCo} separate records
            </li>
          </ul>
        </div>

        <p className="verdict-timestamp">Verdict issued: {now}</p>

        <div className="verdict-actions">
          <button className="verdict-btn verdict-btn--secondary" onClick={onReopen} type="button">
            Reopen Case
          </button>
          <button className="verdict-btn verdict-btn--primary" onClick={onViewRecords} type="button">
            View Records
          </button>
        </div>
      </div>
    </div>
  )
}

interface SuspectsViewProps {
  allRecords: InvestigationRecord[]
  onPersonClick: (name: string) => void
}

export function SuspectsView({ allRecords, onPersonClick }: SuspectsViewProps) {
  const [accusedPerson, setAccusedPerson] = useState<PersonScore | null>(null)
  const summary = useMemo(() => computeInvestigationSummary(allRecords), [allRecords])
  const maxScore = summary.suspicionRanking[0]?.score ?? 1
  const totalPersons = summary.suspicionRanking.length

  if (accusedPerson) {
    return (
      <VerdictOverlay
        person={accusedPerson}
        onReopen={() => setAccusedPerson(null)}
        onViewRecords={() => { setAccusedPerson(null); onPersonClick(accusedPerson.name) }}
      />
    )
  }

  return (
    <div className="suspects-ranking">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Suspect Analysis</p>
          <h2 className="section-title">Suspicion ranking</h2>
        </div>
        <span className="section-meta">{totalPersons} persons of interest</span>
      </div>

      <div className="suspects-list">
        {summary.suspicionRanking.map((person, i) => (
          <SuspectCard
            key={person.name}
            person={person}
            rank={i + 1}
            maxScore={maxScore}
            onClick={() => onPersonClick(person.name)}
            onAccuse={() => setAccusedPerson(person)}
          />
        ))}
      </div>
    </div>
  )
}
