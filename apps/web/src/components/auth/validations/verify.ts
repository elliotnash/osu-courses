import type { InferInput } from 'valibot';
import * as v from 'valibot';

export const VerifySchema = v.object({
  otp: v.string(),
});
export type VerifyInput = InferInput<typeof VerifySchema>;
