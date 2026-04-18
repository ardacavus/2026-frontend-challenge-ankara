import { useInvestigation } from '../hooks'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { RecordList } from '../components/RecordList'
import { DetailPanel } from '../components/DetailPanel'

export function InvestigationPage() {
  const {
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
  } = useInvestigation()

  if (loading) return <div className="status-screen">Loading investigation data...</div>
  if (error) return <div className="status-screen status-screen--error">Error: {error}</div>

  return (
    <div className="layout">
      <Header total={records.length} filtered={filteredRecords.length} />
      <div className="layout-body">
        <aside className="left-panel">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterBar
            active={activeFilters}
            onToggle={toggleFilter}
            counts={sourceCounts}
            selectedPerson={selectedPerson}
            onPersonChange={setSelectedPerson}
            uniquePersons={uniquePersons}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            uniqueLocations={uniqueLocations}
            activeFilterCount={activeFilterCount}
            onClear={clearAllFilters}
          />
        </aside>

        <main className="main-area">
          <RecordList
            records={filteredRecords}
            selectedId={selectedRecord?.id ?? null}
            onSelect={setSelectedRecord}
          />
        </main>

        <aside className="right-panel">
          <DetailPanel
            record={selectedRecord}
            allRecords={records}
            onPersonClick={(name) => {
              setSelectedPerson(name)
              setSelectedRecord(null)
            }}
          />
        </aside>
      </div>
    </div>
  )
}
