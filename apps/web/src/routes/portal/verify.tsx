import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/components/card';
import { VerifyComponent } from 'src/components/auth/verify';

export default function Verify() {
  return (
    // <ProtectedRoute>
    <div class="flex h-screen">
      <Card class="m-auto max-w-sm align-bottom">
        <CardHeader>
          <CardTitle class="text-xl">Verify Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyComponent />
        </CardContent>
      </Card>
    </div>
    // </ProtectedRoute>
  );
}
