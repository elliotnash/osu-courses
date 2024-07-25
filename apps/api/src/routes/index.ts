import { Elysia, t } from 'elysia';
import { db } from '~/database/db';
import { clicks } from '~/database/schema';
import { count, eq } from 'drizzle-orm';

export default new Elysia()
  .get('/greeting', () => 'Hello Elysia!' as const, {
    response: t.Literal('Hello Elysia!', {
      examples: ['Hello Elysia!'],
    }),
  })
  .put(
    '/click',
    async ({ cookie: { deviceId } }) => {
      await db.insert(clicks).values({
        deviceId: deviceId.value!,
        time: new Date(),
      });
      const select = await db
        .select({ count: count() })
        .from(clicks)
        .where(eq(clicks.deviceId, deviceId.value!));
      return select[0].count;
    },
    {
      response: t.Number({
        examples: [1],
      }),
    }
  )
  .get(
    '/clicks',
    async ({ cookie: { deviceId } }) => {
      const select = await db
        .select({ count: count() })
        .from(clicks)
        .where(eq(clicks.deviceId, deviceId.value!));
      return select[0].count;
    },
    {
      response: t.Number({
        examples: [49],
      }),
    }
  )
  .delete(
    '/clicks',
    async ({ cookie: { deviceId } }) => {
      await db.delete(clicks).where(eq(clicks.deviceId, deviceId.value!));
    },
    {
      response: t.Void(),
    }
  );
