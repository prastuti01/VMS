import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./shared/guards/ProtectedRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

import CustomerDashboard from "./features/customers/pages/CustomerDashboard";
import ProfilePage from "./features/customers/pages/ProfilePage";
import BookAppointmentPage from "./features/customers/pages/BookAppointmentPage";
import PartRequestsPage from "./features/customers/pages/PartRequestsPage";
import SubmitReviewPage from "./features/customers/pages/SubmitReviewPage";

import StaffDashboardPage from "./features/staff/pages/StaffDashboardPage";

import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import VendorManagement from "./features/vendors/pages/VendorManagement";
import PartsManagement from "./features/parts/pages/PartsManagement";

import InvoiceWorkspace from "./features/invoices/InvoiceWorkspace";
import FinancialReport from "./features/financialReport/pages/FinancialReport";
import CustomerHistoryPage from "./features/customers/pages/CustomerHistoryPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/book-appointment"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/part-requests"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <PartRequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/reviews"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <SubmitReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Staff", "Admin"]}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/register-customer"
            element={<Navigate to="/staff/dashboard" replace />}
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <VendorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parts"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <PartsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/purchase-invoices"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <InvoiceWorkspace mode="purchase" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/sales-invoices"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <InvoiceWorkspace mode="sales" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/financial-report"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <FinancialReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/history"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
