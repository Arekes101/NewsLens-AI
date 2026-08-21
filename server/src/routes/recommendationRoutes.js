import express from "express";

import {
  getCandidates,
  getPersonalizedRecommendations
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/candidates/:userId", getCandidates);

router.get(
  "/personalized/:userId",
  getPersonalizedRecommendations
);

export default router;