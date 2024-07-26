import { Elysia } from 'elysia';
import register from '~/routes/auth/register';
import login from '~/routes/auth/login';

export default new Elysia({ prefix: '/auth' }).use(login).use(register);
