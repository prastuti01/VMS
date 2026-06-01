export function SnapshotItem({ label, value, icon, tone }) {
  const IconComponent = icon

  return (
    <div className="snapshot-item">
      <div className={`metric-icon ${tone}`}>
        <IconComponent size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}
