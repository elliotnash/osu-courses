import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { t } from 'elysia';
import { usPhoneRegex } from '~/consts';
import { createId } from '@paralleldrive/cuid2';

export const accounts = pgTable('accounts', {
  id: text('id')
    .$default(() => createId())
    .primaryKey(),
  email: text('email').unique().notNull(),
  verified: boolean('verified').default(false).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phoneNumber: text('phone_number'),
  // Registration metadata
  registrationDate: timestamp('registration_date', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  lastUpdateDate: timestamp('last_update_date', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  lastLoginDate: timestamp('last_login_date', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
const accountsRefine = {
  email: t.String({ format: 'email' }),
  phoneNumber: t.RegExp(usPhoneRegex),
};
export const accountInsertSchema = createInsertSchema(accounts, accountsRefine);
export const accountSelectSchema = createSelectSchema(accounts, accountsRefine);

export const supportedMfas = pgTable('supported_mfas', {
  userId: text('user_id')
    .primaryKey()
    .references(() => accounts.id)
    .notNull(),
  emailMfa: boolean('email_mfa').default(false).notNull(),
  totpMfa: boolean('totp_mfa').default(false).notNull(),
});
export const supportedMfasInsertSchema = createInsertSchema(supportedMfas);
export const supportedMfasSelectSchema = createSelectSchema(supportedMfas);

export const loginTokens = pgTable('login_tokens', {
  id: text('id')
    .$default(() => createId())
    .primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
export const loginTokensInsertSchema = createInsertSchema(loginTokens);
export const loginTokensSelectSchema = createSelectSchema(loginTokens);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
export const sessionInsertSchema = createInsertSchema(sessions);
export const sessionSelectSchema = createSelectSchema(sessions);

export const passwordAuth = pgTable('password_auth', {
  id: text('id')
    .$default(() => createId())
    .primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  hash: text('hash').notNull(),
});
export const passwordAuthInsertSchema = createInsertSchema(passwordAuth);
export const passwordAuthSelectSchema = createSelectSchema(passwordAuth);

export const totpAuth = pgTable('totp_auth', {
  id: text('id')
    .$default(() => createId())
    .primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  totp: text('totp').notNull(),
});
export const totpAuthInsertSchema = createInsertSchema(totpAuth);
export const totpAuthSelectSchema = createSelectSchema(totpAuth);

export const emailAuth = pgTable('email_auth', {
  id: text('id')
    .$default(() => createId())
    .primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  code: varchar('code', { length: 6 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
export const emailAuthInsertSchema = createInsertSchema(emailAuth);
export const emailAuthSelectSchema = createSelectSchema(emailAuth);
