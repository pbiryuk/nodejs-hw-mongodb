import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_LIFETIME = '15m';
const REFRESH_TOKEN_LIFETIME = '30d';

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw createHttpError(401, 'Email or password is wrong');

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });

  await Session.deleteMany({ userId: user._id });
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

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

  const accessToken = jwt.sign(
    { userId: session.userId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_LIFETIME },
  );
  const refreshToken = jwt.sign(
    { userId: session.userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_LIFETIME },
  );

  await Session.deleteOne({ _id: session._id });
  await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const logoutService = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie)
    throw createHttpError(401, 'Refresh token missing');
  await Session.deleteOne({ refreshToken: refreshTokenFromCookie });
};
