import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function addTagToTask(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { taskId, tagId } = req.body;
  if (!taskId || !tagId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    await db.Tags.sequelize.query(`INSERT INTO "Task_tags" (taskId, tagId) VALUES ($1, $2)`, {
      bind: [taskId, tagId],
      type: QueryTypes.INSERT
    });
    return res.status(201).json({ message: "Tag added to task successfully" });
  } catch (error) {
    console.error("Error adding tag to task:", error);
    return res.status(500).json({ message: "Internal server error while adding tag to task" });
  }
}