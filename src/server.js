import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import passwordResetRouter from './routers/passwordReset.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(cors());
app.use(pino());
app.use(express.json());
app.use(cookieParser());

// Роутинг
app.use('/contacts', contactsRouter);
app.use('/auth', authRouter);
app.use('/auth', passwordResetRouter); // маршрути для reset password

// Swagger UI з JSON
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerJsonPath = path.join(__dirname, '../docs/swagger.json');

// Перевірка, чи файл існує
let swaggerDoc = {};
if (fs.existsSync(swaggerJsonPath)) {
  swaggerDoc = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf8'));
} else {
  console.warn(
    '⚠️ Swagger JSON не знайдено. Виконай "npm run build-docs" перед запуском.',
  );
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Хендлери помилок
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
