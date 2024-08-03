import { Component, JSXElement, Show } from 'solid-js';
import { cache, createAsync, redirect } from '@solidjs/router';
import { getCookie } from 'vinxi/http';

const authenticate = cache(async () => {
  'use server';
  const authSession = getCookie('auth_session');
  if (!authSession) {
    throw redirect('/portal/login');
  }
  return true;
}, 'authenticate');

const ProtectedRoute: Component<{ children: JSXElement }> = (props) => {
  const isAuthenticated = createAsync(() => authenticate());

  return <Show when={isAuthenticated()}>{props.children}</Show>;
};

export default ProtectedRoute;
