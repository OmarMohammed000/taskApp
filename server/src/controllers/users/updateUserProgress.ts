import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";

export default async function updateUserProgress(req: Request, res: Response): Promise<Response | void> {
  const { userId, xpGained } = req.body;
  if (!userId || !xpGained || (parseInt(xpGained) !== 25 && parseInt(xpGained) !== 50)) {
    return res.status(400).json({ message: "Missing or invalid required fields" });
  }
  const t = await db.sequelize.transaction();

  try {
    const user = await db.Users.sequelize.query(`SELECT xp, level_id FROM "Users" WHERE id = $1`, {
      bind: [userId],
      type: QueryTypes.SELECT,
      transaction: t
    });
    if (!user[0]) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const newXp = parseInt(user[0].xp) + parseInt(xpGained);

    // make coalesce to handle case where no level matches (set to highest level) it returns the first not null value
    const updated = await db.Users.sequelize.query(
      `
      UPDATE "Users"
      SET xp = $1,
          level_id = COALESCE(
            (SELECT id FROM "Levels" WHERE required_xp <= $1 ORDER BY required_xp DESC LIMIT 1),
            (SELECT id FROM "Levels" ORDER BY required_xp ASC LIMIT 1)
          )
      WHERE id = $2
      RETURNING xp, level_id
      `,
      { bind: [newXp, userId], type: QueryTypes.SELECT, transaction: t }
    );
    // fetch updated stats and calulate xp to next level using lateral join (it allows subquery to reference queries from the main query)
    const stats = await db.sequelize.query(
      `
      SELECT u.xp,
             l.level_number,
             l.required_xp,
             COALESCE(next.required_xp - u.xp, 0) as xp_to_next_level
      FROM "Users" u
      LEFT JOIN "Levels" l ON u.level_id = l.id
      LEFT JOIN LATERAL (
        SELECT required_xp FROM "Levels" WHERE required_xp > u.xp ORDER BY required_xp ASC LIMIT 1
      ) next ON true
      WHERE u.id = $1
      `,
      { bind: [userId], type: QueryTypes.SELECT, transaction: t }
    );

    await t.commit();
    return res.status(200).json({ message: "User progress updated successfully", stats: stats[0] });
  } catch {
    await t.rollback();
    console.error("Error updating user progress");
    return res.status(500).json({ message: "An error occurred while updating user progress" });
  }
}