import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from './locales/en.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';

const LOCALES = { en, pt, ru };
const SUPPORTED_LANGS = ['en', 'pt', 'ru'];
const STORAGE_KEY = 'lumo-lang';

function detectSystemLocale() {
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
}

function getInitialLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  return detectSystemLocale();
}

/**
 * Resolve a dot-notation key from a nested object.
 * e.g. resolve('cart.title', localeObj) → 'Carrinho de Compras'
 */
function resolveKey(key, messages) {
  return key.split('.').reduce((obj, k) => obj?.[k], messages);
}

/**
 * Interpolate dynamic values into a translated string.
 * e.g. interpolate('Found {count} items', { count: 5 }) → 'Found 5 items'
 */
function interpolate(template, variables) {
  if (!template || typeof template !== 'string') return template;
  return Object.entries(variables).reduce((result, [k, v]) => {
    return result.replace(new RegExp(`{${k}}`, 'g'), String(v));
  }, template);
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = useCallback((lang) => {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    setLocaleState(lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key, variables) => {
    // 1. Try current locale
    let message = resolveKey(key, LOCALES[locale]);

    // 2. Fallback to English
    if (!message) {
      message = resolveKey(key, LOCALES.en);
    }

    // 3. Fallback to key itself
    if (!message) {
      return key;
    }

    // 4. Interpolate if variables provided
    if (variables && typeof variables === 'object') {
      return interpolate(message, variables);
    }

    return message;
  }, [locale]);

  const LOCALE_METADATA = {
    en: { name: 'English', flag: '🇺🇸' },
    pt: { name: 'Português', flag: '🇧🇷' },
    ru: { name: 'Русский', flag: '🇷🇺' }
  };

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    supportedLocales: SUPPORTED_LANGS,
    LOCALES: LOCALE_METADATA
  }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
