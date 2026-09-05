import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import newsRoutes from "./routes/newsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app = express();

// Needed to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your frontend folder
const frontendPath = path.join(__dirname, "../../frontend");

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(frontendPath));

// When visiting /
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// API routes
app.use("/api/news", newsRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/interactions", interactionRoutes);

app.use("/api/saved", savedArticleRoutes);

app.use("/api/recommendations", recommendationRoutes);

export default app;