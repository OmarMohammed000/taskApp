import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function addTagToTask(req: Request, res: Response): Promise<Response | void> {
  const { taskId, tagId } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  if (!taskId || !tagId) {
    return res.status(400).json({ message: "Task ID and Tag ID are required" });
  }

  const taskIdNum = parseInt(taskId);
  const tagIdNum = parseInt(tagId);

  if (isNaN(taskIdNum) || isNaN(tagIdNum)) {
    return res.status(400).json({ message: "Invalid Task ID or Tag ID" });
  }

  try {
    // Check if task exists
    const task = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE id = $1`, {
      bind: [taskIdNum],
      type: QueryTypes.SELECT
    });
    
    if (!task[0]) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if tag exists
    const tag = await db.Tags.sequelize.query(`SELECT * FROM "Tags" WHERE id = $1`, {
      bind: [tagIdNum],
      type: QueryTypes.SELECT
    });
    
    if (!tag[0]) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if the tag is already assigned to the task
    const existingRelation = await db.Tags.sequelize.query(
      `SELECT * FROM "Task_tags" WHERE task_id = $1 AND tag_id = $2`,
      {
        bind: [taskIdNum, tagIdNum],
        type: QueryTypes.SELECT
      }
    );

    if (existingRelation.length > 0) {
      return res.status(409).json({ message: "Tag is already assigned to this task" });
    }

    // Insert the new tag-task relationship
    await db.Tags.sequelize.query(`INSERT INTO "Task_tags" (task_id, tag_id) VALUES ($1, $2)`, {
      bind: [taskIdNum, tagIdNum],
      type: QueryTypes.INSERT
    });

    return res.status(201).json({ message: "Tag added to task successfully" });
  } catch (error) {
    console.error("Error adding tag to task:", error);
    return res.status(500).json({ message: "Internal server error while adding tag to task" });
  }
}