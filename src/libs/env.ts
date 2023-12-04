import { env } from "process";

export const envLib = {
  port: env.PORT || 5000,
  hasura: {
    api: env.HASURA_API,
    secret_admin_key: env.HASURA_ADMIN_SECRET,
  },
  client: {
    host: env.CLIENTHOST,
  },
  jwt: {
    accessToken: env.JWT_SECRET,
    accessTokenExpiresin: parseInt(env.JWT_EXPIRESIN_SECRET!),
    refreshToken: env.JWT_REFRESH,
    refreshTokenExpiresin: parseInt(env.JWT_EXPIRESIN_REFRESH!),
    resetPasswordToken: env.JWT_RESETPASSWORD,
    resetPasswordTokenExpiresin: parseInt(env.JWT_EXPIRESIN_RESETPASSWORD!),
  },
  mail: {
    host: env.MAIL_HOST,
    port: parseInt(env.MAIL_PORT!),
    user: env.MAIL_USER,
    password: env.MAIL_PASSWORD,
    mailFrom: env.MAIL_FROM,
  },
};
