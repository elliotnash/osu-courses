import { Suspense } from 'solid-js';
import ProtectedRoute from '~/components/auth/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <main class="text-center mx-auto text-foreground/60 p-4">
        <Suspense>
          <h1 class="max-6-xs text-6xl text-sky-500 font-thin uppercase my-16">
            OSU Courses Portal
          </h1>
          <p class="mt-8">
            Visit{' '}
            <a
              href="https://solidjs.com"
              target="_blank"
              class="text-foreground hover:underline"
            >
              solidjs.com
            </a>{' '}
            to learn how to build Solid apps.
          </p>
        </Suspense>
      </main>
    </ProtectedRoute>
  );
}
