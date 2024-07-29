import { t } from 'elysia';
import { parse } from './util';

export const envSchema = t.Object({
  // Http server settings
  API_PORT: t.Numeric({ default: 8080 }),

  // Database credentials
  DB_NAME: t.String(),
  DB_HOST: t.String(),
  DB_USER: t.String(),
  DB_PASSWORD: t.String(),
  DB_PORT: t.Numeric({ default: 5432 }),

  // Smtp credentials
  SMTP_PORT: t.Numeric({ default: 587 }),
  SMTP_HOST: t.Optional(t.String()),
  SMTP_USER: t.Optional(t.String()),
  SMTP_PASSWORD: t.Optional(t.String()),
  SMTP_SENDER: t.Optional(t.String()),

  // Database options
  DB_MAX_CONNECTIONS: t.Numeric({ default: 10 }),

  // Misc settings
  PRODUCTION: t
    .Transform(t.Numeric({ default: 0 }))
    .Decode((v) => v != 0)
    .Encode((b) => (b ? 1 : 0)),
});

export default parse(envSchema, { ...process.env });
