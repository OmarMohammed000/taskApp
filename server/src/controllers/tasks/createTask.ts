import { Response,Request } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function createTask(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { title, description,due_date,category,status, userId } = req.body;
  if (!title || !description || !due_date || !category || !status || !userId) {
    return res.status(400).json({ message: "Missing required fields: " + 
      [!title && "title", !description && "description", !due_date && "due_date", !category && "category", !status && "status", !userId && "userId"]
        .filter(Boolean)
        .join(", ") });
  }
  try{
    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE id = $1`, {
      bind:[userId],
      type: QueryTypes.SELECT
    });
    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const newTask = await db.Tasks.sequelize.query(`INSERT INTO "Tasks" (title,description,category,status,user_id,due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`, {
      bind: [title, description, category, status, userId, due_date],
      type: QueryTypes.INSERT
    });
    return res.status(201).json({ message: "Task created successfully", task: newTask[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Internal server error while creating task" });
  }
}