import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(pino());
app.use(express.json());
app.use(cookieParser());

app.use('/contacts', contactsRouter);
app.use('/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
