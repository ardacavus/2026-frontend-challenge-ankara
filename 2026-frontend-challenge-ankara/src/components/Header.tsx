interface HeaderProps {
  total: number
  filtered: number
}

export function Header({ total, filtered }: HeaderProps) {
  return (
    <header className="header">
      <span className="header-title">Investigation Board</span>
      <span className="header-count">
        {filtered === total ? `${total} records` : `${filtered} / ${total} records`}
      </span>
    </header>
  )
}
