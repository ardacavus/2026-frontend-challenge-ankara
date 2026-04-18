import { useState } from 'react'
import { useInvestigation } from '../hooks'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { RecordList } from '../components/RecordList'
import { DetailPanel } from '../components/DetailPanel'
import { PodoTimeline } from '../components/PodoTimeline'
import { MapView } from '../components/MapView'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'

type ActiveView = 'records' | 'podo' | 'map'

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

  const handleMapRecordSelect = (r: typeof records[0]) => {
    setSelectedRecord(r)
    setSidebarOpen(false)
  }

  const podoCount = records.filter(
    (r) => r.personName === 'Podo' || r.relatedPersonName === 'Podo',
  ).length

  const mappedCount = records.filter((r) => r.coordinates).length

  return (
    <div className="layout">
      <Header
        total={records.length}
        filtered={filteredRecords.length}
        podoCount={podoCount}
        mappedCount={mappedCount}
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
              Podo Timeline
              <span className="view-tab-count">{podoCount}</span>
            </button>

            <button
              className={`view-tab view-tab--map${activeView === 'map' ? ' view-tab--active' : ''}`}
              onClick={() => setActiveView('map')}
            >
              Map View
              <span className="view-tab-count">{mappedCount}</span>
            </button>
          </div>

          {activeView === 'records' && (
            <section className="content-shell">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">Evidence Feed</p>
                  <h2 className="section-title">Cross-source records</h2>
                </div>
                <span className="section-meta">
                  {filteredRecords.length === records.length
                    ? `${records.length} records`
                    : `${filteredRecords.length} of ${records.length} records`}
                </span>
              </div>

              <RecordList
                records={filteredRecords}
                selectedId={selectedRecord?.id ?? null}
                onSelect={setSelectedRecord}
                totalRecords={records.length}
              />
            </section>
          )}

          {activeView === 'podo' && (
            <section className="content-shell">
              <PodoTimeline allRecords={records} onRecordSelect={handleRecordSelect} />
            </section>
          )}

          {activeView === 'map' && (
            <section className="content-shell">
              <MapView
                records={filteredRecords}
                selectedId={selectedRecord?.id ?? null}
                onRecordSelect={handleMapRecordSelect}
              />
            </section>
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