import { Request,Response,  } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getUserById(req: Request, res: Response): Promise<Response | void> {
 const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // ambiguous column name error happened because both tables have id columns so we need to prefix them with table alias
    const user = await db.Users.sequelize.query(`SELECT u.id, u.name, email, xp, u."isAdmin", level_id, l.level_number FROM "Users" u LEFT JOIN "Levels" l ON u.level_id = l.id WHERE u.id = $1`, {
      bind:[userId], type: QueryTypes.SELECT
    }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error while fetching user" });
  }
}