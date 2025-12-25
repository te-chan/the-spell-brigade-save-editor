import type { ButtonProps } from '../../types';

const variantStyles = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
  secondary: 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#232f48]',
  ghost: 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-14 px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        flex items-center justify-center gap-2 rounded-xl font-bold
        active:scale-95 transition-all
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </button>
  );
}
