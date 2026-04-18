import { useEffect, useState } from 'react'
import { fetchAllInvestigationData } from './services'
import type { InvestigationRecord, SourceType } from './types'
import './App.css'

const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Checkins',
  message: 'Messages',
  sighting: 'Sightings',
  note: 'Personal Notes',
  tip: 'Anonymous Tips',
}

function App() {
  const [records, setRecords] = useState<InvestigationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllInvestigationData()
      .then(setRecords)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="app">Loading investigation data...</div>
  if (error) return <div className="app error">Error: {error}</div>

  const countBySource = (type: SourceType) => records.filter((r) => r.sourceType === type).length

  return (
    <div className="app">
      <h1>Investigation Data</h1>

      <div className="counts">
        {(Object.keys(SOURCE_LABELS) as SourceType[]).map((type) => (
          <div key={type} className="count-card">
            <span className="count-number">{countBySource(type)}</span>
            <span className="count-label">{SOURCE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      <h2>Timeline ({records.length} records)</h2>
      <div className="timeline">
        {records.map((r) => (
          <div key={r.id} className={`record record--${r.sourceType}`}>
            <div className="record-meta">
              <span className="record-type">{SOURCE_LABELS[r.sourceType]}</span>
              <span className="record-time">{new Date(r.timestamp).toLocaleString('tr-TR')}</span>
            </div>
            <div className="record-person">
              <strong>{r.personName}</strong>
              {r.relatedPersonName && <span> → {r.relatedPersonName}</span>}
            </div>
            {r.location && <div className="record-location">📍 {r.location}</div>}
            <div className="record-content">{r.content}</div>
            {r.reliability && <div className="record-reliability">Reliability: {r.reliability}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
