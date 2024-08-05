import {
  FormError,
  SubmitHandler,
  valiForm,
  focus,
} from '@modular-forms/solid';
import { createForm, submit } from '@modular-forms/solid';
import { VerifyInput, VerifySchema } from './validations/verify';
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
} from 'ui/components/otp-field';
import { useNavigate } from '@solidjs/router';
import { createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import api from '~/api';
import {
  EmailVerificationConflictError,
  InvalidCredentialsError,
  UnauthorizedError,
  VerificationRequestExistsError,
  VerificationRequestTimeoutError,
} from 'api/src/errors';
import { differenceInSeconds } from 'date-fns/fp';
import { verificationRequestTimeoutSeconds } from 'api/src/consts';

export function VerifyComponent() {
  const navigate = useNavigate();

  // Sends a verification email if allowed, otherwise gets time until allowed.
  let resend = false;
  const verifyQuery = createQuery(() => ({
    queryKey: ['verify-request'],
    queryFn: async () => {
      const { data, error } = await api.auth['verify-request'].get({
        query: { resend },
      });
      if (!data) {
        switch (error.value.code) {
          case UnauthorizedError.code:
            // User not logged in
            throw navigate('/portal/login');
          case EmailVerificationConflictError.code:
            // User already verified
            throw navigate('/portal');
          case VerificationRequestTimeoutError.code:
            return {
              ...error.value,
              nextRequest: new Date(error.value.nextRequest),
              handled: true as const,
            };
          case VerificationRequestExistsError.code:
            return {
              nextRequest: new Date(0),
              handled: true as const,
            };
          default:
            return {
              message: 'Server error.',
              handled: false as const,
            };
        }
      }
      return {
        ...data,
        nextRequest: new Date(data.nextRequest),
        handled: true as const,
      };
    },
  }));

  // Count down timer.
  const [timeSeconds, setTimeSeconds] = createSignal(
    verificationRequestTimeoutSeconds
  );
  function updateTimer() {
    if (verifyQuery.data?.handled) {
      const diff = differenceInSeconds(
        new Date(),
        verifyQuery.data.nextRequest
      );
      setTimeSeconds(Math.max(diff, 0));
    }
  }
  updateTimer();
  const timer = setInterval(updateTimer, 1000);
  onCleanup(() => clearInterval(timer));
  const canResend = createMemo(
    () => timeSeconds() == 0 && !verifyQuery.isFetching
  );

  // Formatted count down.
  const timeString = createMemo(() => {
    const seconds = Math.round(timeSeconds() % 60);
    const minutes = Math.floor(timeSeconds() / 60);
    return `${minutes}:${seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`;
  });

  // OTP Form
  const [verifyForm, { Form, Field }] = createForm<VerifyInput>({
    validate: valiForm(VerifySchema),
  });

  // Form submission
  const submitHandler: SubmitHandler<VerifyInput> = async (values, _) => {
    const { error } = await api.auth['verify-submit'].post(values);
    if (error) {
      switch (error.value.code) {
        case UnauthorizedError.code:
          // User not logged in
          throw navigate('/portal/login');
        case InvalidCredentialsError.code:
          throw new FormError<VerifyInput>({
            code: error.value.message,
          });
      }
    } else {
      // redirect to portal
      console.log('no error, redirecting');
      throw navigate('/portal');
    }
  };

  return (
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
      <Form onSubmit={submitHandler}>
        <Field name="code">
          {(field, props) => (
            <div class="flex flex-col items-center">
              <OTPField
                maxLength={6}
                onComplete={() => submit(verifyForm)}
                aria-label="Verification Code"
                error={!!field.error}
              >
                <OTPFieldInput
                  onKeyPress={(e: KeyboardEvent) => {
                    // Disable enter key
                    if (e.key == 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  disabled={verifyForm.submitting}
                  {...props}
                />
                <OTPFieldGroup>
                  <OTPFieldSlot index={0} />
                  <OTPFieldSlot index={1} />
                  <OTPFieldSlot index={2} />
                </OTPFieldGroup>
                <OTPFieldSeparator />
                <OTPFieldGroup>
                  <OTPFieldSlot index={3} />
                  <OTPFieldSlot index={4} />
                  <OTPFieldSlot index={5} />
                </OTPFieldGroup>
              </OTPField>
              {/*Form validation errors*/}
              <Show when={field.error}>
                <span class="mt-2 text-sm text-destructive">{field.error}</span>
              </Show>
              {/*Query errors*/}
              <Show when={!verifyQuery.data?.handled && verifyQuery.data}>
                {(data) => (
                  <span class="mt-2 text-sm text-destructive">
                    {data().message}
                  </span>
                )}
              </Show>
            </div>
          )}
        </Field>
      </Form>
      <Show
        when={canResend()}
        fallback={
          <p class="px-8 text-center text-sm text-muted-foreground">
            Send another email in {timeString()}.
          </p>
        }
      >
        <p class="px-8 text-center text-sm text-foreground">
          Didn't receive an email?{' '}
          <span
            class="underline underline-offset-4 hover:text-muted-foreground cursor-pointer"
            onClick={() => {
              resend = true;
              verifyQuery.refetch();
              setTimeSeconds(verificationRequestTimeoutSeconds);
            }}
          >
            Send another
          </span>
        </p>
      </Show>
    </div>
  );
}
