import { getCandidateArticles } from "../services/recommendationService.js";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export const getPersonalizedRecommendations = (req, res) => {
  const { userId } = req.params;
  const offset = req.query.offset || "0";
  const limit = req.query.limit || "10";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const scriptPath = path.join(
    __dirname,
    "../../../ml/recommend_api.py"
  );

  const pythonPath = path.join(
    __dirname,
    "../../../ml/venv/Scripts/python.exe"
  );

  execFile(
    pythonPath,
    [scriptPath, userId, String(offset), String(limit)],
    (error, stdout, stderr) => {
      if (error) {
        console.error("Recommendation error:", error);
        console.error("Python stderr:", stderr);

        return res.status(500).json({
          success: false,
          message: "Failed to generate recommendations",
        });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error("Python output:", stdout);

        return res.status(500).json({
          success: false,
          message: "Invalid recommendation response",
        });
      }
    }
  );
};

export const getCandidates = async (req, res) => {
  try {
    const { userId } = req.params;

    const candidates = await getCandidateArticles(userId);

    res.json({
      success: true,
      userId,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Candidate generation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate candidate articles",
    });
  }
};