import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_LIFETIME = '15m';
const REFRESH_TOKEN_LIFETIME = '30d';

// ==========================
// Реєстрація користувача
// ==========================
export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

// ==========================
// Логін користувача
// ==========================
export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw createHttpError(401, 'Email or password is wrong');

  // Генеруємо токени з однаковим полем userId
  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  // Видаляємо старі сесії
  await Session.deleteMany({ userId: user._id });

  // Створюємо нову сесію
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken };
};

// ==========================
// Оновлення сесії (refresh token)
// ==========================
export const refreshSessionService = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie)
    throw createHttpError(401, 'Refresh token missing');

  const session = await Session.findOne({
    refreshToken: refreshTokenFromCookie,
  });
  if (!session) throw createHttpError(401, 'Invalid refresh token');

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }

  // Генеруємо нові токени з userId
  const accessToken = jwt.sign(
    { userId: session.userId },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    },
  );
  const refreshToken = jwt.sign(
    { userId: session.userId },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    },
  );

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  // Видаляємо стару сесію і створюємо нову
  await Session.deleteOne({ _id: session._id });
  await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken };
};

// ==========================
// Логаут користувача
// ==========================
export const logoutService = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie)
    throw createHttpError(401, 'Refresh token missing');

  await Session.deleteOne({ refreshToken: refreshTokenFromCookie });
};
