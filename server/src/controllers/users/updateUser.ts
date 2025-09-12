import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import isSafe from "../../utils/isSafe.js";

export default async function updateUser(req:Request,res:Response):Promise<Response|void>{
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const userId = (req as any).user?.userId;
  const { name, email} = req.body;
  if (!userId || (!name && !email)) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if(isSafe([String(userId), name ?? "", email ?? ""]) === false) {
    return res.status(400).json({ message: "Input contains unsafe characters" });
  }
  try{
    const user = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE id = $1`, {
      bind:[userId],
      type: QueryTypes.SELECT
    });
    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    if(email){
      const emailExists = await db.Users.sequelize.query(`SELECT email FROM "Users" WHERE email = $1 AND id != $2`, {
        bind:[email,userId],
        type: QueryTypes.SELECT
      });
      if (emailExists[0]) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const bindings: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      bindings.push(name);
      paramCount++;
    }

    if (email) {
      updates.push(`email = $${paramCount}`);
      bindings.push(email);
      paramCount++;
    }

    // Add userId as the last binding
    bindings.push(userId);

    const updateQuery = `
      UPDATE "Users" 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name, email
    `;

    const updatedUser = await db.Users.sequelize.query(updateQuery, {
      bind: bindings,
      type: QueryTypes.UPDATE
    });

    return res.status(200).json(updatedUser[0]);
  }catch(error){
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error while updating user" });
  }


}