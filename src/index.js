import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const startApp = async () => {
  await initMongoConnection();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
};

startApp();
