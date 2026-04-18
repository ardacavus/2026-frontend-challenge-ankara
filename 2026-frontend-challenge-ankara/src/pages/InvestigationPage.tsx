import { useState } from 'react'
import { useInvestigation } from '../hooks'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { RecordList } from '../components/RecordList'
import { DetailPanel } from '../components/DetailPanel'
import { PodoTimeline } from '../components/PodoTimeline'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'

type ActiveView = 'records' | 'podo'

export function InvestigationPage() {
  const [activeView, setActiveView] = useState<ActiveView>('records')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    records,
    filteredRecords,
    loading,
    error,
    retry,
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

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} onRetry={retry} />

  const handleRecordSelect = (r: typeof records[0]) => {
    setSelectedRecord(r)
    setActiveView('records')
    setSidebarOpen(false)
  }

  const podoCount = records.filter(
    (r) => r.personName === 'Podo' || r.relatedPersonName === 'Podo',
  ).length

  return (
    <div className="layout">
      <Header
        total={records.length}
        filtered={filteredRecords.length}
        onMenuClick={() => setSidebarOpen((o) => !o)}
        menuOpen={sidebarOpen}
      />
      <div className="layout-body">
        {sidebarOpen && (
          <div
            className="sidebar-backdrop sidebar-backdrop--visible"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`left-panel${sidebarOpen ? ' left-panel--open' : ''}`}>
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
              <span className="view-tab-count">{podoCount}</span>
            </button>
          </div>

          {activeView === 'records' ? (
            <RecordList
              records={filteredRecords}
              selectedId={selectedRecord?.id ?? null}
              onSelect={setSelectedRecord}
              totalRecords={records.length}
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
