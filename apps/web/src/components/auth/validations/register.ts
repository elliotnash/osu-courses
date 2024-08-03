import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const RegisterSchema = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your OSU email.'),
    v.email('Invalid email.')
  ),
  password: v.pipe(v.string(), v.nonEmpty('Please enter a password.')),
});
export type RegisterInput = InferInput<typeof RegisterSchema>;
