interface HeaderProps {
  total: number
  filtered: number
  onMenuClick?: () => void
  menuOpen?: boolean
}

export function Header({ total, filtered, onMenuClick, menuOpen }: HeaderProps) {
  return (
    <header className="header">
      {onMenuClick && (
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label={menuOpen ? 'Close filters' : 'Open filters'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      )}
      <span className="header-title">Investigation Board</span>
      <span className="header-count">
        {filtered === total ? `${total} records` : `${filtered} / ${total} records`}
      </span>
    </header>
  )
}
