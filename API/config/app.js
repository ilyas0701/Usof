import 'dotenv/config';

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  appUrl: process.env.APP_URL,
  frontendUrl: process.env.FRONTEND_URL
}