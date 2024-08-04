import { RegisterComponent } from '~/components/auth/register';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/components/card';
import { A } from '@solidjs/router';

export default function Register() {
  return (
    <div class="flex h-screen">
      <Card class="m-auto max-w-sm align-bottom">
        <CardHeader>
          <CardTitle class="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
            <RegisterComponent />
            <p class="px-8 text-center text-sm text-foreground">
              Already have an account?{' '}
              <A
                href="/portal/login"
                class="underline underline-offset-4 hover:text-muted-foreground"
              >
                Sign in
              </A>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
