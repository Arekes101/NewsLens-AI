import express from "express";
import cors from "cors";
import newsRoutes from "./routes/newsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);

export default app;