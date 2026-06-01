import axiosInstance from "../../../shared/config/axiosInstance";

export const registerCustomer = (data) =>
  axiosInstance.post("/auth/register", data);

export const login = (data) => axiosInstance.post("/auth/login", data);
export const logout = () => axiosInstance.post("/auth/logout");
