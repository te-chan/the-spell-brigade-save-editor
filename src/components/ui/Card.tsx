import type { CardProps } from '../../types';

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-surface-card
        rounded-xl shadow-sm
        border border-slate-200 dark:border-slate-800
        ${className}
      `}
    >
      {children}
    </div>
  );
}
