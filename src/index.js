import app from './server.js';
import dotenv from 'dotenv';
import { initMongoConnection } from './db/initMongoConnection.js';

dotenv.config();

const startApp = async () => {
  await initMongoConnection();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
};

startApp();
