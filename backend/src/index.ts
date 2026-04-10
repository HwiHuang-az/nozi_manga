import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

import mangaRoutes from './routes/mangaRoutes';

// Basic Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Nozi Manga Backend is running' });
});

// API Routes
app.use('/api/mangas', mangaRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
