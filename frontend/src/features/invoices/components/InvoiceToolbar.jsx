import { RefreshCw, Search } from "lucide-react";

function InvoiceToolbar({ title, searchTerm, loading, onSearchChange, onRefresh }) {
  return (
    <header className="invoice-toolbar">
      <h1>{title}</h1>

      <div className="toolbar-actions">
        <label className="search-box">
          <Search size={20} />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
          />
        </label>
        <button className="primary-button" onClick={onRefresh} type="button">
          <RefreshCw size={19} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>
    </header>
  );
}

export default InvoiceToolbar;
