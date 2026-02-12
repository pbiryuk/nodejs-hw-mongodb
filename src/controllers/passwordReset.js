// src/controllers/passwordReset.js
import {
  sendResetEmailService,
  resetPasswordService,
} from '../services/passwordReset.js';
import createHttpError from 'http-errors';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

// Відправка листа для скидання паролю
export const sendResetEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw createHttpError(400, 'Email is required');
  }

  await sendResetEmailService(email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

// Скидання паролю
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    throw createHttpError(400, 'Token and new password are required');
  }

  await resetPasswordService(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
