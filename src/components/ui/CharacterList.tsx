import type { CharacterListProps } from '../../types';
import { CharacterCard } from './CharacterCard';

export function CharacterList({
  characters,
  onCharacterLevelChange,
  onCharacterPrestigeChange,
  onCharacterUnlock,
}: CharacterListProps) {
  const unlockedCount = characters.filter((c) => !c.locked).length;
  const lockedCount = characters.length - unlockedCount;

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-[60px] z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 border-b border-slate-200 dark:border-slate-800/50 mb-2">
        <div className="flex justify-between items-end">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Brigade Members
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {unlockedCount} Unlocked
            {lockedCount > 0 && (
              <span className="ml-1.5 opacity-70">&middot; {lockedCount} Locked</span>
            )}
          </p>
        </div>
      </div>

      {/* Character List */}
      <div className="flex flex-col gap-3 px-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onLevelChange={(level) => onCharacterLevelChange(character.id, level)}
            onPrestigeChange={
              onCharacterPrestigeChange
                ? (prestige) => onCharacterPrestigeChange(character.id, prestige)
                : undefined
            }
            onUnlock={onCharacterUnlock ? () => onCharacterUnlock(character.id) : undefined}
          />
        ))}

      </div>
    </div>
  );
}
