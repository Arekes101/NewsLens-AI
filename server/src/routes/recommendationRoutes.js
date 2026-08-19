import express from "express";
import { getCandidates } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/candidates/:userId", getCandidates);

export default router;