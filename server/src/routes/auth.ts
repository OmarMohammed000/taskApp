import { Router } from "express";
import register from "../controllers/Auth/register.js";
import login from "../controllers/Auth/login.js";
import refreshToken from "../controllers/Auth/refershtoken.js";
import logout from "../controllers/Auth/logout.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh",refreshToken);
authRoutes.post("/logout",logout);

export default authRoutes;
