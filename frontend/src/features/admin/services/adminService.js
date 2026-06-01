import axiosInstance from "../../../shared/config/axiosInstance";

export const getAdminDashboard = () =>
  axiosInstance.get("/admin/dashboard").then((response) => response.data);

export const getLowStockParts = () =>
  axiosInstance
    .get("/admin/reminders/low-stock")
    .then((response) => response.data);

export const sendLowStockAlerts = () =>
  axiosInstance
    .post("/admin/reminders/low-stock/send")
    .then((response) => response.data);

export const getOverdueCredits = () =>
  axiosInstance
    .get("/admin/reminders/overdue-credits")
    .then((response) => response.data);

export const sendCreditReminders = () =>
  axiosInstance
    .post("/admin/reminders/overdue-credits/send")
    .then((response) => response.data);

export const getStaffProfiles = () =>
  axiosInstance.get("/admin/staff").then((response) => response.data);

export const createStaffProfile = (data) =>
  axiosInstance.post("/admin/staff", data).then((response) => response.data);

export const updateStaffProfile = (staffId, data) =>
  axiosInstance
    .put(`/admin/staff/${staffId}`, data)
    .then((response) => response.data);

export const deleteStaffProfile = (staffId) =>
  axiosInstance.delete(`/admin/staff/${staffId}`);
