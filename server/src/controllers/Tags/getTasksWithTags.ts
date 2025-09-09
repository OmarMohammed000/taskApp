import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTasksWithTags(req: Request, res: Response): Promise<Response | void> {
  try {
    const tasks = await db.Tasks.sequelize.query(`
      SELECT t.id, t.title, array_agg(tag.name) as tags
      FROM "Tasks" t
      LEFT JOIN "Task_tags" tt ON t.id = tt.taskId
      LEFT JOIN "Tags" tag ON tt.tagId = tag.id
      GROUP BY t.id
    `, { type: QueryTypes.SELECT });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks with tags:", error);
    return res.status(500).json({ message: "Internal server error while fetching tasks with tags" });
  }
}