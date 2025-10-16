import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

// Використовуємо той самий секрет, що і для генерації токенів
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(
      createHttpError(401, 'Authorization header missing or malformed'),
    );
  }

  try {
    // Перевіряємо токен
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log('Decoded token:', decoded);

    // Шукаємо сесію в базі
    const session = await Session.findOne({ accessToken: token });
    console.log('Found session:', session);

    if (!session) throw createHttpError(401, 'Session not found');

    // Перевірка терміну дії токена
    if (new Date() > session.accessTokenValidUntil) {
      await Session.deleteOne({ _id: session._id });
      throw createHttpError(401, 'Access token expired');
    }

    // Отримуємо користувача
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) throw createHttpError(401, 'User not found');

    // Додаємо користувача до запиту
    req.user = user;

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }
    next(createHttpError(401, 'Invalid or expired token'));
  }
};
