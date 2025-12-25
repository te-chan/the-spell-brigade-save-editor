import type { CharacterListProps } from '../../types';
import { CharacterCard } from './CharacterCard';

export function CharacterList({ characters, onCharacterLevelChange }: CharacterListProps) {
  const activeCount = characters.filter(c => c.level > 0).length;

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-[60px] z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 border-b border-slate-200 dark:border-slate-800/50 mb-2">
        <div className="flex justify-between items-end">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Brigade Members
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {activeCount} Active
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
          />
        ))}

        {/* Add Character Button (Coming Soon) */}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent p-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50 dark:hover:bg-surface-card transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          Add Character Slot (Coming Soon)
        </button>
      </div>
    </div>
  );
}
