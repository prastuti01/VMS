export function MetricCard({ label, value, hint, icon, tone }) {
  const IconComponent = icon

  return (
    <article className="metric-card">
      <div className="metric-heading">
        <span>{label}</span>
        <div className={`metric-icon ${tone}`}>
          <IconComponent size={22} />
        </div>
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  )
}
