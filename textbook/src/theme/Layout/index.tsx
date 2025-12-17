import React from 'react';
import Layout from '@theme-original/Layout';
import { TranslationProvider } from '../../components/TranslationProvider';
import { PageTranslator } from '../../components/PageTranslator';

export default function LayoutWrapper(props: any) {
  return (
    <TranslationProvider>
      <Layout {...props}>
        {props.children}
        <PageTranslator />
      </Layout>
    </TranslationProvider>
  );
}
