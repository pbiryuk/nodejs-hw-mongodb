import dotenv from 'dotenv';
import app from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);

const startApp = async () => {
  await initMongoConnection();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
};

startApp();
