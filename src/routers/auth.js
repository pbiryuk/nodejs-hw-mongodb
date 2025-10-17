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

router.post('/register', validateBody(registerSchema), ctrlWrapper(register));
router.post('/login', validateBody(loginSchema), ctrlWrapper(login));
router.post('/refresh', ctrlWrapper(refreshSession));
router.post('/logout', ctrlWrapper(logout));

export default router;
