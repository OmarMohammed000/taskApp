import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function getTasksWithTags(req: Request, res: Response): Promise<Response | void> {
  if(!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const tagId = parseInt(req.params.id);
  if (!tagId) {
    return res.status(400).json({ message: "Missing required parameter: id" });
  }
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Missing required field: name" });
  }
  try {
   const tag = await db.Tags.sequelize.query(`UPDATE "Tags" SET name=$1 WHERE id= $2 RETURNING name`, {
    bind:[name,tagId], type: QueryTypes.UPDATE
   }) 
   if(tag[0].length === 0) {
    return res.status(404).json({ message: "Tag not found" });
   }
   res.status(200).json({ message: "Tag updated successfully", tag: tag[0][0] });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while updating tag" });
  }
}