import Head from 'next/head';
import { ReactNode } from 'react';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>BGG Browser</title>
      </Head>
      <div className="flex min-h-full flex-col bg-zinc-900">
        <main className="flex-1">{children}</main>
        <footer className="flex justify-center py-6">
          <a
            href="https://boardgamegeek.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition opacity-90 hover:opacity-100"
            aria-label="Powered by BoardGameGeek"
          >
            <img
              src="/powered-by-bgg-reversed-rgb.svg"
              alt="Powered by BoardGameGeek"
              className="h-10 w-auto"
              width={200}
              height={40}
            />
          </a>
        </footer>
      </div>
    </>
  );
};
