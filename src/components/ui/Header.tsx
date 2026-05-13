import type { HeaderProps } from '../../types';
import { IconButton } from './IconButton';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onBack && (
          <IconButton icon="arrow_back" onClick={onBack} />
        )}
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 truncate">
          {title}
        </h2>
      </div>
      <div className="flex items-center justify-end pl-4 gap-1">
        <LanguageSwitcher />
        {rightAction}
      </div>
    </header>
  );
}
