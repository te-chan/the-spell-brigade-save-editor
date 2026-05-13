import type { CharacterCardProps, CharacterIconType } from '../../types';
import { LevelSlider } from './LevelSlider';
import { useTranslation } from '../../i18n';

const iconMap: Record<CharacterIconType, string> = {
  fire: 'local_fire_department',
  water: 'water_drop',
  lightning: 'bolt',
  earth: 'landscape',
  wind: 'air',
  light: 'light_mode',
  dark: 'dark_mode',
};

export function CharacterCard({ character, onLevelChange, onPrestigeChange, onUnlock }: CharacterCardProps) {
  const { t } = useTranslation();
  const isMaxed = character.level >= character.maxLevel;
  const iconName = character.iconType ? iconMap[character.iconType] : 'person';

  // 新フォーマット(v1.0.x)以降のセーブのみ Prestige を表示する
  const supportsPrestige = character.prestige !== undefined;
  const prestige = character.prestige ?? 0;
  const isLocked = character.locked === true;

  const handlePrestigeDecrement = () => {
    if (!onPrestigeChange) return;
    onPrestigeChange(Math.max(0, prestige - 1));
  };

  const handlePrestigeIncrement = () => {
    if (!onPrestigeChange) return;
    onPrestigeChange(prestige + 1);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-4 shadow-sm border transition-all ${
        isLocked
          ? 'bg-slate-50 dark:bg-surface-card/40 border-dashed border-slate-300 dark:border-slate-700'
          : 'bg-white dark:bg-surface-card border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50'
      }`}
    >
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
          className={`h-16 w-16 shrink-0 rounded-lg bg-cover bg-center shadow-inner border ${
            isLocked
              ? 'border-slate-300 dark:border-slate-700 opacity-50 grayscale'
              : isMaxed
                ? 'border-amber-500/30'
                : 'border-slate-200 dark:border-slate-700'
          }`}
          style={character.avatarUrl ? { backgroundImage: `url('${character.avatarUrl}')` } : undefined}
        >
          {!character.avatarUrl && (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined text-slate-400 text-2xl">
                {isLocked ? 'lock' : 'person'}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-base font-bold ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
              {character.name}
            </h4>
            {isLocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5">
                <span className="material-symbols-outlined text-sm">lock</span>
                {t('character.locked')}
              </span>
            )}
            {!isLocked && isMaxed && (
              <span className="material-symbols-outlined text-amber-500 text-sm" title={t('character.maxLevelTitle')}>
                star
              </span>
            )}
            {!isLocked && supportsPrestige && prestige > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 text-xs font-bold px-2 py-0.5" title={t('character.prestige')}>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                P{prestige}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-text-muted">
            {t('character.classLabel')}: {character.characterClass} &bull; {t('character.idLabel')}: #{character.id}
            {isLocked && character.initialCost !== undefined && character.initialCost > 0 && (
              <> &bull; {t('character.costLabel')}: {character.initialCost.toLocaleString()} G</>
            )}
          </p>
          {!isLocked && character.selectedSkinName && (
            <p className="text-xs font-medium text-slate-500 dark:text-text-muted flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-sm">checkroom</span>
              <span title={t('character.skinIdTitle', { id: character.selectedSkinId ?? '' })}>
                {character.selectedSkinName}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Unlock button (ロック中) — Level/Prestige UIの代わりに表示 */}
      {isLocked && onUnlock && (
        <div className="relative z-10 mt-5">
          <button
            type="button"
            onClick={onUnlock}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 border border-primary/30 hover:border-primary text-primary font-bold py-2.5 transition-all"
          >
            <span className="material-symbols-outlined text-base">lock_open</span>
            {t('character.unlockButton', { name: character.name })}
          </button>
          <p className="mt-1.5 text-[10px] text-center text-slate-400 dark:text-slate-500">
            {t('character.unlockHint')}
          </p>
        </div>
      )}

      {/* Level Slider (アンロック済みのみ) */}
      {!isLocked && (
        <div className="relative z-10 mt-5">
          <LevelSlider
            value={character.level}
            onChange={onLevelChange}
            min={1}
            max={character.maxLevel}
            isMaxed={isMaxed}
          />
        </div>
      )}

      {/* Prestige Editor (新フォーマットのみ・アンロック済みのみ) */}
      {!isLocked && supportsPrestige && onPrestigeChange && (
        <div className="relative z-10 mt-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-500 text-base">auto_awesome</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('character.prestige')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrestigeDecrement}
                disabled={prestige <= 0}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t('character.decrementPrestige')}
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white w-6 text-center">
                {prestige}
              </span>
              <button
                type="button"
                onClick={handlePrestigeIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                aria-label={t('character.incrementPrestige')}
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>
          {/* Prestige skin unlock hint */}
          {character.prestigeSkinName && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`material-symbols-outlined text-sm ${prestige > 0 ? 'text-violet-500' : 'text-slate-400 dark:text-slate-500'}`}>
                {prestige > 0 ? 'lock_open' : 'lock'}
              </span>
              <span className={prestige > 0 ? 'text-violet-700 dark:text-violet-300 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                {character.prestigeSkinName}
              </span>
              {prestige > 0 && character.selectedSkinId !== undefined && character.prestigeSkinName && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('character.unlocked')}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
