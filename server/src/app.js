import express from "express";
import cors from "cors";
import newsRoutes from "./routes/newsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/saved", savedArticleRoutes);
export default app;