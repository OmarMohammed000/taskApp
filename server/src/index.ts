import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use('/auth', authRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
