import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your OSU email.'),
    v.email('Invalid email.')
  ),
  password: v.pipe(v.string(), v.nonEmpty('Please enter a password.')),
});
export type LoginInput = InferInput<typeof LoginSchema>;
