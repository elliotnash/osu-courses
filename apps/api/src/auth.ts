import { Adapter, Lucia } from 'lucia';
import { db } from '~/database/db';
import { accounts, accountSelectSchema, sessions } from '~/database/schema';
import { eq, gt } from 'drizzle-orm';
import env from '~/env';
import { t } from 'elysia';

const AuthAdapter = {
  async deleteExpiredSessions() {
    await db.delete(sessions).where(gt(sessions.expiresAt, new Date()));
  },
  async deleteSession(sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  },
  async deleteUserSessions(userId) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  },
  async getSessionAndUser(sessionId) {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });
    if (!session) {
      return [null, null];
    }
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.id, session.userId),
    });
    if (!account) {
      return [null, null];
    }
    return [
      { ...session, attributes: {} } ?? null,
      {
        id: session.userId,
        attributes: account,
      } ?? null,
    ];
  },
  async getUserSessions(userId) {
    const userSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
    });
    return userSessions.map((s) => ({ ...s, attributes: {} }));
  },
  async setSession(session) {
    await db.insert(sessions).values(session);
  },
  async updateSessionExpiration(sessionId, expiresAt) {
    await db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.id, sessionId));
  },
} satisfies Adapter;

export const lucia = new Lucia(AuthAdapter, {
  sessionCookie: {
    attributes: {
      secure: env.PRODUCTION,
    },
  },
  getUserAttributes: (attributes) => attributes,
});

const databaseUserAttributesSchema = t.Omit(accountSelectSchema, ['id']);

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: typeof databaseUserAttributesSchema.static;
  }
}
