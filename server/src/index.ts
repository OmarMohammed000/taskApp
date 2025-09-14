import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cookieParser from 'cookie-parser';
import taskRoutes from './routes/tasks.js';
import tagRoutes from './routes/tags.js';


dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error")); 
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    socket.data.userId = (decoded as { userId: number }).userId;
    socket.join(`user_${socket.data.userId}`);
    socket.join("leaderboard");
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks',taskRoutes);
app.use('/tags', tagRoutes);  

// 404 catch-all route for unmatched API requests
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});



const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
