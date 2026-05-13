import type { FileInfoCardProps, FileLoadStatus } from '../../types';
import { useTranslation } from '../../i18n';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LOCALE_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

function formatDate(date: Date, locale: string, todayLabel: (time: string) => string): string {
  const bcp47 = LOCALE_TO_BCP47[locale] ?? 'en-US';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString(bcp47, { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return todayLabel(timeStr);
  }
  return date.toLocaleDateString(bcp47, { month: 'short', day: 'numeric' }) + ' ' + timeStr;
}

function useStatusInfo(status: FileLoadStatus): { label: string; color: string } {
  const { t } = useTranslation();
  switch (status) {
    case 'ready':
      return { label: t('fileInfo.statusReady'), color: 'text-primary' };
    case 'loading':
      return { label: t('fileInfo.statusLoading'), color: 'text-amber-500' };
    case 'error':
      return { label: t('fileInfo.statusError'), color: 'text-red-500' };
    default:
      return { label: t('fileInfo.statusIdle'), color: 'text-slate-500' };
  }
}

export function FileInfoCard({ fileInfo, status }: FileInfoCardProps) {
  const { t, locale } = useTranslation();
  const statusInfo = useStatusInfo(status);
  const todayLabel = (time: string) => t('fileInfo.today', { time });

  if (!fileInfo && status === 'idle') {
    return (
      <section className="mt-6 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider opacity-70">
            {t('fileInfo.currentFile')}
          </h3>
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark px-4 py-3 rounded-lg border border-slate-200 dark:border-surface-border shadow-sm opacity-50">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-white flex items-center justify-center rounded-lg bg-slate-500/20 shrink-0 size-12">
              <span className="material-symbols-outlined text-slate-500">description</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-normal">
                {t('fileInfo.noFileSelected')}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider opacity-70">
          {t('fileInfo.currentFile')}
        </h3>
        <span className={`text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
      <div className="flex items-center gap-4 bg-white dark:bg-surface-dark px-4 py-3 rounded-lg border border-slate-200 dark:border-surface-border shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-white flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12">
            <span className="material-symbols-outlined text-primary">description</span>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-slate-900 dark:text-white text-base font-medium leading-normal line-clamp-1 font-display">
              {fileInfo?.name ?? t('fileInfo.unknownFile')}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 dark:text-text-muted text-xs font-normal leading-normal">
                {fileInfo ? formatFileSize(fileInfo.size) : '—'}
              </p>
              <span className="size-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <p className="text-slate-500 dark:text-text-muted text-xs font-normal leading-normal">
                {t('fileInfo.modifiedLabel')}: {fileInfo ? formatDate(fileInfo.lastModified, locale, todayLabel) : '—'}
              </p>
            </div>
          </div>
        </div>
        {status === 'ready' && (
          <div className="shrink-0">
            <button className="text-emerald-500 flex size-8 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
