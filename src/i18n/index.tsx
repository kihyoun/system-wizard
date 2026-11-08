import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createInstance, type i18n } from 'i18next';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import shell from './shell';
import wizard from './wizard';
import docs from './docs';

export type Locale = 'en' | 'de';
type Values = Record<string, string | number>;
export const localeStorageKey = 'system-bootstrapper.locale';
const german: Record<string, string> = { ...shell, ...wizard, ...docs,
  'docs.searchResults_one': '{{count}} Kapitel zu „{{query}}“',
  'docs.searchResults_other': '{{count}} Kapitel zu „{{query}}“',
  'code.copyExample': '{{language}}-Beispiel kopieren',
  'status.skippedFiles': '(Übersprungen: {{count}} Datei(en)',
};
const english = { ...Object.fromEntries(Object.keys(german).map(key => [key, key])),
  'docs.searchResults_one': '{{count}} chapter matching “{{query}}”',
  'docs.searchResults_other': '{{count}} chapters matching “{{query}}”',
  'code.copyExample': 'Copy {{language}} example',
  'status.skippedFiles': '(Skipped {{count}} File(s)',
};

function instance(locale: Locale, globalDefault = false) {
  const language = createInstance();
  if (globalDefault) language.use(initReactI18next);
  void language.init({
    lng: locale, supportedLngs: ['en', 'de'], fallbackLng: 'en', initAsync: false,
    resources: { en: { translation: english }, de: { translation: german } },
    keySeparator: false, nsSeparator: false, interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return language;
}

const defaultLanguage = instance('en', true);

function renderText(language: i18n, text: string, locale: Locale, values?: Values): string {
  const options = { lng: locale, ...values };
  if (language.exists(text, options)) return String(language.t(text, options));
  // Legacy status channels carry English messages plus operator-supplied details.
  // Translate only their known UI prefix; filenames and diagnostics stay verbatim.
  for (const prefix of ['Import finished: ', 'error reading file: ', 'Derived suggestions loaded. Please verify all settings before pushing. ', 'Import finished. ']) {
    if (!text.startsWith(prefix)) continue;
    const suffix = text.slice(prefix.length), skipped = /^\(Skipped (\d+) File\(s\)$/.exec(suffix);
    return String(language.t(prefix, options)) + (skipped ? String(language.t('status.skippedFiles', { lng: locale, count: Number(skipped[1]) })) : suffix);
  }
  return text;
}

export function translate(text: string, locale: Locale, values?: Values): string { return renderText(defaultLanguage, text, locale, values); }

function savedLocale(): Locale {
  try { return window.localStorage.getItem(localeStorageKey) === 'de' ? 'de' : 'en'; }
  catch { return 'en'; }
}

function LanguagePreference({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale;
    try { window.localStorage.setItem(localeStorageKey, locale); }
    catch { /* Language selection also works when browser storage is unavailable. */ }
  }, [locale]);
  return children;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language] = useState(() => instance(savedLocale()));
  return <I18nextProvider i18n={language}><LanguagePreference>{children}</LanguagePreference></I18nextProvider>;
}

export function useI18n() {
  const { i18n: language } = useTranslation();
  const locale: Locale = language.resolvedLanguage === 'de' ? 'de' : 'en';
  const setLocale = useCallback((next: Locale) => { if (next === 'en' || next === 'de') void language.changeLanguage(next); }, [language]);
  const t = useCallback((text: string, values?: Values) => renderText(language, text, locale, values), [language, locale]);
  return { locale, setLocale, t };
}
