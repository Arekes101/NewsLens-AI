import "dotenv/config";
import app from "./app.js";
console.log("Gemini Key:", process.env.GEMINI_API_KEY);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});