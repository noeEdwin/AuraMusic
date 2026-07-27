export function StatusBanner({ message, tone = 'info' }) {
  if (!message) {
    return null
  }

  return <p className={`status-banner ${tone}`}>{message}</p>
}
