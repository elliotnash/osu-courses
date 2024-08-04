import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/components/card';
import { LoginComponent } from '~/components/auth/login';

export default function Login() {
  return (
    <div class="flex h-screen">
      <Card class="m-auto max-w-sm align-bottom">
        <CardHeader>
          <CardTitle class="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your information to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
            <LoginComponent />
            <p class="px-8 text-center text-sm text-foreground">
              Don't have an account?{' '}
              <a
                href="/portal/register"
                class="underline underline-offset-4 hover:text-muted-foreground"
              >
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
