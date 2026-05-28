import path from 'path';
import dotenv from 'dotenv';

// Try loading from root (.env) if running via workspaces, otherwise fallback to local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // Also load from current directory just in case

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import ticketRoutes from './routes/ticketRoutes';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Attempt DB connection
  connectDB();

  // API Routes
  app.use('/api/tickets', ticketRoutes);

  // Do not serve the Vite frontend in development. The frontend should run separately.
  app.get('/', (req, res) => {
    res.send('API Backend is running. Frontend is deployed separately.');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
