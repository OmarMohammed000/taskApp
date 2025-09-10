import express from 'express';
import dotenv from 'dotenv';
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
const PORT = process.env.PORT || 3000;

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks',taskRoutes);
app.use('/tags', tagRoutes);  




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
