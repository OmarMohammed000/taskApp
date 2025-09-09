import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTags(req: Request, res: Response): Promise<Response | void> {
  try{
    const tags = await db.Tags.sequelize.query(`SELECT * FROM "Tags"`, {
      type: QueryTypes.SELECT
    });
    return res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ message: "Internal server error while fetching tags" });
  }
}