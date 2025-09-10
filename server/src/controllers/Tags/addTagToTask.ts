import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import isSafe from "../../utils/isSafe.js";

export default async function addTagToTask(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { taskId, tagId } = req.body;
  if (!taskId || !tagId) {
    return res.status(400).json({ message: "Missing required fields"});
  }
  if (!isSafe([String(taskId), String(tagId)])) {
    return res.status(400).json({ message: "Input contains unsafe characters" });
  }
  try {
    // Check if task exists
    const task = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE id = $1`, {
      bind: [taskId],
      type: QueryTypes.SELECT
    });
    if (!task[0]) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Check if tag exists
    const tag = await db.Tags.sequelize.query(`SELECT * FROM "Tags" WHERE id = $1`, {
      bind: [tagId],
      type: QueryTypes.SELECT
    });
    if (!tag[0]) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await db.Tags.sequelize.query(`INSERT INTO "Task_tags" (task_id, tag_id) VALUES ($1, $2)`, {
      bind: [taskId, tagId],
      type: QueryTypes.INSERT
    });
    return res.status(201).json({ message: "Tag added to task successfully" });
  } catch (error) {
    console.error("Error adding tag to task:", error);
    return res.status(500).json({ message: "Internal server error while adding tag to task" });
  }
}