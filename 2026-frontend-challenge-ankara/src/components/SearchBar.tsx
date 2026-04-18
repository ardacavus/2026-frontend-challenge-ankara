interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-panel">
      <div className="search-panel-header">
        <p className="search-panel-title">Search Records</p>
        <p className="search-panel-subtitle">
          Search people, locations, sightings, notes, and suspicious mentions.
        </p>
      </div>

      <div className="search-input-wrap">
        <span className="search-input-icon">⌕</span>
        <input
          className="search-input"
          type="search"
          placeholder="Search people, places, sightings, notes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className="search-clear-btn"
            onClick={() => onChange('')}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}