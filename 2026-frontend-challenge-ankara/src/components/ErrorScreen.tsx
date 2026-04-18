interface ErrorScreenProps {
  message: string
  onRetry: () => void
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="error-screen">
      <div className="error-card">
        <div className="error-card-icon">⚠️</div>
        <h2 className="error-card-title">Failed to load investigation data</h2>
        <p className="error-card-message">{message}</p>
        <button className="error-card-retry" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  )
}
