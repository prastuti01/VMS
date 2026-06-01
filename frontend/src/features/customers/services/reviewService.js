import axiosInstance from "../../../shared/config/axiosInstance";

export const submitReview = (data) =>
    axiosInstance.post("/reviews/submit", data);

export const getMyReviews = () =>
    axiosInstance.get("/reviews/my-reviews");

export const getRecentReviews = (limit = 10) =>
    axiosInstance.get(`/reviews/recent?limit=${limit}`);
