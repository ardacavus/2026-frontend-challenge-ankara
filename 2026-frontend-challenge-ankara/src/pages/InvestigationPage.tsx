import { useState } from 'react'
import { useInvestigation } from '../hooks'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { RecordList } from '../components/RecordList'
import { DetailPanel } from '../components/DetailPanel'
import { PodoTimeline } from '../components/PodoTimeline'

type ActiveView = 'records' | 'podo'

export function InvestigationPage() {
  const [activeView, setActiveView] = useState<ActiveView>('records')

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

  const handleRecordSelect = (r: typeof records[0]) => {
    setSelectedRecord(r)
    // Switch to records view so detail panel is visible
    setActiveView('records')
  }

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
          {/* Tab bar */}
          <div className="view-tabs">
            <button
              className={`view-tab${activeView === 'records' ? ' view-tab--active' : ''}`}
              onClick={() => setActiveView('records')}
            >
              All Records
              <span className="view-tab-count">{filteredRecords.length}</span>
            </button>
            <button
              className={`view-tab view-tab--podo${activeView === 'podo' ? ' view-tab--active' : ''}`}
              onClick={() => setActiveView('podo')}
            >
              🔍 Podo Timeline
              <span className="view-tab-count">
                {records.filter((r) => r.personName === 'Podo' || r.relatedPersonName === 'Podo').length}
              </span>
            </button>
          </div>

          {activeView === 'records' ? (
            <RecordList
              records={filteredRecords}
              selectedId={selectedRecord?.id ?? null}
              onSelect={setSelectedRecord}
            />
          ) : (
            <PodoTimeline allRecords={records} onRecordSelect={handleRecordSelect} />
          )}
        </main>

        <aside className="right-panel">
          <DetailPanel
            record={selectedRecord}
            allRecords={records}
            filteredRecords={filteredRecords}
            onPersonClick={(name) => {
              setSelectedPerson(name)
              setSelectedRecord(null)
              setActiveView('records')
            }}
            onRecordSelect={handleRecordSelect}
          />
        </aside>
      </div>
    </div>
  )
}
