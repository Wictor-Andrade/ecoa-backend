const cookieNamePrefix = process.env.COOKIE_NAME_PREFIX || 'ecoa';

export function configuration() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV == 'development',
    port: process.env.PORT,
    corsOrigin: String(process.env.CORS_ORIGIN).split(','),
    cookie: {
      domain: process.env.COOKIE_DOMAIN,
      secure: process.env.COOKIE_SECURE === 'true',
      expiresIn: process.env.COOKIE_EXPIRATION,
      secret: process.env.COOKIE_SECRET,
    },
    jwt: {
      keys: {
        jwtAlgorithm: process.env.JWT_ALGORITHM,
      },
      refresh: {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
        cookieName: `${cookieNamePrefix}_refresh_token`,
      },
      access: {
        expiresIn: process.env.JWT_ACESS_EXPIRATION,
        cookieName: `${cookieNamePrefix}_access_token`,
      },
    },
    postgres: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      db: process.env.POSTGRES_DB,
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      url: process.env.DATABASE_URL,
    },
  };
}
