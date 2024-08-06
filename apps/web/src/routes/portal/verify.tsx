import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/components/card';
import {
  EmailResendCounter,
  VerifyComponent,
} from 'src/components/auth/verify';
import ProtectedRoute from '~/components/auth/protected-route';
import { FormError, SubmitHandler } from '@modular-forms/solid';
import { VerifyInput } from '~/components/auth/validations/verify';
import api from '~/api';
import { InvalidCredentialsError, UnauthorizedError } from 'api/src/errors';
import { useNavigate } from '@solidjs/router';

export default function Verify() {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div class="flex h-screen">
        <Card class="m-auto max-w-sm align-bottom">
          <CardHeader>
            <CardTitle class="text-xl">Verify Email</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyComponent
              onSubmit={async (values, _) => {
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
                  // Email verified, navigate to portal.
                  console.log('no error, redirecting');
                  navigate('/portal');
                  // Return promise that never resolves; ensures otp disabled.
                  return new Promise(() => {});
                }
              }}
            >
              <EmailResendCounter />
            </VerifyComponent>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
