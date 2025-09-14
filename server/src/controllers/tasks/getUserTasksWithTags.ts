import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getUserTasksWithTags(req: Request, res: Response): Promise<Response | void> {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const tasksWithTags = await db.Tasks.sequelize.query(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.created_at,
        t.xp_value,
        t.user_id,
        COALESCE(
          json_agg(
            json_build_object('id', tag.id, 'name', tag.name)
          ) FILTER (WHERE tag.id IS NOT NULL), 
          '[]'::json
        ) AS tags
      FROM "Tasks" t
      LEFT JOIN "Task_tags" tt ON tt.task_id = t.id
      LEFT JOIN "Tags" tag ON tag.id = tt.tag_id
      WHERE t.user_id = $1
      GROUP BY t.id, t.title, t.description, t.priority, t.status, t.category, t.due_date, t.created_at, t.xp_value, t.user_id
      ORDER BY t.created_at DESC
    `, { 
      bind: [userId], 
      type: QueryTypes.SELECT 
    });

    return res.status(200).json(tasksWithTags);
  } catch (error) {
    console.error("Error fetching user tasks with tags:", error);
    return res.status(500).json({ message: "Internal server error while fetching user tasks with tags" });
  }
}