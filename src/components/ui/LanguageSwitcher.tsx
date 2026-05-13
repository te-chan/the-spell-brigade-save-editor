import { useEffect, useRef, useState } from 'react';
import { LOCALES, useTranslation, type Locale } from '../../i18n';

export function LanguageSwitcher() {
  const { locale, changeLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (next: Locale) => {
    setOpen(false);
    if (next !== locale) changeLocale(next);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-3 h-10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.label')}
      >
        <span className="material-symbols-outlined text-xl">language</span>
        <span className="text-xs font-bold uppercase tracking-wider">{locale}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-12 z-50 min-w-[10rem] rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-xl py-1"
        >
          {LOCALES.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                onClick={() => handleSelect(loc)}
                aria-selected={loc === locale}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between gap-3 ${
                  loc === locale ? 'text-primary font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{t(`language.${loc}` as const)}</span>
                {loc === locale && (
                  <span className="material-symbols-outlined text-base">check</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
