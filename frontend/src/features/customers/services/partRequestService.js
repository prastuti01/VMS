import axiosInstance from "../../../shared/config/axiosInstance";

export const createPartRequest = (data) =>
    axiosInstance.post("/part-requests", data);

export const getMyPartRequests = () =>
    axiosInstance.get("/part-requests/my-requests");
