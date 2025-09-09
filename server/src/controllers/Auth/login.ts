import { Request, Response } from 'express';
import db from "../../models/index.js";
import bcrypt from "bcryptjs";
import { QueryTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';


export default async function login(req: Request, res: Response): Promise<Response | void> {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE email = $1`, {
      bind: [email], type: QueryTypes.SELECT
    });
    if (!user[0]) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user[0].id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
    const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await db.Users.sequelize.query(`UPDATE "Users" SET refresh_token = $1 WHERE id = $2`, {
      bind: [refreshHash, user[0].id], type: QueryTypes.UPDATE
    });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "An error occurred while logging in the user" });
  }
}