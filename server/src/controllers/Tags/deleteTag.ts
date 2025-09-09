import { Request,Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function deleteTag(req: Request, res: Response): Promise<Response | void> {
  const tagId = parseInt(req.params.id);
  if (isNaN(tagId)) {
    return res.status(400).json({ message: "Invalid tag ID" });
  }
  try{
    const tag = await db.Tags.sequelize.query(`SELECT * FROM "Tags" WHERE id = $1`, {
      bind:[tagId],
      type: QueryTypes.SELECT
    });
    if (!tag[0]) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await db.Tags.sequelize.query(`DELETE FROM "Tags" WHERE id = $1`, {
      bind: [tagId],
      type: QueryTypes.DELETE
    });
    return res.status(204).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return res.status(500).json({ message: "Internal server error while deleting tag" });
  }
}