import type { InferInput } from 'valibot';
import * as v from 'valibot';
import {
  osuEmailRegex,
  passwordLowercaseRegex,
  passwordNumericRegex,
  passwordSpecialRegex,
  passwordUppercaseRegex,
} from 'api/src/consts';

export const RegisterSchema = v.object({
  firstName: v.pipe(v.string(), v.nonEmpty('Please enter your first name.')),
  lastName: v.pipe(v.string(), v.nonEmpty('Please enter your last name.')),
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your OSU email.'),
    v.email('Email is invalid.'),
    v.regex(osuEmailRegex, 'Email must be an OSU email.')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Please enter a password.'),
    v.minLength(8, 'Password must be at least 8 characters.'),
    v.regex(
      passwordLowercaseRegex,
      'Password must contain a lowercase letter.'
    ),
    v.regex(
      passwordUppercaseRegex,
      'Password must contain an uppercase letter.'
    ),
    v.regex(passwordNumericRegex, 'Password must contain a number.'),
    v.regex(passwordSpecialRegex, 'Password must contain a special character.')
  ),
});
export type RegisterInput = InferInput<typeof RegisterSchema>;
