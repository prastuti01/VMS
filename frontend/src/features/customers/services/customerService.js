import axiosInstance from "../../../shared/config/axiosInstance";

export const getProfile    = ()         => axiosInstance.get("/customers/profile");
export const updateProfile = (data)     => axiosInstance.put("/customers/profile", data);
export const addVehicle    = (data)     => axiosInstance.post("/customers/vehicles", data);
export const updateVehicle = (id, data) => axiosInstance.put(`/customers/vehicles/${id}`, data);
export const deleteVehicle = (id)       => axiosInstance.delete(`/customers/vehicles/${id}`);
export const deleteAccount = ()         => axiosInstance.delete("/customers/profile");
export const getCustomerHistory = async () => {
  return await axiosInstance.get("/customer-history/me");
};

export const getCustomerHistoryById = async (customerId) => {
  return await axiosInstance.get(
    `/customer-history/${customerId}`
  );
};