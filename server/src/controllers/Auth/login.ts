import { Request, Response } from 'express';
import db from "../../models/index.js";
import bcrypt from "bcryptjs";
import { QueryTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

const JWT_SECRET:string = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET:string = process.env.JWT_REFRESH_SECRET as string;

export default async function login(req: Request, res: Response): Promise<Response | void> {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await db.Users.sequelize.query(`SELECT * FROM "users" WHERE email = $1`, {
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

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "An error occurred while logging in the user" });
  }
}