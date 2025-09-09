import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function deleteUser(req: Request, res: Response): Promise<Response | void> {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try{
    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE id = $1`, {
      bind:[userId],
      type: QueryTypes.SELECT
    });
    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    await db.Users.sequelize.query(`DELETE FROM "Users" WHERE id = $1`, {
      bind: [userId],
      type: QueryTypes.DELETE
    });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "An error occurred while deleting the user" });
  }
}