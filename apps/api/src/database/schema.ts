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
  emailVerified: boolean('email_verified').default(false).notNull(),
  username: text('username').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phoneNumber: text('phone_number'),
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

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => accounts.id)
    .notNull(),
  created: timestamp('created').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  revoked: boolean('revoked').default(false).notNull(),
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
  expiresAt: timestamp('expiresAt').notNull(),
});
export const emailAuthInsertSchema = createInsertSchema(emailAuth);
export const emailAuthSelectSchema = createSelectSchema(emailAuth);
