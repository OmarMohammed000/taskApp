import { Request, Response } from 'express';
import db from "../../models/index.js";
import bcrypt from "bcryptjs";
import { QueryTypes } from 'sequelize';


export default async function register(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await db.Users.sequelize.query(`SELECT email FROM "Users" WHERE email = $1`, {
      bind: [email], type: QueryTypes.SELECT
    });
    if (existingUser && existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 10);

    const user = await db.Users.sequelize.query(`INSERT INTO "Users" (name,email,password_hash) VALUES ($1,$2,$3) ;`, {
      bind: [name, email, hashedPassword], type: QueryTypes.INSERT
    });

    return res.status(201).json({ message: "User registered successfully"  });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "An error occurred while registering the user" });
  }

}