import { useEffect, useState } from 'react'
import { fetchAllInvestigationData } from './services'
import type { InvestigationData } from './types'
import './App.css'

function App() {
  const [data, setData] = useState<InvestigationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllInvestigationData()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="app">Loading investigation data...</div>
  if (error) return <div className="app error">Error: {error}</div>
  if (!data) return null

  const counts = [
    { label: 'Checkins', count: data.checkins.length },
    { label: 'Messages', count: data.messages.length },
    { label: 'Sightings', count: data.sightings.length },
    { label: 'Personal Notes', count: data.notes.length },
    { label: 'Anonymous Tips', count: data.tips.length },
  ]

  return (
    <div className="app">
      <h1>2026 Frontend Challenge</h1>
      <div className="counts">
        {counts.map(({ label, count }) => (
          <div key={label} className="count-card">
            <span className="count-number">{count}</span>
            <span className="count-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
