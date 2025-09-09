import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function createTag(req: Request, res: Response): Promise<Response | void> {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingTag = await db.Tags.sequelize.query(`SELECT * FROM "Tags" WHERE name = $1`, {
      bind: [name],
      type: QueryTypes.SELECT
    });

    if (existingTag[0]) {
      return res.status(409).json({ message: "Tag already exists" });
    }

    const newTag = await db.Tags.sequelize.query(`INSERT INTO "Tags" (name) VALUES ($1) RETURNING *;`, {
      bind: [name],
      type: QueryTypes.INSERT
    });
    return res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    return res.status(500).json({ message: "Internal server error while creating tag" });
  }
}