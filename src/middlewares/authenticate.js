import createHttpError from 'http-errors';
import Session from '../models/session.js';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw createHttpError(401, 'Authorization header missing');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw createHttpError(401, 'Authorization header malformed');

    const session = await Session.findOne({ accessToken: token });
    if (!session) throw createHttpError(401, 'Session not found');

    if (new Date() > session.accessTokenValidUntil) {
      await Session.deleteOne({ _id: session._id });
      throw createHttpError(401, 'Access token expired');
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) throw createHttpError(401, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
};
