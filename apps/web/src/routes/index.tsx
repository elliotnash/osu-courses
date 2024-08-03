import { A } from '@solidjs/router';
import { Suspense } from 'solid-js';
import Navbar from '~/components/navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main class="text-center mx-auto text-foreground/60 p-4">
        <Suspense>
          <h1 class="max-6-xs text-6xl text-sky-500 font-thin uppercase my-16">
            OSU Courses API
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
          <p class="my-4">
            <span>Home</span>
            {' - '}
            <A href="/about" class="text-foreground hover:underline">
              About Page
            </A>{' '}
          </p>
        </Suspense>
      </main>
    </>
  );
}
