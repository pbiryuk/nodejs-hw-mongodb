import {
  registerUserService,
  loginUserService,
  refreshSessionService,
  logoutService,
} from '../services/auth.js';

export const register = async (req, res) => {
  const user = await registerUserService(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const login = async (req, res) => {
  const { accessToken, refreshToken } = await loginUserService(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refreshSession = async (req, res) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  const { accessToken, refreshToken } = await refreshSessionService(
    refreshTokenFromCookie,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logout = async (req, res) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  await logoutService(refreshTokenFromCookie);

  res.clearCookie('refreshToken');
  res.status(204).send();
};
