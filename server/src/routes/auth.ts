import { Router } from "express";
import register from "../controllers/Auth/register.js";
import login from "../controllers/Auth/login.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;
