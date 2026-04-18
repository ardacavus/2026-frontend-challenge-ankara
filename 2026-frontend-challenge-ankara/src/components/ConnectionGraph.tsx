import { useMemo, useState } from 'react'
import type { InvestigationRecord } from '../types'

interface GNode {
  id: string
  x: number
  y: number
  r: number
  isPodo: boolean
  appearances: number
}

interface GEdge { a: string; b: string; weight: number }

const W = 760
const H = 460
const CX = W / 2
const CY = H / 2

const PODO_COLOR = '#eb5757'
const NODE_COLOR = '#2f80ed'

interface ConnectionGraphProps {
  records: InvestigationRecord[]
  onPersonClick: (name: string) => void
}

export function ConnectionGraph({ records, onPersonClick }: ConnectionGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => {
    const appearances = new Map<string, number>()
    const coMap = new Map<string, number>()

    for (const r of records) {
      const names = [r.personName, r.relatedPersonName].filter((n): n is string => Boolean(n))
      names.forEach((n) => appearances.set(n, (appearances.get(n) ?? 0) + 1))
      if (names.length === 2) {
        const key = [...names].sort().join('||')
        coMap.set(key, (coMap.get(key) ?? 0) + 1)
      }
    }

    const others = [...appearances.keys()]
      .filter((n) => n !== 'Podo')
      .sort((a, b) => (appearances.get(b) ?? 0) - (appearances.get(a) ?? 0))
      .slice(0, 15)

    const display = appearances.has('Podo') ? ['Podo', ...others] : others
    const maxApp = Math.max(...[...appearances.values()])
    const R = Math.min(W, H) * 0.38

    const nodes: GNode[] = display.map((name, i) => {
      const isPodo = name === 'Podo'
      const app = appearances.get(name) ?? 1
      const r = isPodo ? 24 : 9 + (app / maxApp) * 12
      if (isPodo) return { id: name, x: CX, y: CY, r, isPodo, appearances: app }
      const idx = i - (appearances.has('Podo') ? 1 : 0)
      const angle = (idx / others.length) * 2 * Math.PI - Math.PI / 2
      return { id: name, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle), r, isPodo, appearances: app }
    })

    const edges: GEdge[] = []
    for (const [key, weight] of coMap.entries()) {
      const [a, b] = key.split('||')
      if (display.includes(a) && display.includes(b)) edges.push({ a, b, weight })
    }

    return { nodes, edges }
  }, [records])

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const maxW = Math.max(...edges.map((e) => e.weight), 1)

  const connectedIds = useMemo(() => {
    if (!hovered) return null
    const ids = new Set<string>([hovered])
    edges.forEach((e) => {
      if (e.a === hovered) ids.add(e.b)
      if (e.b === hovered) ids.add(e.a)
    })
    return ids
  }, [hovered, edges])

  const nodeOpacity = (id: string) => (!connectedIds || connectedIds.has(id) ? 1 : 0.18)
  const edgeOpacity = (e: GEdge) => (!connectedIds || connectedIds.has(e.a) && connectedIds.has(e.b) ? 1 : 0.06)

  return (
    <div className="graph-view">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Network Analysis</p>
          <h2 className="section-title">Connection graph</h2>
        </div>
        <span className="section-meta">{nodes.length} people · {edges.length} links</span>
      </div>

      <div className="graph-legend">
        <span className="graph-legend-item">
          <span className="graph-legend-dot" style={{ background: PODO_COLOR }} />
          Podo — central subject
        </span>
        <span className="graph-legend-item">
          <span className="graph-legend-dot" style={{ background: NODE_COLOR }} />
          Person of interest (size = appearances)
        </span>
        <span className="graph-legend-note">Line thickness = co-occurrence count · Hover to highlight · Click to filter</span>
      </div>

      <div className="graph-container">
        <svg viewBox={`0 0 ${W} ${H}`} className="graph-svg">
          <defs>
            <radialGradient id="podoglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={PODO_COLOR} stopOpacity="0.22" />
              <stop offset="100%" stopColor={PODO_COLOR} stopOpacity="0"    />
            </radialGradient>
          </defs>

          {/* Podo glow */}
          <circle cx={CX} cy={CY} r={80} fill="url(#podoglow)" />

          {/* Edges */}
          {edges.map((e) => {
            const src = nodeMap.get(e.a)
            const tgt = nodeMap.get(e.b)
            if (!src || !tgt) return null
            const isPodo = e.a === 'Podo' || e.b === 'Podo'
            return (
              <line
                key={`${e.a}||${e.b}`}
                x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={isPodo ? 'rgba(235,87,87,0.55)' : 'rgba(47,128,237,0.3)'}
                strokeWidth={1 + (e.weight / maxW) * 5}
                opacity={edgeOpacity(e)}
                style={{ transition: 'opacity 0.18s' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const labelY = node.y > H - 60
              ? node.y - node.r - 8
              : node.y + node.r + 14
            const color = node.isPodo ? PODO_COLOR : NODE_COLOR
            return (
              <g
                key={node.id}
                style={{
                  cursor: node.isPodo ? 'default' : 'pointer',
                  opacity: nodeOpacity(node.id),
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => !node.isPodo && onPersonClick(node.id)}
              >
                <circle cx={node.x} cy={node.y} r={node.r + 5} fill={color} opacity={0.1} />
                <circle cx={node.x} cy={node.y} r={node.r} fill={color} stroke="#fff" strokeWidth={2.5} />
                {node.isPodo && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800" letterSpacing="0.08em">
                    PODO
                  </text>
                )}
                <text x={node.x} y={labelY} textAnchor="middle" fill="#1f2a37" fontSize="11" fontWeight="700">
                  {node.id}
                </text>
                {!node.isPodo && (
                  <text x={node.x} y={labelY + 12} textAnchor="middle" fill="#6b7280" fontSize="9">
                    {node.appearances}×
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
