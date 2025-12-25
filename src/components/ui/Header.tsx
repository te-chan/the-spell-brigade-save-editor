import type { HeaderProps } from '../../types';
import { IconButton } from './IconButton';

export function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 flex-1">
        {onBack && (
          <IconButton icon="arrow_back" onClick={onBack} />
        )}
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 truncate">
          {title}
        </h2>
      </div>
      {rightAction && (
        <div className="flex items-center justify-end pl-4">
          {rightAction}
        </div>
      )}
    </header>
  );
}
