import PanelHeader from "./PanelHeader";

function InvoiceList({ title, meta, emptyText, filters, children }) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  return (
    <section className="panel-card list-card">
      <PanelHeader title={title} meta={meta} />

      {filters}

      <div className="list-body">
        {hasChildren ? children : <p className="empty-state">{emptyText}</p>}
      </div>
    </section>
  );
}

export default InvoiceList;
