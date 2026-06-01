import { FaBoxes } from 'react-icons/fa'
import { PanelHeader } from '../../components/ui/PanelHeader'
import { StatusPill } from '../../components/ui/StatusPill'

export function StockTable({ parts, isCompact = false }) {
  return (
    <section className="panel table-panel">
      <PanelHeader title="Low Stock Parts" action={`${parts.length} items`} />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Stock</th>
              {!isCompact && <th>Threshold</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.partId}>
                <td>
                  <div className="part-cell">
                    <div className="part-thumb">
                      <FaBoxes size={22} />
                    </div>
                    <div>
                      <strong>{part.name}</strong>
                      <span>#{part.partId}</span>
                    </div>
                  </div>
                </td>
                <td>{part.category}</td>
                <td>
                  <strong className="table-main-text">{part.vendorName}</strong>
                  {!isCompact && (
                    <span className="table-sub-text">{part.vendorEmail}</span>
                  )}
                </td>
                <td
                  className={
                    part.stockQuantity === 0 ? 'text-error' : 'text-warning'
                  }
                >
                  {part.stockQuantity}
                </td>
                {!isCompact && <td>{part.reorderThreshold}</td>}
                <td>
                  <StatusPill
                    status={
                      part.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
