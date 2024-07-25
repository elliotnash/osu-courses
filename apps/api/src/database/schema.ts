import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'

export const accounts = pgTable('accounts', {
  cuid: text('cuid').primaryKey(),
  email: text('email').unique().notNull(),
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
})
export const accountInsertSchema = createInsertSchema(accounts)
export const accountSelectSchema = createSelectSchema(accounts)

export const tokens = pgTable('tokens', {
  cuid: text('cuid').primaryKey(),
  userCuid: text('user_cuid')
    .references(() => accounts.cuid)
    .notNull(),
  hash: text('hash').notNull(),
  created: timestamp('created').defaultNow().notNull(),
  expires: timestamp('created').notNull(),
  revoked: boolean('revoked').default(false).notNull(),
})
export const tokenInsertSchema = createInsertSchema(tokens)
export const tokenSelectSchema = createSelectSchema(tokens)

export const passwordAuth = pgTable('password_auth', {
  cuid: text('cuid').primaryKey(),
  userCuid: text('user_cuid')
    .references(() => accounts.cuid)
    .notNull(),
  hash: text('hash').notNull(),
})
export const passwordAuthInsertSchema = createInsertSchema(passwordAuth)
export const passwordAuthSelectSchema = createSelectSchema(passwordAuth)

export const totpAuth = pgTable('totp_auth', {
  cuid: text('cuid').primaryKey(),
  userCuid: text('user_cuid')
    .references(() => accounts.cuid)
    .notNull(),
  totp: text('totp').notNull(),
})
export const totpAuthInsertSchema = createInsertSchema(totpAuth)
export const totpAuthSelectSchema = createSelectSchema(totpAuth)
