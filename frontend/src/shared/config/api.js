import axiosInstance from "./axiosInstance";

export const registerCustomerByStaff = (data) =>
  axiosInstance.post("/staff/customers", data);

export const getProfile = () => axiosInstance.get("/customers/profile");

export const updateProfile = (data) =>
  axiosInstance.put("/customers/profile", data);

export const addVehicle = (data) =>
  axiosInstance.post("/customers/vehicles", data);

export const deleteVehicle = (id) =>
  axiosInstance.delete(`/customers/vehicles/${id}`);

export const registerCustomer = (data) =>
  axiosInstance.post("/auth/register", data);

// Vendor Management APIs
export const getVendors = () =>
  axiosInstance.get("/vendors");

export const getVendorById = (id) =>
  axiosInstance.get(`/vendors/${id}`);

export const createVendor = (data) =>
  axiosInstance.post("/vendors", data);

export const updateVendor = (id, data) =>
  axiosInstance.put(`/vendors/${id}`, data);

export const deleteVendorApi = (id) =>
  axiosInstance.delete(`/vendors/${id}`);

//Part Management APIs
export const getParts = () => axiosInstance.get("/parts");

export const getPartById = (id) =>
  axiosInstance.get(`/parts/${id}`);

export const createPart = (data) =>
  axiosInstance.post("/parts", data);

export const updatePart = (id, data) =>
  axiosInstance.put(`/parts/${id}`, data);

export const deletePartApi = (id) =>
  axiosInstance.delete(`/parts/${id}`);

export const getPartsByVendor = (vendorId) =>
  axiosInstance.get(`/parts/vendor/${vendorId}`);

// Authentication APIs

export const login = (data) => axiosInstance.post("/auth/login", data);

export const logout = () => axiosInstance.post("/auth/logout");


const unwrap = (response) => response.data;

// Invoice APIs
export const purchaseInvoiceApi = {
  list: () =>
    axiosInstance.get("/purchase-invoices").then(unwrap),

  create: (payload) =>
    axiosInstance.post("/purchase-invoices", payload).then(unwrap),
};

export const salesInvoiceApi = {
  list: () =>
    axiosInstance.get("/sales-invoices").then(unwrap),

  create: (payload) =>
    axiosInstance.post("/sales-invoices", payload).then(unwrap),

  email: (saleId) =>
    axiosInstance.post(`/sales-invoices/${saleId}/email`).then(unwrap),
};


export const vendorApi = {
  list: () => getVendors().then((res) => res.data),
};

// Error Helper
export const getApiErrorMessage = (error) => {
  const message = error?.response?.data?.message;

  if (message) return message;

  if (error?.response?.status === 401) {
    return "Please login again before continuing.";
  }

  if (error?.response?.status === 403) {
    return "Your account does not have permission for this action.";
  }

  return error?.message || "Something went wrong.";
};
//Financial Report

export const getFinancialReport = (filter = "monthly") =>
  axiosInstance.get(`/FinancialReport?filter=${filter}`);

export const getCustomers = () =>
  axiosInstance.get("/staff/customers");


export const searchCustomers = (query) =>
  axiosInstance.get(`/customers/search?query=${query}`);
