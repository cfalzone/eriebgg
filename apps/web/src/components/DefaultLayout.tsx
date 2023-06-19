import Head from 'next/head';
import { ReactNode } from 'react';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>BGG Browser</title>
      </Head>
      <main className="h-full bg-zinc-900">{children}</main>
    </>
  );
};
