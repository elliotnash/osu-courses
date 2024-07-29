import { createTransport } from 'nodemailer';
import env from '~/env';
import nodemailerMjmlPlugin from 'nodemailer-mjml';

const mailer = createTransport({
  port: env.SMTP_PORT,
  host: env.SMTP_HOST,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  sender: env.SMTP_SENDER,
});
mailer.use(
  'compile',
  nodemailerMjmlPlugin({
    templateFolder: Bun.fileURLToPath(import.meta.resolve('../templates')),
  })
);
await mailer.verify();
export { mailer };
