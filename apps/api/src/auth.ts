import { Adapter, Lucia } from 'lucia';
import { db } from '~/database/db';
import { sessions } from '~/database/schema';
import { eq, lt } from 'drizzle-orm';
import env from '~/env';

const AuthAdapter = {
  async deleteExpiredSessions() {
    const now = new Date();
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
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
    return [
      { ...session, attributes: {} } ?? null,
      { id: session.userId, attributes: {} } ?? null,
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
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {};
  }
}
