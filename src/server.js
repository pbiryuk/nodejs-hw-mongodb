import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import Session from './models/session.js'; // імпортуємо модель Session

const app = express();

app.use(cors());
app.use(pino());
app.use(express.json());
app.use(cookieParser());

// Тимчасовий роут для очищення всіх сесій
app.get('/debug/clear-sessions', async (req, res) => {
  try {
    await Session.deleteMany({});
    res.status(200).json({ message: 'All sessions cleared' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to clear sessions', error: err.message });
  }
});

// Основні маршрути
app.use('/contacts', contactsRouter);
app.use('/auth', authRouter);

// Обробка неіснуючих маршрутів і помилок
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
