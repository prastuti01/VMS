import axiosInstance from "../../../shared/config/axiosInstance";

export const bookAppointment = (data) =>
    axiosInstance.post("/appointments/book", data);

export const getMyAppointments = () =>
    axiosInstance.get("/appointments/my-appointments");