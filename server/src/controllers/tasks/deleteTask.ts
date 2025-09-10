import {Request, Response} from 'express';
import db from '../../models/index.js';
import { QueryTypes } from 'sequelize';

export default async function deleteTask(req: Request, res: Response): Promise<Response | void> {
  const taskId = parseInt(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  try {
    const result = await db.Tasks.sequelize.query(`DELETE FROM "Tasks" WHERE id = $1 RETURNING *`, {
      bind: [taskId],
      type: QueryTypes.DELETE
    });
    if (!result[0]) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Internal server error while deleting task" });
  }
}