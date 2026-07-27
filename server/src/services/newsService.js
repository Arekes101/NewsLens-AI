const axios = require("axios");
const newsConfig = require("../config/newsConfig");
const BASE_URL = "https://gnews.io/api/v4/top-headlines";

const getTopHeadlines = async (category = "general") => {
  try {
    const response = await axios.get(BASE_URL, {
     params: {
    category,
    lang: newsConfig.language,
    country: newsConfig.country,
    max: newsConfig.maxResults,
    apikey: process.env.GNEWS_API_KEY,
},
    });

    return response.data;
  } catch (error) {
    console.error("GNews Error:", error.message);
    throw new Error("Failed to fetch news");
  }
};

module.exports = {
  getTopHeadlines,
};