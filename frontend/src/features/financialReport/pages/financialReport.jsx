import { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import { getFinancialReport } from "../../../shared/config/api";
import "./financialReport.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

const formatCurrency = (amount) => Number(amount || 0).toLocaleString();

export default function FinancialReport() {
  const [filter, setFilter] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await getFinancialReport(filter);
        if (isMounted) {
          setReport(response.data);
          setAnimKey((k) => k + 1);
        }
      } catch (error) {
        console.error("Failed to load report", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReport();
    return () => { isMounted = false; };
  }, [filter]);

  if (loading) {
    return (
      <div className="fr-loading">
        <div className="fr-loading-spinner" />
        <span>Loading financial data…</span>
      </div>
    );
  }

  /* ── Derived metrics (all from API) ── */
  const isProfitPositive = report.profit >= 0;

  const profitMargin =
    report.totalRevenue > 0
      ? ((report.profit / report.totalRevenue) * 100).toFixed(1)
      : 0;

  const expenseRatio =
    report.totalRevenue > 0
      ? ((report.totalPurchaseCost / report.totalRevenue) * 100).toFixed(0)
      : 0;

  const coverageRatio =
    report.totalPurchaseCost > 0
      ? ((report.totalRevenue / report.totalPurchaseCost) * 100).toFixed(0)
      : 0;

  /* ─────────────────────────────────────────
     Line chart
     Expects from API:
       report.trend        → number[]   e.g. [8100, 12400, 9800, ...]
       report.trendLabels  → string[]   e.g. ["Jan", "Feb", "Mar", ...]
  ───────────────────────────────────────── */
  const trendData = {
    labels: report.trendLabels ?? [],
    datasets: [
      {
        label: "Revenue",
        data: report.trend ?? [],
        borderColor: "#1e3a8a",
        backgroundColor: "rgba(30,58,138,0.08)",
        tension: 0.45,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#1e3a8a",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  /* ── Bar chart ── */
  const barData = {
    labels: ["Revenue", "Purchase Cost"],
    datasets: [
      {
        data: [report.totalRevenue, report.totalPurchaseCost],
        backgroundColor: ["rgba(30,58,138,0.85)", "rgba(239,68,68,0.82)"],
        borderRadius: 10,
        barThickness: 72,
      },
    ],
  };

  /* ── Doughnut chart ── */
  const doughnutData = {
    labels: ["Revenue", "Purchase Cost"],
    datasets: [
      {
        data: [report.totalRevenue, report.totalPurchaseCost],
        backgroundColor: ["#1e3a8a", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const sharedScales = {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: { color: "#9ca3af" },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: sharedScales,
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: sharedScales,
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#6b7280", padding: 16, font: { size: 13 } },
      },
    },
    cutout: "68%",
  };

  /* ── KPI card definitions ── */
  const kpiCards = [
    {
      cls: "fr-kpi--revenue",
      icon: <FaMoneyBillWave />,
      label: "Total Revenue",
      value: `Rs. ${formatCurrency(report.totalRevenue)}`,
      chip: { label: "Income", positive: true },
    },
    {
      cls: "fr-kpi--purchase",
      icon: <FaShoppingCart />,
      label: "Total Purchase Cost",
      value: `Rs. ${formatCurrency(report.totalPurchaseCost)}`,
      chip: { label: "Expenses", positive: false },
    },
    {
      cls: isProfitPositive ? "fr-kpi--profit" : "fr-kpi--loss",
      icon: isProfitPositive ? <FaArrowUp /> : <FaArrowDown />,
      label: isProfitPositive ? "Net Profit" : "Net Loss",
      value: `Rs. ${formatCurrency(Math.abs(report.profit))}`,
      valueClass: isProfitPositive ? "fr-positive" : "fr-negative",
      chip: {
        label: isProfitPositive ? "Profit" : "Loss",
        positive: isProfitPositive,
      },
    },
    {
      cls: "fr-kpi--invoices",
      icon: <FaFileInvoiceDollar />,
      label: "Total Sales Invoices",
      value: report.totalSalesInvoices,
      chip: {
        label: report.totalSalesInvoices > 5 ? "High activity" : "Low activity",
        positive: report.totalSalesInvoices > 5,
        neutral: report.totalSalesInvoices <= 5,
      },
    },
  ];

  /* ── Insight metric boxes ── */
  const metrics = [
    {
      label: "Profit Margin",
      value: `${profitMargin}%`,
      sub: Number(profitMargin) > 20 ? "Healthy margin" : "Needs attention",
      color: Number(profitMargin) > 20 ? "var(--success)" : "var(--error)",
      bar: Math.min(Math.abs(profitMargin), 100),
      barColor: Number(profitMargin) > 20 ? "var(--success)" : "var(--error)",
    },
    {
      label: "Expense Ratio",
      value: `${expenseRatio}%`,
      sub: Number(expenseRatio) < 70 ? "Under control" : "High spend",
      color: Number(expenseRatio) < 70 ? "var(--success)" : "var(--error)",
      bar: Math.min(Number(expenseRatio), 100),
      barColor: Number(expenseRatio) < 70 ? "var(--indigo)" : "var(--error)",
    },
    {
      label: "Revenue Coverage",
      value: `${coverageRatio}%`,
      sub: "of purchase cost covered",
      color: "var(--secondary)",
      bar: Math.min(Number(coverageRatio), 100),
      barColor: "var(--secondary)",
    },
    {
      label: "Business Status",
      value: isProfitPositive ? "Profitable" : "In Loss",
      sub: isProfitPositive ? "On track" : "Review spending",
      color: isProfitPositive ? "var(--success)" : "var(--error)",
      bar: null,
    },
  ];

  return (
    <div className="fr-page" key={animKey}>

      {/* ── Filter row (no duplicate page title) ── */}
      <div className="fr-filter-row">
        <div className="fr-filter-group">
          {["daily", "monthly", "yearly"].map((f) => (
            <button
              key={f}
              className={`fr-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards — always on top ── */}
      <div className="fr-kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.label} className={`fr-kpi-card ${card.cls}`}>
            <div className="fr-kpi-icon">{card.icon}</div>
            <div className="fr-kpi-body">
              <span className="fr-kpi-label">{card.label}</span>
              <h3 className={`fr-kpi-value ${card.valueClass || ""}`}>
                {card.value}
              </h3>
            </div>
            <div
              className={`fr-kpi-chip ${
                card.chip.neutral
                  ? "fr-chip--neutral"
                  : card.chip.positive
                  ? "fr-chip--up"
                  : "fr-chip--down"
              }`}
            >
              {!card.chip.neutral &&
                (card.chip.positive ? <FaArrowUp /> : <FaArrowDown />)}
              {card.chip.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts + Metrics ── */}
      <div className="fr-main-grid">

        {/* Revenue Trend line — 100% from API */}
        <div className="fr-card fr-card--trend">
          <div className="fr-card-header">
            <div>
              <h3 className="fr-card-title">Revenue Trend</h3>
              <p className="fr-card-sub">Performance over time</p>
            </div>
            <span className="fr-badge">{filter}</span>
          </div>
          {report.trend?.length ? (
            <div className="fr-chart-wrap">
              <Line data={trendData} options={lineOptions} />
            </div>
          ) : (
            <div className="fr-no-data">
              No trend data returned for this period.
              <br />
              <small>Ensure your API returns <code>trend</code> and <code>trendLabels</code> arrays.</small>
            </div>
          )}
        </div>

        {/* Bar comparison */}
        <div className="fr-card fr-card--bar">
          <div className="fr-card-header">
            <div>
              <h3 className="fr-card-title">Revenue vs Cost</h3>
              <p className="fr-card-sub">Side-by-side comparison</p>
            </div>
            <span className="fr-badge">{filter}</span>
          </div>
          <div className="fr-chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Metric boxes */}
        <div className="fr-metrics-panel">
          {metrics.map((m) => (
            <div className="fr-metric-box" key={m.label}>
              <span className="fr-metric-label">{m.label}</span>
              <h4 className="fr-metric-value" style={{ color: m.color }}>
                {m.value}
              </h4>
              {m.bar !== null && (
                <div className="fr-metric-bar-track">
                  <div
                    className="fr-metric-bar-fill"
                    style={{ width: `${m.bar}%`, background: m.barColor }}
                  />
                </div>
              )}
              <p className="fr-metric-sub">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Doughnut */}
        <div className="fr-card fr-card--donut">
          <div className="fr-card-header">
            <div>
              <h3 className="fr-card-title">Cost Distribution</h3>
              <p className="fr-card-sub">Revenue vs purchase split</p>
            </div>
          </div>
          <div className="fr-donut-wrap">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="fr-donut-center">
            <span>Total</span>
            <strong>
              Rs. {formatCurrency(report.totalRevenue + report.totalPurchaseCost)}
            </strong>
          </div>
        </div>

      </div>

      {/* ── Dynamic Insight Banner ── */}
      <div
        className={`fr-insight-banner ${
          isProfitPositive ? "fr-insight--profit" : "fr-insight--loss"
        }`}
      >
        <FaChartLine />
        <div>
          <strong>Business Insight</strong>
          <p>
            {isProfitPositive
              ? `You're generating a ${profitMargin}% profit margin this ${filter} period. Purchase costs are ${expenseRatio}% of revenue — consider reinvesting surplus into growth.`
              : `Purchase expenses exceed revenue by Rs. ${formatCurrency(
                  Math.abs(report.profit)
                )} this ${filter} period. Expense ratio stands at ${expenseRatio}% — review purchasing patterns to restore profitability.`}
          </p>
        </div>
      </div>

    </div>
  );
}