import React from 'react';
import { TranslationProvider } from '../../components/TranslationProvider';
import NavbarTranslateButton from '../../components/NavbarTranslateButton';

export default function TranslateButtonComponent() {
  return (
    <TranslationProvider>
      <NavbarTranslateButton />
    </TranslationProvider>
  );
}
