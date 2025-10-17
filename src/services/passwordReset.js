// src/services/passwordReset.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Session from '../models/session.js';

const JWT_SECRET = process.env.JWT_SECRET;
const APP_DOMAIN = process.env.APP_DOMAIN;

// Налаштування SMTP (Brevo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // для порту 587 зазвичай false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendResetEmailService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  const token = jwt.sign({ email: user.email }, JWT_SECRET, {
    expiresIn: '5m',
  });
  const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Hi ${user.name},</p>
             <p>Click the link below to reset your password. This link will expire in 5 minutes.</p>
             <a href="${resetLink}">Reset Password</a>`,
    });
  } catch (err) {
    console.error('Email sending error:', err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPasswordService = async (token, newPassword) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found!');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Видалити всі сесії користувача
  await Session.deleteMany({ userId: user._id });
};
