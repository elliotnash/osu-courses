import { createTransport } from 'nodemailer';
import env from '~/env';

const mailer = createTransport({
  port: env.SMTP_PORT,
  host: env.SMTP_HOST,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  sender: env.SMTP_SENDER,
});
await mailer.verify();
export { mailer };
