import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTaskById(req: Request, res: Response): Promise<Response | void> {
  const taskId = req.params.id ? parseInt(req.params.id) : NaN;
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  try{
    const task = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE id = $1`, {
      bind:[taskId],
      type: QueryTypes.SELECT
    });
    if (!task[0]) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}