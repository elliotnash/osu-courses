import { FormError, SubmitHandler, valiForm } from '@modular-forms/solid';
import { createForm } from '@modular-forms/solid';
import { RiLogosGithubLine, RiSystemLoaderLine } from 'solid-icons/ri';
import { Button } from 'ui/components/button';
import { Grid } from 'ui/components/grid';
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
  TextFieldErrorMessage,
} from 'ui/components/text-field';
import { RegisterInput, RegisterSchema } from './validations/register';
import api from 'src/api';
import { RegistrationEmailConflictError } from 'api/src/errors';
import { LoginInput } from 'src/components/auth/validations/login';
import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';

export function RegisterComponent() {
  const navigate = useNavigate();

  const [authForm, { Form, Field }] = createForm<RegisterInput>({
    validate: valiForm(RegisterSchema),
  });

  const submitHandler: SubmitHandler<RegisterInput> = async (values) => {
    const { error } = await api.auth.register.post(values);
    if (error) {
      switch (error.value.code) {
        case RegistrationEmailConflictError.code:
          throw new FormError<LoginInput>({
            email: error.value.message,
          });
        default:
          throw new FormError<LoginInput>('Server error.');
      }
    }
    // If registration successful redirect to email verification page.
    navigate('/portal/verify');
    // Return promise that never resolves; ensures loading animation remains.
    return new Promise(() => {});
  };

  return (
    <div class="grid gap-6">
      <Form onSubmit={submitHandler}>
        <Grid class="gap-4">
          <Grid cols={2} class="gap-4">
            <Field name="firstName">
              {(field, props) => (
                <TextField validationState={field.error ? 'invalid' : 'valid'}>
                  <TextFieldLabel>First Name</TextFieldLabel>
                  <TextFieldInput
                    {...props}
                    type="text"
                    placeholder="Jane"
                    autocomplete="given-name"
                  />
                  <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
                </TextField>
              )}
            </Field>
            <Field name="lastName">
              {(field, props) => (
                <TextField validationState={field.error ? 'invalid' : 'valid'}>
                  <TextFieldLabel>Last Name</TextFieldLabel>
                  <TextFieldInput
                    {...props}
                    type="text"
                    placeholder="Doe"
                    autocomplete="family-name"
                  />
                  <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
                </TextField>
              )}
            </Field>
          </Grid>
          <Field name="email">
            {(field, props) => (
              <TextField validationState={field.error ? 'invalid' : 'valid'}>
                <TextFieldLabel>Email</TextFieldLabel>
                <TextFieldInput
                  {...props}
                  type="email"
                  placeholder="email@oregonstate.edu"
                  autocomplete="email"
                />
                <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
              </TextField>
            )}
          </Field>
          <Field name="password">
            {(field, props) => (
              <TextField validationState={field.error ? 'invalid' : 'valid'}>
                <TextFieldLabel>Password</TextFieldLabel>
                <TextFieldInput
                  {...props}
                  type="password"
                  autocomplete="new-password"
                />
                <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
              </TextField>
            )}
          </Field>
          <Show when={authForm.response.message}>
            <span class="text-sm text-destructive">
              {authForm.response.message}
            </span>
          </Show>
          <Button type="submit" disabled={authForm.submitting}>
            {authForm.submitting && (
              <RiSystemLoaderLine class="mr-2 size-4 animate-spin" />
            )}
            Create an account
          </Button>
        </Grid>
      </Form>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={authForm.submitting}>
        <RiLogosGithubLine class="mr-2 size-4" />
        Github
      </Button>
    </div>
  );
}
