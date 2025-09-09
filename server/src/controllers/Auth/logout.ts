import { Request, Response } from 'express';
import db from "../../models/index.js";
import crypto from "crypto";

export default async function logout(req: Request, res: Response): Promise<Response | void> {
  try{
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await db.Users.sequelize.query(`UPDATE "Users" SET refresh_token = NULL WHERE refresh_token = $1`, {
      bind: [hashedToken]
    });
  }
  res.clearCookie('refreshToken', {
   path: '/auth/refresh',
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax' as const,
  });
  return res.status(200).json({ message: "Logged out successfully" });
}
  catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ message: "An error occurred while logging out the user" });
  }
}