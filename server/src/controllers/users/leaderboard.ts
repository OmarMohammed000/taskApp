import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getLeaderboard(req: Request, res: Response): Promise<Response | void> {
  try {
   
    const limit = Math.min(
      Number(req.query.limit) || 10,  
      10                            
    );
    
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
        bind: [limit],
        type: QueryTypes.SELECT
      }
    );
 
    return res.status(200).json({
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}