export function StatusPill({ status }) {
  const key = String(status).toLowerCase()
  const tone = key.includes('out') || key.includes('credit') || key.includes('days')
    ? 'error'
    : key.includes('low')
      ? 'warning'
      : key.includes('admin')
        ? 'indigo'
        : key.includes('staff')
          ? 'info'
          : 'success'

  return <span className={`status-pill ${tone}`}>{status}</span>
}
