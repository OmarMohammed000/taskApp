import { Response,Request } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function createTask(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
    const { title, description= null, due_date=new Date(), category= "todo", status = "pending", userId } = req.body as {
    title: string;
    description?: string;
    due_date?: Date;
    category?: string;
    status?: string;
    userId: number;
  };
  if (!title || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  let xp_value: number;
  switch(category) { 
    case "todo":{
       xp_value = 25;
       break;
    }
    case "habit":{
       xp_value = 50;
       break;
    }
    default:{
        return res.status(400).json({ message: "Invalid category value" });
    }
  }

  try{
    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE id = $1`, {
      bind:[userId],
      type: QueryTypes.SELECT
    });
    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const newTask = await db.Tasks.sequelize.query(`INSERT INTO "Tasks" (title,description,category,xp_value,status,user_id,due_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;`, {
      bind: [title, description, category, xp_value, status, userId, due_date],
      type: QueryTypes.INSERT
    });
    return res.status(201).json({ message: "Task created successfully", task: newTask[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Internal server error while creating task" });
  }
}