import { FormError, SubmitHandler, valiForm } from '@modular-forms/solid';
import { createForm, focus } from '@modular-forms/solid';
import { RiLogosGithubLine, RiSystemLoaderLine } from 'solid-icons/ri';
import { Button } from 'ui/components/button';
import { Grid } from 'ui/components/grid';
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
  TextFieldErrorMessage,
} from 'ui/components/text-field';
import { LoginInput, LoginSchema } from './validations/login';
import api from '~/api';
import { InvalidCredentialsError } from 'api/src/errors';
import { Component, Show } from 'solid-js';
import { InitiateLogin } from 'api/src/models/auth/login';

export const LoginComponent: Component<{
  onInitiate: (login: InitiateLogin, email: string) => Promise<void>;
}> = (props) => {
  const [authForm, { Form, Field }] = createForm<LoginInput>({
    validate: valiForm(LoginSchema),
  });

  const submitHandler: SubmitHandler<LoginInput> = async (values, _) => {
    const { data: login, error } =
      await api.auth['initiate-login'].post(values);
    if (!login) {
      switch (error.value.code) {
        case InvalidCredentialsError.code:
          focus(authForm, 'password');
          throw new FormError<LoginInput>(error.value.message);
        default:
          throw new FormError<LoginInput>('Server error.');
      }
    }
    await props.onInitiate(login, values.email);
  };

  return (
    <div class="grid gap-6">
      <Form onSubmit={submitHandler}>
        <Grid class="gap-4">
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
                  autocomplete="current-password"
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
            Log in
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
};
