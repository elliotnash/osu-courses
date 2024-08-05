import { treaty } from '@elysiajs/eden';
import { isServer } from 'solid-js/web';
import { App } from 'api';
import { getHeaders, setResponseHeaders } from 'vinxi/http';

function getServerHeaders() {
  'use server';
  return new Headers(
    Object.entries(getHeaders()).map(([k, v]) => [k, v ?? ''] as const)
  );
}

function setServerHeaders(headers: Headers) {
  'use server';
  setResponseHeaders(
    Object.fromEntries(headers.entries()) as Record<string, string>
  );
}

export default treaty<App>('http://localhost:8080', {
  fetch: {
    credentials: 'include',
  },
  headers(path, options) {
    // If ssr context, copy over client headers.
    if (isServer) {
      return getServerHeaders();
    }
  },
  onResponse(response) {
    // If ssr context, set headers on client.
    if (isServer) {
      setServerHeaders(response.headers);
    }
  },
});
