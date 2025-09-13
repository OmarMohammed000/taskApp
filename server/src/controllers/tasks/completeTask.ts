import { Request, Response } from "express";
import db from "../../models/index.js";
import { QueryTypes } from "sequelize";
import { io } from "../../index.js";
import { stat } from "fs";
import { emitUserUpdate, emitLeaderboardUpdate } from "../../routes/socket.js";
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
    const currentlyCompleted = task.status === "completed";
    const newStatus = currentlyCompleted ? "pending" : "completed";
    const xpAward = task.xp_value ? Number(task.xp_value) : (task.category === "habit" ? 50 : 25);
    const xpChange = currentlyCompleted ? -xpAward : xpAward;
    const updatedTaskRows = await db.Tasks.sequelize.query(`UPDATE "Tasks" SET status = $1 WHERE id = $2 RETURNING *`, {
      bind: [newStatus, taskId],
      type: QueryTypes.UPDATE,
      transaction: t
    });
    const updatedTask = updatedTaskRows[0];
    if (!updatedTask) {
      await t.rollback();
      return res.status(500).json({ message: "Failed to update task status" });
    }
    const updatedUserRows = await db.Users.sequelize.query(
      `
      UPDATE "Users"
      SET xp =GREATEST(xp + $1, 0),
          level_id = COALESCE(
            (SELECT id FROM "Levels" WHERE required_xp <= xp + $1 ORDER BY required_xp DESC LIMIT 1),
            (SELECT id FROM "Levels" ORDER BY required_xp ASC LIMIT 1)
          )
      WHERE id = $2
      RETURNING id, name, xp, level_id
      `,
      { bind: [xpChange, task.user_id], type: QueryTypes.SELECT, transaction: t }
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
        xpAward: xpChange,
        newXp: updatedUser.xp,
        levelNumber: userStats.level_number,
        xpToNextLevel: userStats.xp_to_next_level,
        stats: newStatus
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
    }try{
      emitUserUpdate(task.user_id, userStats);
      await emitLeaderboardUpdate();
    }catch(socketErr){
      console.error("Socket emission error:", socketErr);
    }
   return res.status(200).json({
      message:  currentlyCompleted ? "Task reverted to pending and XP removed" : "Task completed successfully",
      xpAward: xpChange,
      userStats
    });
  } catch (error) {
    await t.rollback();
    console.error("Error completing task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}