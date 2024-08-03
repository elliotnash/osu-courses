import { For } from 'solid-js';
import { useLocation } from '@solidjs/router';

import { cn } from 'ui/lib/utils';
import { RiLogosGithubLine } from 'solid-icons/ri';
import { ModeToggle } from '~/components/mode-toggle';
import { buttonVariants } from 'ui/components/button';

const leftItems = [
  {
    name: 'Home',
    path: '/',
  },
  {
    name: 'Docs',
    path: '/docs',
  },
  {
    name: 'Portal',
    path: '/portal',
  },
];

export default function Navbar() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? 'text-foreground/80' : 'text-foreground/60';

  return (
    <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 max-w-screen-2xl items-center">
        <div class="mr-4 flex">
          <a href="/" class="mr-6 flex items-center space-x-2">
            <span class="font-bold inline-block">OSU Courses API</span>
          </a>
          <nav class="hidden sm:flex items-center gap-4 text-sm lg:gap-6">
            <For each={leftItems}>
              {(item) => (
                <a
                  href={item.path}
                  class={`${active(item.path)} transition-colors hover:text-foreground/80`}
                >
                  {item.name}
                </a>
              )}
            </For>
          </nav>
        </div>

        <div class="flex flex-1 items-center space-x-2 justify-end">
          <div class="flex items-center">
            <a
              href="https://github.com/elliotnash/dbest-moon"
              target="_blank"
              rel="noreferrer"
            >
              <div
                class={cn(
                  buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  }),
                  'w-9 px-0'
                )}
              >
                <RiLogosGithubLine class="size-5" />
                <span class="sr-only">GitHub</span>
              </div>
            </a>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
