import { PanelHeader } from '../../components/ui/PanelHeader'
import { StatusPill } from '../../components/ui/StatusPill'
import { formatDate, formatMoney } from '../../utils/formatters'

export function CreditTable({ credits, isCompact = false }) {
  return (
    <section className="panel table-panel">
      <PanelHeader
        title="Overdue Credit Reminders"
        action={`${credits.length} invoices`}
      />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              {!isCompact && <th>Sale Date</th>}
              <th>Balance</th>
              <th>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {credits.map((credit) => (
              <tr key={credit.saleId}>
                <td>
                  <strong>#{credit.saleId}</strong>
                  {!isCompact && (
                    <span className="table-sub-text">
                      Paid {formatMoney(credit.amountPaid)}
                    </span>
                  )}
                </td>
                <td>
                  <strong className="table-main-text">
                    {credit.customerEmail}
                  </strong>
                  {!isCompact && (
                    <span className="table-sub-text">
                      {credit.customerPhone}
                    </span>
                  )}
                </td>
                {!isCompact && <td>{formatDate(credit.saleDate)}</td>}
                <td>{formatMoney(credit.remainingBalance)}</td>
                <td>
                  <StatusPill status={`${credit.daysOverdue} days`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
