interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      className="search-input"
      type="search"
      placeholder="Search names, locations, content..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
