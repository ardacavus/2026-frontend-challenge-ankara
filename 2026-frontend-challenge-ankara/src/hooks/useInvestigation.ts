import { useEffect, useMemo, useState } from 'react'
import { fetchAllInvestigationData } from '../services'
import type { InvestigationRecord, SourceType } from '../types'

export function useInvestigation() {
  const [records, setRecords] = useState<InvestigationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<SourceType[]>([])
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
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

    if (selectedPerson) {
      result = result.filter(
        (r) => r.personName === selectedPerson || r.relatedPersonName === selectedPerson,
      )
    }

    if (selectedLocation) {
      result = result.filter((r) => r.location === selectedLocation)
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
  }, [records, activeFilters, selectedPerson, selectedLocation, searchQuery])

  const toggleFilter = (type: SourceType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setActiveFilters([])
    setSelectedPerson(null)
    setSelectedLocation(null)
  }

  const sourceCounts = useMemo(
    () =>
      (['checkin', 'message', 'sighting', 'note', 'tip'] as SourceType[]).reduce(
        (acc, t) => ({ ...acc, [t]: records.filter((r) => r.sourceType === t).length }),
        {} as Record<SourceType, number>,
      ),
    [records],
  )

  const uniquePersons = useMemo(() => {
    const names = new Set<string>()
    records.forEach((r) => {
      if (r.personName) names.add(r.personName)
      if (r.relatedPersonName) names.add(r.relatedPersonName)
    })
    return [...names].sort((a, b) => a.localeCompare(b, 'tr'))
  }, [records])

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>()
    records.forEach((r) => { if (r.location) locs.add(r.location) })
    return [...locs].sort((a, b) => a.localeCompare(b, 'tr'))
  }, [records])

  const activeFilterCount =
    activeFilters.length +
    (selectedPerson ? 1 : 0) +
    (selectedLocation ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

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
    selectedPerson,
    setSelectedPerson,
    selectedLocation,
    setSelectedLocation,
    uniquePersons,
    uniqueLocations,
    clearAllFilters,
    activeFilterCount,
    selectedRecord,
    setSelectedRecord,
  }
}
