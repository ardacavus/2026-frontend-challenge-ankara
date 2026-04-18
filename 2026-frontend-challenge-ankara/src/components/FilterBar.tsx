import type { SourceType } from '../types'

const FILTERS: { type: SourceType; label: string }[] = [
  { type: 'checkin', label: 'Checkins' },
  { type: 'message', label: 'Messages' },
  { type: 'sighting', label: 'Sightings' },
  { type: 'note', label: 'Notes' },
  { type: 'tip', label: 'Tips' },
]

interface FilterBarProps {
  active: SourceType[]
  onToggle: (type: SourceType) => void
  counts: Record<SourceType, number>
}

export function FilterBar({ active, onToggle, counts }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <p className="filter-label">Filter by type</p>
      {FILTERS.map(({ type, label }) => (
        <button
          key={type}
          className={`filter-btn filter-btn--${type}${active.includes(type) ? ' filter-btn--active' : ''}`}
          onClick={() => onToggle(type)}
        >
          {label}
          <span className="filter-count">{counts[type] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
