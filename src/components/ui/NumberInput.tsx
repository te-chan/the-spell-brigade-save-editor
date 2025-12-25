import { useCallback } from 'react';
import type { NumberInputProps } from '../../types';

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999999,
  label,
  showMaxButton = false,
}: NumberInputProps) {
  const handleIncrement = useCallback(() => {
    onChange(Math.min(value + 1, max));
  }, [value, max, onChange]);

  const handleDecrement = useCallback(() => {
    onChange(Math.max(value - 1, min));
  }, [value, min, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(newValue, max)));
    }
  }, [min, max, onChange]);

  const handleMax = useCallback(() => {
    onChange(max);
  }, [max, onChange]);

  return (
    <label className="flex flex-col gap-3">
      {(label || showMaxButton) && (
        <div className="flex justify-between items-center">
          {label && (
            <p className="text-slate-700 dark:text-slate-200 text-base font-bold leading-normal flex items-center gap-2">
              {label}
            </p>
          )}
          {showMaxButton && (
            <button
              type="button"
              onClick={handleMax}
              className="text-xs text-primary font-medium cursor-pointer hover:underline"
            >
              Max out
            </button>
          )}
        </div>
      )}
      <div className="relative flex w-full items-stretch">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-slate-100 dark:bg-[#232f48] text-slate-500 dark:text-slate-400 hover:text-primary active:bg-slate-200 dark:active:bg-surface-border z-10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">remove</span>
        </button>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          className="flex w-full flex-1 resize-none rounded-lg text-center font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-background-dark h-12 placeholder:text-slate-400 px-12"
        />
        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-slate-100 dark:bg-[#232f48] text-slate-500 dark:text-slate-400 hover:text-primary active:bg-slate-200 dark:active:bg-surface-border z-10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Min: {min.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
    </label>
  );
}
