import type { InvestigationRecord } from '../types'
import { RecordCard } from './RecordCard'

interface RecordListProps {
  records: InvestigationRecord[]
  selectedId: string | null
  onSelect: (record: InvestigationRecord) => void
}

export function RecordList({ records, selectedId, onSelect }: RecordListProps) {
  if (records.length === 0) {
    return <p className="record-list-empty">No records match your search.</p>
  }

  return (
    <div className="record-list">
      {records.map((r) => (
        <RecordCard
          key={r.id}
          record={r}
          isSelected={r.id === selectedId}
          onClick={() => onSelect(r)}
        />
      ))}
    </div>
  )
}
