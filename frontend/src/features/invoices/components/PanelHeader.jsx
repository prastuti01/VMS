function PanelHeader({ title, meta }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      {meta && <span>{meta}</span>}
    </div>
  );
}

export default PanelHeader;
