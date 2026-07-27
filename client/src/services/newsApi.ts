import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

export const getNews = async (category = "general") => {
    const response = await API.get(`/news?category=${category}`);
    return response.data;
};