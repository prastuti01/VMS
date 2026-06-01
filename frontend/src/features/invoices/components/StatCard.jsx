function StatCard({ label, value, icon, tone }) {
  return (
    <article className="stat-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className={`stat-icon ${tone}`}>{icon}</div>
    </article>
  );
}

export default StatCard;
