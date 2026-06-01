import { FaCreditCard, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa'
import { MetricCard } from '../../components/ui/MetricCard'
import { formatMoney, formatNumber } from '../../utils/formatters'
import { CreditTable } from './CreditTable'
import { StockTable } from './StockTable'

export function ReminderView({ lowStockParts, overdueCredits }) {
  const overdueTotal = overdueCredits.reduce(
    (total, credit) => total + credit.remainingBalance,
    0,
  )

  return (
    <>
      <div className="metrics-grid reminder-metrics">
        <MetricCard
          label="Low Stock Items"
          value={formatNumber(lowStockParts.length)}
          icon={FaExclamationTriangle}
          tone="warning"
        />
        <MetricCard
          label="Credit Reminders"
          value={formatNumber(overdueCredits.length)}
          icon={FaEnvelope}
          tone="error"
        />
        <MetricCard
          label="Credit Amount"
          value={formatMoney(overdueTotal)}
          icon={FaCreditCard}
          tone="purple"
        />
      </div>

      <div className="dashboard-grid">
        <StockTable parts={lowStockParts} />
        <CreditTable credits={overdueCredits} />
      </div>
    </>
  )
}
