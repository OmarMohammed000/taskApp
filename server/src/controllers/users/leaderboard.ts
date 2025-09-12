import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

// Function to get leaderboard data (no req/res parameters)
export const getLeaderboardData = async (limit: number = 10) => {
  const leaderboard = await db.sequelize.query(
    `
    SELECT 
      u.id,
      u.name,
      u.xp,
      l.level_number,
      ROW_NUMBER() OVER (ORDER BY u.xp DESC) as rank
    FROM "Users" u
    LEFT JOIN "Levels" l ON u.level_id = l.id
    ORDER BY u.xp DESC
    LIMIT $1 
    `,
    {
      bind: [Math.min(limit, 10)],
      type: QueryTypes.SELECT
    }
  );
  
  return leaderboard;
};

// Express route handler
export const getLeaderboard = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 10);
    const leaderboard = await getLeaderboardData(limit);
    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default getLeaderboard;