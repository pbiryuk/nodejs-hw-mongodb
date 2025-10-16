import {
  registerUserService,
  loginUserService,
  refreshSessionService,
  logoutService,
} from '../services/auth.js';

// Реєстрація користувача
export const register = async (req, res) => {
  const user = await registerUserService(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

// Логін користувача
export const login = async (req, res) => {
  const { accessToken, refreshToken } = await loginUserService(req.body);

  // Запис refresh токена в cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

// Оновлення сесії через refresh токен
export const refreshSession = async (req, res) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  const { accessToken, refreshToken } = await refreshSessionService(
    refreshTokenFromCookie,
  );

  // Оновлюємо cookie з новим refresh токеном
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

// Логаут користувача
export const logout = async (req, res) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  await logoutService(refreshTokenFromCookie);

  // Видаляємо cookie з refresh токеном
  res.clearCookie('refreshToken');

  // Відповідь без тіла
  res.status(204).send();
};
