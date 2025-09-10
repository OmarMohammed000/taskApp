import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import getUserById from "../controllers/users/getUserById.js";
import updateUser from "../controllers/users/updateUser.js";
import updateUserProgress from "../controllers/users/updateUserProgress.js";
import deleteUser from "../controllers/users/deleteUser.js";
import getLeaderboard from "../controllers/users/leaderboard.js";

const userRoutes = Router();

userRoutes.get("/leaderboard",  getLeaderboard);
//all routes below are protected to make sure they are logged in
userRoutes.use(isAuth);
userRoutes.get("/:id",  getUserById);
userRoutes.put("/", updateUser);
userRoutes.patch("/progress",  updateUserProgress);
userRoutes.delete("/:id",  deleteUser);

export default userRoutes;