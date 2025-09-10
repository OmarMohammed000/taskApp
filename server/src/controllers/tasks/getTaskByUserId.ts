import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTasksByUserId(req: Request, res: Response): Promise<Response | void> {
  const userId = parseInt(req.params.id);
  if (!userId) {
    return res.status(400).json({ message: "Missing required parameter: id" });
  }
  try{
    const tasks = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE user_id = $1`, {
      bind: [userId],
      type: QueryTypes.SELECT
    });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for the given user ID" });
    }
    return res.status(200).json({ tasks });
  }catch(error){
    console.error("Error fetching tasks by user ID:", error);
    return res.status(500).json({ message: "Internal server error while fetching tasks by user ID" });
  }
}