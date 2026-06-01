export function PanelHeader({ title, action }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      {action && <span>{action}</span>}
    </div>
  )
}
