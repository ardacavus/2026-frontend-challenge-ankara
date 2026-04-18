import { useEffect, useMemo, useState } from 'react'
import { fetchAllInvestigationData } from '../services'
import type { InvestigationRecord, SourceType } from '../types'

export function useInvestigation() {
  const [records, setRecords] = useState<InvestigationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<SourceType[]>([])
  const [selectedRecord, setSelectedRecord] = useState<InvestigationRecord | null>(null)

  useEffect(() => {
    fetchAllInvestigationData()
      .then(setRecords)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  const filteredRecords = useMemo(() => {
    let result = records
    if (activeFilters.length > 0) {
      result = result.filter((r) => activeFilters.includes(r.sourceType))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.personName.toLowerCase().includes(q) ||
          r.relatedPersonName?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q),
      )
    }
    return result
  }, [records, activeFilters, searchQuery])

  const toggleFilter = (type: SourceType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const sourceCounts = useMemo(
    () =>
      (['checkin', 'message', 'sighting', 'note', 'tip'] as SourceType[]).reduce(
        (acc, t) => ({ ...acc, [t]: records.filter((r) => r.sourceType === t).length }),
        {} as Record<SourceType, number>,
      ),
    [records],
  )

  return {
    records,
    filteredRecords,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    toggleFilter,
    sourceCounts,
    selectedRecord,
    setSelectedRecord,
  }
}
