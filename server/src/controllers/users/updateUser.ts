import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import isSafe from "../../utils/isSafe.js";

export default async function updateUser(req:Request,res:Response):Promise<Response|void>{
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const userId = (req as any).user?.userId;
  const { name, email, isAdmin, changeID } = req.body;

  if (!userId || (!name && !email  )) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // this checks if there is an admin trying to change another user's status
  if(isAdmin && !changeID ){
    return res.status(400).json({ message: "Missing changeID for admin update" });
  }
  if(isSafe([String(userId), name ?? "", email ?? ""]) === false) {
    return res.status(400).json({ message: "Input contains unsafe characters" });
  }
  try{
    const currentUser = await db.Users.sequelize.query(`SELECT * FROM "Users" WHERE id = $1`, {
      bind:[userId],
      type: QueryTypes.SELECT
    });
    if (!currentUser[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const targetId = changeID ?? userId;

    // only admins can update other users
    if (String(targetId) !== String(userId)) {
      if (!currentUser[0].isAdmin) {
        return res.status(403).json({ message: "Only admins can update other users" });
      }
    }

    // check email uniqueness against the target user
    if (email) {
      const emailExists = await db.Users.sequelize.query(
        `SELECT email FROM "Users" WHERE email = $1 AND id != $2`,
        { bind: [email, targetId], type: QueryTypes.SELECT }
      );
      if (emailExists[0]) return res.status(409).json({ message: "Email already in use" });
    }

    // build updates
    const updates: string[] = [];
    const bindings: any[] = [];
    let paramCount = 1;

    if (name) { updates.push(`name = $${paramCount}`); bindings.push(name); paramCount++; }
    if (email) { updates.push(`email = $${paramCount}`); bindings.push(email); paramCount++; }

    // only admins can change isAdmin
    if (typeof isAdmin !== "undefined") {
      if (!currentUser[0].isAdmin) return res.status(403).json({ message: "Only admins can change admin status" });
      updates.push(`"isAdmin" = $${paramCount}`); bindings.push(isAdmin); paramCount++;
    }

    if (updates.length === 0) return res.status(400).json({ message: "No fields to update" });

    // finally bind the target id for WHERE
    bindings.push(targetId);
    const updateQuery = `
      UPDATE "Users"
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, name, email
    `;

    const updatedUser = await db.Users.sequelize.query(updateQuery, {
      bind: bindings,
      type: QueryTypes.UPDATE
    });

    return res.status(201).json(updatedUser[0]);
  }catch(error){
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error while updating user" });
  }


}