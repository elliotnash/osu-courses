import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/components/card';
import { LoginComponent } from '~/components/auth/login';
import { A, useNavigate } from '@solidjs/router';
import {
  Component,
  createSignal,
  Match,
  ParentComponent,
  Switch,
} from 'solid-js';
import { InitiateLogin } from 'api/src/models/auth/login';
import { Grid } from 'ui/components/grid';
import { SupportedMfas } from 'api/src/models/auth/login';
import api from '~/api';

export default function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = createSignal<InitiateLogin>();
  const [mfaMethod, setMfaMethod] = createSignal<SupportedMfas>();

  async function onInitiate(login: InitiateLogin) {
    setLogin(login);
    // If any mfa enabled then login complete
    if (login.supportedMfas.length == 0) {
      await completeLogin();
    }
    if (login.supportedMfas.length == 1) {
      setMfaMethod(login.supportedMfas[0]);
    }
  }

  async function completeLogin() {
    await api.auth.login.post(login()!);
    navigate('/portal');
    return new Promise(() => {});
  }

  return (
    <div class="flex h-screen">
      <Card class="m-auto max-w-sm align-bottom">
        <Switch fallback={<LoginStep onInitiate={onInitiate} />}>
          <Match when={mfaMethod() == 'emailMfa'}>email mfa</Match>
          <Match when={mfaMethod() == 'totpMfa'}>totp mfa</Match>
          <Match when={(login()?.supportedMfas?.length ?? 0) != 0}>
            <ChooseMfaStep />
          </Match>
        </Switch>
      </Card>
    </div>
  );
}

const LoginStep: Component<{
  onInitiate: (login: InitiateLogin) => Promise<void>;
}> = (props) => {
  return (
    <>
      <CardHeader>
        <CardTitle class="text-xl">Login</CardTitle>
        <CardDescription>
          Enter your information to log in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
          <LoginComponent onInitiate={props.onInitiate} />
          <p class="px-8 text-center text-sm text-foreground">
            Don't have an account?{' '}
            <A
              href="/portal/register"
              class="underline underline-offset-4 hover:text-muted-foreground"
            >
              Sign up
            </A>
          </p>
        </div>
      </CardContent>
    </>
  );
};

const ChooseMfaStep: Component = (props) => {
  return (
    <>
      <CardHeader>
        <CardTitle class="text-xl">Verify your Login</CardTitle>
        <CardDescription>
          Select a multi-factor authentication method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MfaOptionSection>
          <MfaOption title={'Email'}>
            Send a code to nashell@oregonstate.edu
          </MfaOption>
          <MfaOption title={'Verification Code'}>
            Get a code from your authenticator app
          </MfaOption>
        </MfaOptionSection>
      </CardContent>
    </>
  );
};

const MfaOptionSection: ParentComponent = (props) => {
  return <Grid class="gap-2">{props.children}</Grid>;
};

const MfaOption: ParentComponent<{ title: string }> = (props) => {
  return (
    <div class="cursor-pointer p-2 transition-all rounded-md border hover:bg-accent">
      {props.title}
      <br />
      <div class="text-sm text-muted-foreground">{props.children}</div>
    </div>
  );
};
