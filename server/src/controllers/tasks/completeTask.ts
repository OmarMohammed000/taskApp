import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import { io } from "../../index.js";
export default async function completeTask(req: Request, res: Response): Promise<Response | void> {
  const taskId = req.params.id ? parseInt(req.params.id) : NaN;
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  // getting id from auth middleware to ensure user is completing their own task
  const userId = (req as any).user?.userId;
  const t = await db.sequelize.transaction();
  try {
    const taskRows = await db.Tasks.sequelize.query(`SELECT * FROM "Tasks" WHERE id = $1 AND user_id = $2`, {
      bind: [taskId, userId],
      type: QueryTypes.SELECT,
      transaction: t
    });
    const task = taskRows[0];
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.status === 'completed') {
      await t.rollback();
      return res.status(200).json({ message: "Task is already completed" });
    }
    const xpAward = task.xp_value ? Number(task.xp_value) : (task.category === "habit" ? 50 : 25);

    await db.Tasks.sequelize.query(`UPDATE "Tasks" SET status = 'completed' WHERE id = $1 RETURNING *`, {
      bind: [taskId],
      type: QueryTypes.UPDATE,
      transaction: t
    });
    const updatedUserRows = await db.Users.sequelize.query(
      `
      UPDATE "Users"
      SET xp = xp + $1,
          level_id = COALESCE(
            (SELECT id FROM "Levels" WHERE required_xp <= xp + $1 ORDER BY required_xp DESC LIMIT 1),
            (SELECT id FROM "Levels" ORDER BY required_xp ASC LIMIT 1)
          )
      WHERE id = $2
      RETURNING id, name, xp, level_id
      `,
      { bind: [xpAward, task.user_id], type: QueryTypes.SELECT, transaction: t }
    );
    const updatedUser = updatedUserRows[0];
    if (!updatedUser) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }
    const userStatsRows = await db.Users.sequelize.query(
      `
      SELECT 
        u.xp,
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
      { bind: [task.user_id], type: QueryTypes.SELECT, transaction: t }
    );
    
    const userStats = userStatsRows[0];
    await t.commit();
     try {
      // Personal update to the user
      io.to(`user:${updatedUser.id}`).emit("user:taskCompleted", {
        taskId: task.id,
        title: task.title,
        xpAwarded: xpAward,
        newXp: updatedUser.xp,
        levelNumber: userStats.level_number,
        xpToNextLevel: userStats.xp_to_next_level
      });
      
      // Query and update leaderboard
      const leaderboardRows = await db.Users.sequelize.query(
        `
        SELECT id AS user_id, name, xp, 
               (SELECT level_number FROM "Levels" WHERE id = level_id) AS level
        FROM "Users"
        ORDER BY xp DESC
        LIMIT 10
        `,
        { type: QueryTypes.SELECT }
      );
      
      io.to("leaderboard").emit("leaderboard:updated", {
        rankings: leaderboardRows,
        updatedUserId: updatedUser.id
      });
    } catch (socketError) {
      // Log but don't fail the request if socket emissions fail
      console.error("Socket emission error:", socketError);
    }
   return res.status(200).json({
      message: "Task completed successfully",
      xpAwarded: xpAward,
      userStats
    });
  } catch (error) {
    await t.rollback();
    console.error("Error completing task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}