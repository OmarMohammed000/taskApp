import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTasksWithTags(req: Request, res: Response): Promise<Response | void> {
  const taskId = parseInt(req.params.id);
  if (!taskId) {
    return res.status(400).json({ message: "Missing required parameter: id" });
  }
  //array_agg returns an array of tag names associated with each task 
  try {
    const tasks = await db.Tasks.sequelize.query(`
      SELECT
        t.id,
        t.title,
        COALESCE(array_agg(tag.name) FILTER (WHERE tag.name IS NOT NULL), '{}'::text[]) AS tags
      FROM "Tasks" t
      LEFT JOIN "Task_tags" tt ON tt.task_id = t.id
      LEFT JOIN "Tags" tag ON tag.id = tt.tag_id
      WHERE t.id = $1
      GROUP BY t.id, t.title
    `, { bind: [taskId], type: QueryTypes.SELECT });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks with tags:", error);
    return res.status(500).json({ message: "Internal server error while fetching tasks with tags" });
  }
}