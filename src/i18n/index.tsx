import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { en, type Dict } from './locales/en';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';

export const LOCALES = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
const STORAGE_KEY = 'tsb-locale';

const DICTS: Record<Locale, Dict> = {
  en,
  ja,
  ko,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
};

const BROWSER_LANG_MAP: Array<[RegExp, Locale]> = [
  [/^ja/i, 'ja'],
  [/^ko/i, 'ko'],
  [/^zh[-_](hant|tw|hk|mo)/i, 'zh-TW'],
  [/^zh/i, 'zh-CN'],
  [/^en/i, 'en'],
];

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    for (const [re, locale] of BROWSER_LANG_MAP) {
      if (re.test(lang)) return locale;
    }
  }
  return DEFAULT_LOCALE;
}

export function getStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (LOCALES as readonly string[]).includes(v)) return v as Locale;
  } catch {
    // localStorage disabled
  }
  return null;
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function parseLocaleFromPath(pathname: string): { locale: Locale; rest: string } {
  const segments = pathname.replace(/^\/+/, '').split('/');
  const first = segments[0] ?? '';
  for (const loc of LOCALES) {
    if (loc === 'en') continue;
    if (first === loc) {
      const rest = '/' + segments.slice(1).join('/');
      return { locale: loc, rest: rest === '/' ? '/' : rest };
    }
  }
  return { locale: 'en', rest: pathname || '/' };
}

export function pathForLocale(locale: Locale, rest: string): string {
  const cleanRest = rest.startsWith('/') ? rest : '/' + rest;
  if (locale === 'en') return cleanRest;
  const trimmed = cleanRest === '/' ? '' : cleanRest;
  return `/${locale}${trimmed}`;
}

export function pickInitialLocale(): Locale {
  return getStoredLocale() ?? detectBrowserLocale();
}

// ---------- Type-safe key paths ----------
type DotPath<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends Record<string, unknown>
      ? DotPath<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

export type TKey = DotPath<Dict>;

function lookup(dict: Dict, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
}

function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = params[k];
    return v === undefined ? `{${k}}` : String(v);
  });
}

// ---------- Context ----------
type I18nContextValue = {
  locale: Locale;
  t: (key: TKey, params?: Record<string, string | number>) => string;
  changeLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dict = DICTS[locale];

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) =>
      format(lookup(dict, key), params),
    [dict]
  );

  const changeLocale = useCallback(
    (next: Locale) => {
      storeLocale(next);
      const { rest } = parseLocaleFromPath(location.pathname);
      navigate(pathForLocale(next, rest) + location.search + location.hash, { replace: true });
    },
    [navigate, location]
  );

  useEffect(() => {
    syncDocumentMeta(locale, dict, location.pathname);
  }, [locale, dict, location.pathname]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t, changeLocale }),
    [locale, t, changeLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}

// ---------- Document head sync (SEO) ----------
const SITE_ORIGIN = 'https://te-chan.github.io';
const SITE_BASE = '/the-spell-brigade-save-editor';

const HREFLANG_MAP: Record<Locale, string> = {
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
};

function ensureTag(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
  const el = ensureTag(`meta[${attr}="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, name);
    return m;
  });
  el.setAttribute('content', content);
}

function buildLocaleUrl(locale: Locale, rest: string): string {
  const path = SITE_BASE + pathForLocale(locale, rest);
  return `${SITE_ORIGIN}${path.endsWith('/') ? path : path + '/'}`;
}

function syncDocumentMeta(locale: Locale, dict: Dict, pathname: string) {
  document.documentElement.lang = HREFLANG_MAP[locale];

  document.title = dict.app.metaTitle;
  setMeta('description', dict.app.metaDescription);
  setMeta('og:title', dict.app.metaTitle, 'property');
  setMeta('og:description', dict.app.metaDescription, 'property');
  setMeta('og:locale', locale.replace('-', '_'), 'property');
  setMeta('twitter:title', dict.app.metaTitle);
  setMeta('twitter:description', dict.app.metaDescription);

  const { rest } = parseLocaleFromPath(pathname);
  const canonicalHref = buildLocaleUrl(locale, rest);
  const canonical = ensureTag('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.rel = 'canonical';
    return l;
  }) as HTMLLinkElement;
  canonical.href = canonicalHref;

  setMeta('og:url', canonicalHref, 'property');
  setMeta('twitter:url', canonicalHref);

  document.head.querySelectorAll('link[rel="alternate"][data-i18n="1"]').forEach((n) => n.remove());
  for (const loc of LOCALES) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = HREFLANG_MAP[loc];
    link.href = buildLocaleUrl(loc, rest);
    link.setAttribute('data-i18n', '1');
    document.head.appendChild(link);
  }
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = buildLocaleUrl('en', '/');
  xDefault.setAttribute('data-i18n', '1');
  document.head.appendChild(xDefault);
}
