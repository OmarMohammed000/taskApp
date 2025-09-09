import { Request,Response,  } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getUserById(req: Request, res: Response): Promise<Response | void> {
  const userId = req.params.id ? parseInt(req.params.id) : NaN;
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await db.Users.sequelize.query(`SELECT id, name, email, xp, level_id FROM "Users" WHERE id = $1`, {
      bind:[userId], type: QueryTypes.SELECT
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}