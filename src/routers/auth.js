import express from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  register,
  login,
  refreshSession,
  logout,
} from '../controllers/auth.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

const router = express.Router();

// Регістрація користувача
router.post('/register', validateBody(registerSchema), ctrlWrapper(register));

// Логін користувача
router.post('/login', validateBody(loginSchema), ctrlWrapper(login));

// Оновлення сесії через refresh токен
router.post('/refresh', ctrlWrapper(refreshSession));

// Логаут користувача
router.post('/logout', ctrlWrapper(logout));

export default router;
