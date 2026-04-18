interface HeaderProps {
  total: number
  filtered: number
  podoCount?: number
  mappedCount?: number
  onMenuClick?: () => void
  menuOpen?: boolean
}

export function Header({
  total,
  filtered,
  podoCount = 0,
  mappedCount = 0,
  onMenuClick,
  menuOpen,
}: HeaderProps) {
  return (
    <header className="hero-header">
      <div className="hero-header-top">
        <div className="hero-brand">
          {onMenuClick && (
            <button
              className="header-menu-btn"
              onClick={onMenuClick}
              aria-label={menuOpen ? 'Close filters' : 'Open filters'}
              type="button"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
          <span className="hero-brand-badge">Jotform Caseboard</span>
        </div>
      </div>

      <div className="hero-header-main">
        <div className="hero-copy">
          <p className="hero-eyebrow">Investigation Dashboard</p>
          <h1 className="hero-title">Missing Podo: The Ankara Case</h1>
          <p className="hero-subtitle">
            Cross-source investigation workspace built from Jotform submissions.
            Explore linked records, trace Podo&apos;s last sightings, and surface suspicious patterns
            across check-ins, messages, tips, notes, and sightings.
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <span className="hero-stat-label">Total Records</span>
            <strong className="hero-stat-value">{total}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">Active Results</span>
            <strong className="hero-stat-value">{filtered}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">Podo Events</span>
            <strong className="hero-stat-value">{podoCount}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">Mapped Locations</span>
            <strong className="hero-stat-value">{mappedCount}</strong>
          </div>
        </div>
      </div>
    </header>
  )
}