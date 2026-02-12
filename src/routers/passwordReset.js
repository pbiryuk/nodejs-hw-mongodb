import express from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { sendResetEmail, resetPassword } from '../controllers/passwordReset.js';
import Joi from 'joi';

const router = express.Router();

// Joi-схеми для валідації body
const sendResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPwdSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

// Ендпоінти
router.post(
  '/send-reset-email',
  validateBody(sendResetSchema),
  ctrlWrapper(sendResetEmail),
);

router.post(
  '/reset-pwd',
  validateBody(resetPwdSchema),
  ctrlWrapper(resetPassword),
);

export default router;
