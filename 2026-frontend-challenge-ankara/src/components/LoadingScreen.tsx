function SkeletonBar({ width = '100%', height = 12 }: { width?: string | number; height?: number }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 4 }} />
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <SkeletonBar width={64} height={18} />
        <SkeletonBar width={48} height={12} />
      </div>
      <SkeletonBar width="70%" height={14} />
      <SkeletonBar width="45%" height={11} />
      <SkeletonBar width="90%" height={11} />
      <SkeletonBar width="75%" height={11} />
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="layout">
      {/* Header skeleton */}
      <div className="header">
        <span className="header-title">Investigation Board</span>
        <SkeletonBar width={80} height={12} />
      </div>

      <div className="layout-body">
        {/* Left panel skeleton */}
        <aside className="left-panel">
          <SkeletonBar height={34} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <SkeletonBar width="40%" height={11} />
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBar key={i} height={30} />
            ))}
          </div>
        </aside>

        {/* Main skeleton */}
        <main className="main-area" style={{ background: 'var(--bg)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <SkeletonBar width={110} height={30} />
            <SkeletonBar width={130} height={30} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>

        {/* Right panel skeleton */}
        <aside className="right-panel">
          <div className="loading-spinner-wrap">
            <div className="loading-spinner" />
            <p className="loading-text">Fetching investigation data…</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
