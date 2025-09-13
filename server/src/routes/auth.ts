import { Router } from "express";
import register from "../controllers/Auth/register.ts";
import login from "../controllers/Auth/login.ts";
import refreshToken from "../controllers/Auth/refershtoken.ts";
import logout from "../controllers/Auth/logout.ts";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh",refreshToken);
authRoutes.post("/logout",logout);

export default authRoutes;
