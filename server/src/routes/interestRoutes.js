import express from "express";
import { getInterests } from "../controllers/interestController.js";

const router = express.Router();

router.get("/:userId", getInterests);

export default router;