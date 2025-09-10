import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import isSafe from "../../utils/isSafe.js";
import completeTask from "./completeTask.js";

export default async function updateTask(req: Request, res: Response): Promise<Response | void> {
  const taskId = req.params.id ? parseInt(req.params.id) : NaN;
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { title, description, due_date, category, status } = req.body;
  if ((!title && !description && !due_date && !category && !status) || (title === "" || description === "" || due_date === "" || category === "" || status === "")) {
    return res.status(400).json({ message: "At least one valid field (non-empty) must be provided to update" });
  }
  if (isSafe([title, description ?? "", category, status]) === false) {
    return res.status(400).json({ message: "Input contains unsafe characters" });
  }
  try {
    const task = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE id = $1`, {
      bind: [taskId],
      type: QueryTypes.SELECT
    });
    if (!task[0]) {
      return res.status(404).json({ message: "Task not found" });
    }
    const isCompletingTask = status === "completed" && task[0].status !== "completed";
    const updates: string[] = [];
    const bindings: any[] = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount++}`);
      bindings.push(title);
    }
    if (description) {
      updates.push(`description = $${paramCount++}`);
      bindings.push(description);
    }
    if (due_date) {
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) return res.status(400).json({ message: "Invalid due_date" });
      const today = new Date(); today.setHours(0, 0, 0, 0); parsed.setHours(0, 0, 0, 0);
      if (parsed < today) return res.status(400).json({ message: "due_date cannot be before today" });

      updates.push(`due_date = $${paramCount++}`);
      bindings.push(parsed.toISOString()); // push normalized date
    }
    let xp_value: number;
    if (category) {
      if (category !== "todo" && category !== "habit") {
        return res.status(400).json({ message: "Invalid category value" });
      }
      switch (category) {
        case "todo": {
          xp_value = 25;
          break;
        }
        case "habit": {
          xp_value = 50;
          break;
        }
      }
      updates.push(`category = $${paramCount++}`);
      updates.push(`xp_value = $${paramCount++}`);
      bindings.push(category, xp_value);
    }
    if (status) {
      if (status !== "pending" && status !== "in_progress" && status !== "completed") {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updates.push(`status = $${paramCount++}`);
      bindings.push(status);
    }

    const updateQuery = `UPDATE "Tasks" SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *;`;
    const updatedTask = await db.Tasks.sequelize.query(updateQuery, {
      bind: [...bindings, taskId],
      type: QueryTypes.UPDATE
    });
    if (isCompletingTask) {
      
      return completeTask(req, res);
    }
    return res.status(200).json({ message: "Task updated successfully", task: updatedTask[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Internal server error while updating task" });
  }
}