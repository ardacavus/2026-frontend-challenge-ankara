import type { SourceType } from '../types'

const SOURCE_FILTERS: { type: SourceType; label: string }[] = [
  { type: 'checkin', label: 'Checkins' },
  { type: 'message', label: 'Messages' },
  { type: 'sighting', label: 'Sightings' },
  { type: 'note', label: 'Notes' },
  { type: 'tip', label: 'Tips' },
]

interface FilterBarProps {
  // Source type
  active: SourceType[]
  onToggle: (type: SourceType) => void
  counts: Record<SourceType, number>
  // Person
  selectedPerson: string | null
  onPersonChange: (person: string | null) => void
  uniquePersons: string[]
  // Location
  selectedLocation: string | null
  onLocationChange: (location: string | null) => void
  uniqueLocations: string[]
  // Clear
  activeFilterCount: number
  onClear: () => void
}

export function FilterBar({
  active,
  onToggle,
  counts,
  selectedPerson,
  onPersonChange,
  uniquePersons,
  selectedLocation,
  onLocationChange,
  uniqueLocations,
  activeFilterCount,
  onClear,
}: FilterBarProps) {
  return (
    <div className="filter-bar">

      <div className="filter-section">
        <p className="filter-label">Source type</p>
        {SOURCE_FILTERS.map(({ type, label }) => (
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

      <div className="filter-section">
        <p className="filter-label">Person</p>
        <select
          className="filter-select"
          value={selectedPerson ?? ''}
          onChange={(e) => onPersonChange(e.target.value || null)}
        >
          <option value="">All people</option>
          {uniquePersons.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <p className="filter-label">Location</p>
        <select
          className="filter-select"
          value={selectedLocation ?? ''}
          onChange={(e) => onLocationChange(e.target.value || null)}
        >
          <option value="">All locations</option>
          {uniqueLocations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {activeFilterCount > 0 && (
        <button className="filter-clear-btn" onClick={onClear}>
          Clear filters
          <span className="filter-clear-count">{activeFilterCount}</span>
        </button>
      )}

    </div>
  )
}
