import axios from "axios";
import { newsConfig } from "../config/newsConfig.js";

export const fetchNews = async (category) => {
  try {
    const params = {
      apikey: process.env.NEWSDATA_API_KEY,
      language: newsConfig.language,
      country: newsConfig.country,
      size: newsConfig.size,
    };

    if (category) {
      params.category = category;
    }

    const response = await axios.get(
      "https://newsdata.io/api/1/latest",
      { params }
    );

    return response.data.results;
  } catch (error) {
    console.log("NewsData Error:");
    console.log(error.response?.data);
    throw error;
  }
};