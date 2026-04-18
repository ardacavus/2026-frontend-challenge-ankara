import { useMemo } from 'react'
import type { InvestigationRecord, SourceType } from '../types'

const SOURCE_TYPES: SourceType[] = ['checkin', 'message', 'sighting', 'note', 'tip']
const SOURCE_LABELS: Record<SourceType, string> = {
  checkin: 'Check-ins',
  message: 'Messages',
  sighting: 'Sightings',
  note: 'Notes',
  tip: 'Tips',
}
const SOURCE_RGB: Record<SourceType, string> = {
  checkin:  '34,197,94',
  message:  '59,130,246',
  sighting: '249,115,22',
  note:     '168,85,247',
  tip:      '239,68,68',
}

interface ActivityHeatmapProps {
  records: InvestigationRecord[]
}

export function ActivityHeatmap({ records }: ActivityHeatmapProps) {
  const { grid, totalByHour, maxByType, peakHour, peakTotal } = useMemo(() => {
    const grid: Record<SourceType, number[]> = {
      checkin:  Array(24).fill(0),
      message:  Array(24).fill(0),
      sighting: Array(24).fill(0),
      note:     Array(24).fill(0),
      tip:      Array(24).fill(0),
    }
    const totalByHour = Array(24).fill(0)

    for (const r of records) {
      const d = new Date(r.timestamp)
      if (isNaN(d.getTime())) continue
      const h = d.getHours()
      grid[r.sourceType][h]++
      totalByHour[h]++
    }

    const maxByType: Record<SourceType, number> = {} as Record<SourceType, number>
    for (const t of SOURCE_TYPES) {
      maxByType[t] = Math.max(...grid[t], 1)
    }

    const maxTotal = Math.max(...totalByHour, 1)
    const peakHour = totalByHour.indexOf(Math.max(...totalByHour))
    const peakTotal = totalByHour[peakHour]

    return { grid, totalByHour, maxByType, maxTotal, peakHour, peakTotal }
  }, [records])

  const hourLabel = (h: number) => {
    if (h === 0) return '12a'
    if (h < 12) return `${h}a`
    if (h === 12) return '12p'
    return `${h - 12}p`
  }

  return (
    <div className="heatmap-view">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Temporal Analysis</p>
          <h2 className="section-title">Activity heatmap</h2>
        </div>
        <span className="section-meta">{records.length} events · 24-hour window</span>
      </div>

      <div className="heatmap-peak-banner">
        <span className="heatmap-peak-label">Peak activity</span>
        <span className="heatmap-peak-time">
          {peakHour === 0 ? '12:00 AM' : peakHour < 12 ? `${peakHour}:00 AM` : peakHour === 12 ? '12:00 PM' : `${peakHour - 12}:00 PM`}
        </span>
        <span className="heatmap-peak-count">{peakTotal} events</span>
      </div>

      <div className="heatmap-wrap">
        <div className="heatmap-grid" style={{ gridTemplateColumns: `80px repeat(24, 1fr)` }}>
          {/* Hour header row */}
          <div className="heatmap-corner" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className={`heatmap-hour-label${h === peakHour ? ' heatmap-hour-label--peak' : ''}`}>
              {hourLabel(h)}
            </div>
          ))}

          {/* Source type rows */}
          {SOURCE_TYPES.map((type) => (
            <>
              <div key={`label-${type}`} className="heatmap-row-label">
                <span className="heatmap-row-dot" style={{ background: `rgb(${SOURCE_RGB[type]})` }} />
                {SOURCE_LABELS[type]}
              </div>
              {Array.from({ length: 24 }, (_, h) => {
                const count = grid[type][h]
                const intensity = count / maxByType[type]
                const bg = count === 0
                  ? 'rgba(0,0,0,0.04)'
                  : `rgba(${SOURCE_RGB[type]}, ${0.15 + intensity * 0.75})`
                return (
                  <div
                    key={`${type}-${h}`}
                    className="heatmap-cell"
                    style={{ background: bg }}
                    title={`${SOURCE_LABELS[type]} at ${hourLabel(h)}: ${count}`}
                  >
                    {count > 0 && <span className="heatmap-cell-count">{count}</span>}
                  </div>
                )
              })}
            </>
          ))}

          {/* Total row */}
          <div className="heatmap-row-label heatmap-row-label--total">Total</div>
          {totalByHour.map((count, h) => {
            const maxT = Math.max(...totalByHour, 1)
            const intensity = count / maxT
            const bg = count === 0 ? 'rgba(0,0,0,0.04)' : `rgba(100,116,139,${0.12 + intensity * 0.7})`
            return (
              <div
                key={`total-${h}`}
                className={`heatmap-cell heatmap-cell--total${h === peakHour ? ' heatmap-cell--peak' : ''}`}
                style={{ background: bg }}
                title={`Total at ${hourLabel(h)}: ${count}`}
              >
                {count > 0 && <span className="heatmap-cell-count">{count}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="heatmap-legend">
        {SOURCE_TYPES.map((type) => (
          <span key={type} className="heatmap-legend-item">
            <span className="heatmap-legend-swatch" style={{ background: `rgb(${SOURCE_RGB[type]})` }} />
            {SOURCE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  )
}
