import {
  FaBell,
  FaBoxOpen,
  FaChartBar,
  FaEnvelope,
  FaFileInvoice,
  FaHistory,
  FaSearch,
  FaTachometerAlt,
  FaThLarge,
  FaTruck,
  FaUserPlus,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";

export const adminNavItems = [
  {
    id: "dashboard",
    label: "Admin Dashboard",
    icon: FaThLarge,
  },
  {
    id: "staff",
    label: "Staff Profiles",
    icon: FaUsers,
  },
  {
    id: "reminders",
    label: "Reminders",
    icon: FaBell,
  },
  {
    id: "vendors",
    label: "Vendor Management",
    icon: FaTruck,
  },
  {
    id: "parts",
    label: "Part Management",
    icon: FaBoxOpen,
  },
  {
    id: "purchaseInvoices",
    label: "Purchase Invoices",
    icon: FaFileInvoice,
  },
  {
  id: "financialReport",
  label: "Financial Report",
  icon: FaMoneyBillWave,
},
];

/* =========================
   STAFF NAVIGATION
========================= */

export const staffNavItems = [
  {
    id: "staffDashboard",
    label: "Staff Dashboard",
    icon: FaTachometerAlt,
  },
  {
    id: "registerCustomer",
    label: "Register Customer",
    icon: FaUserPlus,
  },
  {
    id: "customerSearch",
    label: "Customer Search",
    icon: FaSearch,
  },
  {
    id: "customerHistory",
    label: "Customer History",
    icon: FaHistory,
  },
  {
    id: "salesInvoices",
    label: "Sales Invoices",
    icon: FaFileInvoice,
  },
 
  
];

export const viewTitles = {
  /* Admin */
  dashboard: "Admin Dashboard",
  staff: "Staff Profile Management",
  reminders: "Reminders",
  vendors: "Vendor Management",
  parts: "Part Management",
  purchaseInvoices: "Purchase Invoices",
  financialReport: "Financial Report",

  /* Staff */
  staffDashboard: "Staff Dashboard",
  registerCustomer: "Register Customer",
  customerSearch: "Customer Search",
  customerHistory: "Customer History",
  salesInvoices: "Sales Invoices",
  
  customerReports: "Customer Reports",
};

export const searchPlaceholders = {
  /* Admin */
  dashboard: "Search dashboard activity...",
  staff: "Search staff...",
  reminders: "Search reminders...",
  vendors: "Search vendors...",
  parts: "Search parts...",
  

  /* Staff */
  staffDashboard: "Search customers or vehicles...",
  registerCustomer: "Search customer registration...",
  customerSearch: "Search by name, phone, or vehicle number...",
  customerHistory: "Search customer history...",
  salesInvoices: "Search invoices...",
  customerReports: "Search reports...",
};
