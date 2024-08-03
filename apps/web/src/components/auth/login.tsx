import type { SubmitHandler } from '@modular-forms/solid';
import { createForm } from '@modular-forms/solid';
import { RiLogosGithubLine, RiSystemLoaderLine } from 'solid-icons/ri';
import { Button } from 'ui/components/button';
import { Grid } from 'ui/components/grid';
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from 'ui/components/text-field';
import type { LoginInput } from './validations/login';

export function LoginComponent() {
  const [authForm, { Form, Field }] = createForm<LoginInput>();

  const handleSubmit: SubmitHandler<LoginInput> = () => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div class="grid gap-6">
      <Form onSubmit={handleSubmit}>
        <Grid class="gap-4">
          <Field name="email">
            {(_, props) => (
              <TextField>
                <TextFieldLabel>Email</TextFieldLabel>
                <TextFieldInput
                  {...props}
                  type="email"
                  placeholder="email@oregonstate.edu"
                />
              </TextField>
            )}
          </Field>
          <Field name="password">
            {(_, props) => (
              <TextField>
                <TextFieldLabel>Password</TextFieldLabel>
                <TextFieldInput {...props} type="password" />
              </TextField>
            )}
          </Field>
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
        {authForm.submitting ? (
          <RiSystemLoaderLine class="mr-2 size-4 animate-spin" />
        ) : (
          <RiLogosGithubLine class="mr-2 size-4" />
        )}{' '}
        Github
      </Button>
    </div>
  );
}
