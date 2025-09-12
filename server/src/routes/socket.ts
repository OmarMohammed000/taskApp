import { Server } from "socket.io";
import { io } from "../index.js";
import { getLeaderboardData } from "../controllers/users/leaderboard.js";

export const emitUserUpdate = (userId: number, data: any) => {
  io.to(`user_${userId}`).emit("userProgress", data);
}
export const emitLeaderboardUpdate = async () => {
  const leaderboard = await getLeaderboardData();
  io.to("leaderboard").emit("leaderboardUpdate", leaderboard);
}