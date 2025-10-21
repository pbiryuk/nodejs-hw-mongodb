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
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(cors());
app.use(pino());
app.use(express.json());
app.use(cookieParser());

// Роутинг
app.use('/contacts', contactsRouter);
app.use('/auth', authRouter);
app.use('/auth', passwordResetRouter); // маршрути для reset password

// Swagger UI
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerPath = path.join(__dirname, '../docs/openapi.yaml');
const swaggerDoc = YAML.load(swaggerPath);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Хендлери помилок
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
