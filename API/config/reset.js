import 'dotenv/config';

export const resetConfig = {
    resetSecret: process.env.PASSWORD_RESET_SECRET,
    resetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN
}