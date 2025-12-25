import type { CharacterCardProps, CharacterIconType } from '../../types';
import { LevelSlider } from './LevelSlider';

const iconMap: Record<CharacterIconType, string> = {
  fire: 'local_fire_department',
  water: 'water_drop',
  lightning: 'bolt',
  earth: 'landscape',
  wind: 'air',
  light: 'light_mode',
  dark: 'dark_mode',
};

export function CharacterCard({ character, onLevelChange }: CharacterCardProps) {
  const isMaxed = character.level >= character.maxLevel;
  const iconName = character.iconType ? iconMap[character.iconType] : 'person';

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-surface-card p-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-primary/50 dark:hover:border-primary/50">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-2 opacity-50">
        <span className={`material-symbols-outlined text-6xl rotate-12 select-none ${isMaxed ? 'text-amber-500/20' : 'text-slate-300 dark:text-slate-600'}`}>
          {iconName}
        </span>
      </div>

      {/* Character Info */}
      <div className="relative z-10 flex gap-4">
        {/* Avatar */}
        <div
          className={`h-16 w-16 shrink-0 rounded-lg bg-cover bg-center shadow-inner border ${isMaxed ? 'border-amber-500/30' : 'border-slate-200 dark:border-slate-700'}`}
          style={character.avatarUrl ? { backgroundImage: `url('${character.avatarUrl}')` } : undefined}
        >
          {!character.avatarUrl && (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {character.name}
            </h4>
            {isMaxed && (
              <span className="material-symbols-outlined text-amber-500 text-sm" title="Max Level">
                star
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-text-muted">
            Class: {character.characterClass} &bull; ID: #{character.id}
          </p>
        </div>
      </div>

      {/* Level Slider */}
      <div className="relative z-10 mt-5">
        <LevelSlider
          value={character.level}
          onChange={onLevelChange}
          min={1}
          max={character.maxLevel}
          isMaxed={isMaxed}
        />
      </div>
    </div>
  );
}
