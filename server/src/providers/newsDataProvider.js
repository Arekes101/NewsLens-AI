import axios from "axios";
import { newsConfig } from "../config/newsConfig.js";

const BASE_URL = "https://newsdata.io/api/1/latest";

export const fetchNews = async ({
  q = "",
  category = "",
  country = newsConfig.country,
  language = newsConfig.language,
} = {}) => {
  try {
    const params = {
      apikey: process.env.NEWSDATA_API_KEY,
      language,
      country,
      size: newsConfig.size,
    };

    if (q) params.q = q;
    if (category) params.category = category;

    const response = await axios.get(BASE_URL, { params });

    return response.data.results || [];
  } catch (error) {
    console.log("NewsData Error:");
    console.log(error.response?.data);
    throw error;
  }
};