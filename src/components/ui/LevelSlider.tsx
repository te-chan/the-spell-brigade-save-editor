import { useCallback } from 'react';
import type { LevelSliderProps } from '../../types';

export function LevelSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  isMaxed = false,
}: LevelSliderProps) {
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(newValue, max)));
    }
  }, [min, max, onChange]);

  const baseClasses = isMaxed
    ? 'accent-amber-500'
    : 'accent-primary';

  const inputClasses = isMaxed
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 focus:border-amber-500 focus:ring-amber-500'
    : 'border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-xs font-bold uppercase tracking-wider ${isMaxed ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
          {isMaxed ? 'Max Level Reached' : 'Level'}
        </label>
        {!isMaxed && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            Max {max}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Slider Container */}
        <div className="flex-1 relative h-6 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleSliderChange}
            className={`w-full h-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 ${baseClasses} ${isMaxed ? 'bg-amber-500/20' : 'bg-slate-200 dark:bg-background-dark'}`}
          />
        </div>
        {/* Number Input */}
        <div className="w-16">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-2 py-1 text-center text-sm font-bold outline-none focus:ring-1 ${inputClasses}`}
          />
        </div>
      </div>
    </div>
  );
}
