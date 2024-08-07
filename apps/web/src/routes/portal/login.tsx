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
  For,
  Match,
  onCleanup,
  onMount,
  ParentComponent,
  Switch,
} from 'solid-js';
import { InitiateLogin } from 'api/src/models/auth/login';
import { Grid } from 'ui/components/grid';
import { SupportedMfas } from 'api/src/models/auth/login';
import api from '~/api';
import { isServer } from 'solid-js/web';
import { VerifyComponent } from '~/components/auth/verify';

export default function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = createSignal<InitiateLogin>();
  const [email, setEmail] = createSignal<string>();
  const [mfaMethod, setMfaMethod] = createSignal<SupportedMfas>();

  const popstateListener: EventListener = (event) => {
    // Navigate back
    if (mfaMethod()) {
      setMfaMethod(undefined);
    } else if (login()) {
      setLogin(undefined);
      setEmail(undefined);
    }
  };
  onMount(() => {
    if (!isServer) {
      addEventListener('popstate', popstateListener);
    }
  });
  onCleanup(() => {
    if (!isServer) {
      removeEventListener('popstate', popstateListener);
    }
  });

  async function onInitiate(login: InitiateLogin, email: string) {
    setLogin(login);
    setEmail(email);
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
          <Match when={mfaMethod() == 'emailMfa'}>
            <EmailMfa email={email()!} />
          </Match>
          <Match when={mfaMethod() == 'totpMfa'}>
            <TotpMfa />
          </Match>
          <Match
            when={
              (login()?.supportedMfas?.length ?? 0) != 0 &&
              login()?.supportedMfas
            }
          >
            {(mfas) => (
              <ChooseMfaStep
                onSelect={setMfaMethod}
                supportedMfas={mfas()}
                email={email()!}
              />
            )}
          </Match>
        </Switch>
      </Card>
    </div>
  );
}

const LoginStep: Component<{
  onInitiate: (login: InitiateLogin, email: string) => Promise<void>;
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

const ChooseMfaStep: Component<{
  supportedMfas: SupportedMfas[];
  email: string;
  onSelect: (mfa: SupportedMfas) => void;
}> = (props) => {
  onMount(() => {
    history.pushState({ step: 'choose_method' }, '');
  });

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
          <For each={props.supportedMfas}>
            {(mfa) => (
              <Switch>
                <Match when={mfa == 'emailMfa'}>
                  <MfaOption
                    onClick={() => props.onSelect(mfa)}
                    title={'Email'}
                  >
                    Send a code to {props.email}
                  </MfaOption>
                </Match>
                <Match when={mfa == 'totpMfa'}>
                  <MfaOption
                    onClick={() => props.onSelect(mfa)}
                    title={'Verification Code'}
                  >
                    Get a code from your authenticator app
                  </MfaOption>
                </Match>
              </Switch>
            )}
          </For>
        </MfaOptionSection>
      </CardContent>
    </>
  );
};

const MfaOptionSection: ParentComponent = (props) => {
  return <Grid class="gap-2">{props.children}</Grid>;
};

const MfaOption: ParentComponent<{ title: string; onClick: () => void }> = (
  props
) => {
  return (
    <div
      onClick={() => props.onClick()}
      class="cursor-pointer p-2 transition-all rounded-md border hover:bg-accent"
    >
      {props.title}
      <br />
      <div class="text-sm text-muted-foreground">{props.children}</div>
    </div>
  );
};

const EmailMfa: Component<{ email: string }> = (props) => {
  onMount(() => {
    history.pushState({ step: 'code' }, '');
  });

  return (
    <>
      <CardHeader>
        <CardTitle class="text-xl">Email MFA</CardTitle>
        <CardDescription>Enter the code sent to {props.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyComponent
          onSubmit={(values, event) => console.log(values)}
        ></VerifyComponent>
      </CardContent>
    </>
  );
};

const TotpMfa = () => {
  onMount(() => {
    history.pushState({ step: 'code' }, '');
  });

  return (
    <>
      <CardHeader>
        <CardTitle class="text-xl">Authenticator App MFA</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyComponent
          onSubmit={(values, event) => console.log(values)}
        ></VerifyComponent>
      </CardContent>
    </>
  );
};
