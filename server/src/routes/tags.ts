import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import getTags from "../controllers/Tags/getTags.js";
import addTagToTask from "../controllers/Tags/addTagToTask.js";
import getTasksWithTags from "../controllers/Tags/getTasksWithTags.js";
import removeTagFromTask from "../controllers/Tags/removeTagFromTask.js";
import createTag from "../controllers/Tags/createTag.js";
import deleteTag from "../controllers/Tags/deleteTag.js";
import updateTag from "../controllers/Tags/updateTag.js";

const tagRoutes = Router();

//all routes below are protected to make sure they are logged in
tagRoutes.use(isAuth);
tagRoutes.get("/:id", getTags);
tagRoutes.post("/", createTag);
tagRoutes.post("/add", addTagToTask);
tagRoutes.patch("/:id", updateTag);
tagRoutes.get("/tasks/:id", getTasksWithTags);
tagRoutes.delete("/remove", removeTagFromTask);
tagRoutes.delete("/:id", deleteTag);

export default tagRoutes; 