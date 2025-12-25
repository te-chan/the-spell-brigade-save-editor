import { useState } from 'react';
import type { AchievementEditorProps, Achievement } from '../../types';

// カテゴリの表示名
const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  RELICS: 'Relics',
  WIZARDS: 'Wizards',
  MISSION: 'Missions',
  MICS: 'Miscellaneous',
  OUTFITS: 'Outfits',
};

// カテゴリアイコン
const CATEGORY_ICONS: Record<Achievement['category'], string> = {
  RELICS: 'diamond',
  WIZARDS: 'auto_fix_high',
  MISSION: 'flag',
  MICS: 'star',
  OUTFITS: 'checkroom',
};

export function AchievementEditor({ achievements, onAchievementToggle }: AchievementEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<Achievement['category']>>(
    new Set(['RELICS', 'WIZARDS', 'MISSION', 'MICS', 'OUTFITS'])
  );

  // カテゴリでグループ化
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<Achievement['category'], Achievement[]>);

  const toggleCategory = (category: Achievement['category']) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categories: Achievement['category'][] = ['RELICS', 'WIZARDS', 'MISSION', 'MICS', 'OUTFITS'];

  // 統計計算
  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  // 一括操作
  const unlockAll = () => {
    achievements.forEach(a => {
      if (!a.unlocked) {
        onAchievementToggle(a.id, true);
      }
    });
  };

  const lockAll = () => {
    achievements.forEach(a => {
      if (a.unlocked) {
        onAchievementToggle(a.id, false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="px-4 pb-2 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Achievements
          </h3>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
            {totalUnlocked} / {totalAchievements}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={unlockAll}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded transition-colors"
          >
            Unlock All
          </button>
          <button
            onClick={lockAll}
            className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded transition-colors"
          >
            Lock All
          </button>
        </div>
      </div>

      {/* カテゴリごとの実績リスト */}
      <div className="space-y-3 px-4">
        {categories.map(category => {
          const categoryAchievements = groupedAchievements[category] || [];
          if (categoryAchievements.length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;

          return (
            <div
              key={category}
              className="bg-surface-card border border-surface-border rounded-xl overflow-hidden"
            >
              {/* カテゴリヘッダー */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-text-muted">
                    {CATEGORY_ICONS[category]}
                  </span>
                  <span className="font-semibold text-white">{CATEGORY_LABELS[category]}</span>
                  <span className="text-xs text-text-muted">
                    {unlockedCount}/{categoryAchievements.length}
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-muted transition-transform duration-200"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>

              {/* 実績リスト */}
              {isExpanded && (
                <div className="border-t border-surface-border">
                  {categoryAchievements.map((achievement, idx) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        idx !== categoryAchievements.length - 1 ? 'border-b border-surface-border/50' : ''
                      } hover:bg-white/5 transition-colors`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${achievement.unlocked ? 'text-white' : 'text-text-muted'}`}>
                            {achievement.name}
                          </span>
                          <span className="text-xs text-slate-500">#{achievement.id}</span>
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                      {/* トグルスイッチ */}
                      <button
                        onClick={() => onAchievementToggle(achievement.id, !achievement.unlocked)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          achievement.unlocked ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                            achievement.unlocked ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
