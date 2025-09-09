import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import crypto from "crypto";

export default async function refreshToken(req: Request, res: Response): Promise<Response | void> {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    //check if token is valid
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };

    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE
      id=$1 AND refresh_token = $2`, {
      bind: [decoded.userId, hashedToken]
    });
    if (!user || user.length === 0) {
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    // rotate token
    const newAccessRefreshToken = jwt.sign({ userId: user[0].id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
    const newAccessToken = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    const newAccessRefreshHash = crypto.createHash("sha256").update(newAccessRefreshToken).digest("hex");

    await db.Users.sequelize.query(`UPDATE "Users" SET refresh_token = $1 WHERE id = $2`, {
      bind: [newAccessRefreshHash, user[0].id]
    });
    res.cookie('refreshToken', newAccessRefreshToken, {
      httpOnly: true,
      path: '/auth/refresh',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({ newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.clearCookie('refreshToken');
    return res.status(500).json({ message: "An error occurred while refreshing the token" });
  }

}