import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import getUserById from "../controllers/users/getUserById.js";
import updateUser from "../controllers/users/updateUser.js";
import updateUserProgress from "../controllers/users/updateUserProgress.js";
import deleteUser from "../controllers/users/deleteUser.js";

const userRoutes = Router();

//all routes below are protected to make sure they are logged in
userRoutes.get("/:id", isAuth, getUserById);
userRoutes.put("/", isAuth, updateUser);
userRoutes.patch("/progress", isAuth, updateUserProgress);
userRoutes.delete("/:id", isAuth, deleteUser);

export default userRoutes;