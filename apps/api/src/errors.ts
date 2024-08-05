import { StatusMap } from 'elysia';

export const UnauthorizedError = {
  code: 'UNAUTHORIZED' as const,
  status: StatusMap.Unauthorized,
  message: 'User not authenticated.',
};

export const InvalidCredentialsError = {
  code: 'INVALID_CREDENTIALS' as const,
  status: StatusMap.Unauthorized,
  message: 'Invalid credentials.',
};

export const RegistrationEmailConflictError = {
  code: 'EMAIL_CONFLICT' as const,
  status: StatusMap.Conflict,
  message: 'Email already registered.',
};

export const EmailVerificationConflictError = {
  code: 'VERIFICATION_CONFLICT' as const,
  status: StatusMap.Conflict,
  message: 'Email already verified.',
};

export const PasswordResetRequiredError = {
  code: 'PASSWORD_RESET_REQUIRED' as const,
  status: StatusMap.Conflict,
  message: 'Password must be reset.',
};

export const VerificationRequestTimeoutError = {
  code: 'VERIFICATION_REQUEST_TIMEOUT' as const,
  status: StatusMap['Too Many Requests'],
  message: 'Too many verification requests.',
  nextRequest: null,
};

export const VerificationRequestExistsError = {
  code: 'VERIFICATION_REQUEST_EXISTS' as const,
  status: StatusMap.Conflict,
  message:
    'Verification already requested. To resend the verification email, pass `resend=true`.',
};
