import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import Head from 'next/head';

import { appWithI18Next } from 'ni18n';
import { ni18nConfig } from 'ni18n.config.ts';

import 'react-perfect-scrollbar/dist/css/styles.css';

import { NextPage } from 'next';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
    return (
        <Head>
            <title>Lista de Tarefas</title>
            <meta charSet="UTF-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" href="/favicon.png" />
        </Head>
    );
};
export default appWithI18Next(App, ni18nConfig);
