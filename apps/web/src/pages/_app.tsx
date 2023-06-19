import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import { AppProps, AppType } from 'next/app';
import { DefaultLayout } from '../components/DefaultLayout';

import '../styles/globals.css';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = (({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return getLayout(<Component {...pageProps} />);
}) as AppType;

export default MyApp;
