import type { IconButtonProps } from '../../types';

const sizeStyles = {
  sm: 'w-6 h-6 text-lg',
  md: 'w-8 h-8 text-xl',
  lg: 'w-10 h-10 text-2xl',
};

export function IconButton({
  icon,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`
        flex items-center justify-center rounded-full
        hover:bg-slate-200 dark:hover:bg-slate-800
        transition-colors text-slate-500 dark:text-slate-400
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
