import {Request, Response} from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function removeTagFromTask(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { taskId, tagId } = req.body;
  if (!taskId || !tagId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const result = await db.Tags.sequelize.query(`DELETE FROM "Task_tags" WHERE taskId = $1 AND tagId = $2`, {
      bind: [taskId, tagId],
      type: QueryTypes.DELETE
    });
    if (result[0].rowCount === 0) {
      return res.status(404).json({ message: "Tags not found" });
    }
    return res.status(204).json({ message: "Tag removed from task successfully" });
  } catch (error) {
    console.error("Error removing tag from task:", error);
    return res.status(500).json({ message: "Internal server error while removing tag from task" });
  }
}