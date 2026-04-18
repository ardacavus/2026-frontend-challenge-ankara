import { useEffect } from 'react'
import type { InvestigationRecord } from '../types'
import { RecordCard } from './RecordCard'

interface RecordListProps {
  records: InvestigationRecord[]
  selectedId: string | null
  onSelect: (record: InvestigationRecord) => void
  totalRecords: number
}

export function RecordList({ records, selectedId, onSelect, totalRecords }: RecordListProps) {
  useEffect(() => {
    if (!selectedId) return
    const el = document.querySelector<HTMLElement>(`[data-record-id="${selectedId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  if (records.length === 0) {
    const isFiltered = totalRecords > 0
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{isFiltered ? '🔍' : '📭'}</div>
        <p className="empty-state-title">
          {isFiltered ? 'No records match your filters' : 'No records found'}
        </p>
        <p className="empty-state-hint">
          {isFiltered
            ? 'Try adjusting your search or clearing some filters.'
            : 'Data sources returned no submissions.'}
        </p>
      </div>
    )
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
