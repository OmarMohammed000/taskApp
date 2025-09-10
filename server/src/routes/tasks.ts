import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import getTaskById from "../controllers/tasks/getTaskById.js";
import createTask from "../controllers/tasks/createTask.js";
import updateTask from "../controllers/tasks/updateTask.js";
import deleteTask from "../controllers/tasks/deleteTask.js";
import getTasksByUserId from "../controllers/tasks/getTaskByUserId.js";
import completeTask from "../controllers/tasks/completeTask.js";

const taskRoutes = Router();

//all routes below are protected to make sure they are logged in
taskRoutes.use(isAuth);
taskRoutes.get("/:id", getTaskById);
taskRoutes.get("/user/:id", getTasksByUserId);
taskRoutes.post("/", createTask);
taskRoutes.patch("/:id", updateTask);
taskRoutes.delete("/:id", deleteTask);
taskRoutes.patch("/:id/complete", completeTask);
export default taskRoutes;