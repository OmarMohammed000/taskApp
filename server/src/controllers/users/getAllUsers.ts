import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getAllUsers(req: Request, res: Response): Promise<Response | void> {
  try{
    const users = await db.Users.sequelize.query(`SELECT u.id, u.name, email, xp, u."isAdmin",l.level_number FROM "Users" u LEFT JOIN "Levels" l ON u.level_id = l.id`, {
      type: QueryTypes.SELECT
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error while fetching users" });
  }
}