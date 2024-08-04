import { FormError, SubmitHandler, valiForm } from '@modular-forms/solid';
import { createForm, submit } from '@modular-forms/solid';
import { VerifyInput, VerifySchema } from './validations/verify';
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
} from 'ui/components/otp-field';
import { A } from '@solidjs/router';
import { Show } from 'solid-js';

export function VerifyComponent() {
  const [verifyForm, { Form, Field }] = createForm<VerifyInput>({
    validate: valiForm(VerifySchema),
  });

  const submitHandler: SubmitHandler<VerifyInput> = (values, event) => {
    throw new FormError<VerifyInput>('', {
      otp: 'Invalid verification code.',
    });
  };

  return (
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
      <Form onSubmit={submitHandler}>
        <Field name="otp">
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
              <Show when={field.error}>
                <span class="mt-2 text-sm text-destructive">{field.error}</span>
              </Show>
            </div>
          )}
        </Field>
      </Form>
      <p class="px-8 text-center text-sm text-foreground">
        Didn't receive an email?{' '}
        <A
          href="/portal/register"
          class="underline underline-offset-4 hover:text-muted-foreground"
        >
          Send another
        </A>
      </p>
    </div>
  );
}
