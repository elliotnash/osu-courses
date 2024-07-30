import { StatusMap } from 'elysia';

/**
 * A base {@link Error} class that automatically sets name to the name of the subclass.
 */
abstract class ErrorBase extends Error {
  name = this.constructor.name;
  abstract code: string;
  abstract status: number;
}

export class UnauthorizedError extends ErrorBase {
  code = 'UNAUTHORIZED';
  status = StatusMap.Unauthorized;
  message = 'User not authenticated!';
}

export class InvalidCredentialsError extends ErrorBase {
  code = 'INVALID_CREDENTIALS';
  status = StatusMap.Unauthorized;
  message = 'Invalid credentials!';
}

export class RegistrationEmailConflictError extends ErrorBase {
  code = 'EMAIL_CONFLICT';
  status = StatusMap.Conflict;
  message = 'Email already registered!';
}

export class RegistrationUsernameConflictError extends ErrorBase {
  code = 'USERNAME_CONFLICT';
  status = StatusMap.Conflict;
  message = 'Username is taken!';
}

export class EmailVerificationConflictError extends ErrorBase {
  code = 'VERIFICATION_CONFLICT';
  status = StatusMap.Conflict;
  message = 'Email already verified!';
}

export class PasswordResetRequiredError extends ErrorBase {
  code = 'PASSWORD_RESET_REQUIRED';
  status = StatusMap.Conflict;
  message = 'Password must be reset!';
}
