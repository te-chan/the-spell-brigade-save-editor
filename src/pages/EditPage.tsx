import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Button, Card, GoldEditor, CharacterList, AchievementEditor, ConfirmDialog } from '../components/ui';
import type { SaveData } from '../types';

// Presentational Component Props
interface EditPageViewProps {
  saveData: SaveData;
  hasChanges: boolean;
  showConfirmDialog: boolean;
  onBack: () => void;
  onSaveClick: () => void;
  onSaveConfirm: () => void;
  onSaveCancel: () => void;
  onReset: () => void;
  onGoldChange: (gold: number) => void;
  onCharacterLevelChange: (characterId: string, level: number) => void;
  onAchievementToggle: (achievementId: number, unlocked: boolean) => void;
}

// Presentational Component (見た目のみ)
export function EditPageView({
  saveData,
  hasChanges,
  showConfirmDialog,
  onBack,
  onSaveClick,
  onSaveConfirm,
  onSaveCancel,
  onReset,
  onGoldChange,
  onCharacterLevelChange,
  onAchievementToggle,
}: EditPageViewProps) {
  return (
    <div className="relative flex flex-col min-h-screen max-w-7xl mx-auto">
      <Header
        title="Save Editor"
        onBack={onBack}
        rightAction={
          <Button
            variant="primary"
            size="md"
            onClick={onSaveClick}
            disabled={!hasChanges}
          >
            Save
          </Button>
        }
      />

      <main className="flex-1 pb-24">
        {/* 2カラムレイアウト（デスクトップ） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4 lg:px-8">
          {/* 左カラム: リソース + キャラクター */}
          <div className="space-y-6">
            {/* Resources Section Header */}
            <div className="pb-2 pt-6 flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                Global Resources
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                Read-only metadata
              </span>
            </div>

            {/* Gold Editor */}
            <div className="py-2">
              <GoldEditor
                value={saveData.gold}
                onChange={onGoldChange}
                min={0}
                max={999999}
              />
            </div>

            {/* Character List */}
            <CharacterList
              characters={saveData.characters}
              onCharacterLevelChange={onCharacterLevelChange}
            />
          </div>

          {/* 右カラム: 実績 */}
          <div className="lg:border-l lg:border-surface-border lg:pl-8">
            <AchievementEditor
              achievements={saveData.achievements}
              onAchievementToggle={onAchievementToggle}
            />
          </div>
        </div>

        <div className="h-10" />
      </main>

      {/* Floating Reset Button */}
      {hasChanges && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-full bg-slate-900/90 dark:bg-white/10 backdrop-blur-md px-5 py-2.5 shadow-xl ring-1 ring-white/10 pointer-events-auto transform transition-transform active:scale-95 cursor-pointer hover:bg-slate-800 dark:hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-white text-xl">restart_alt</span>
            <span className="text-sm font-bold text-white">Reset Changes</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Warning"
        message="This data may cause unexpected game behavior or significantly disrupt your game experience. Also, this data does not represent your actual skill. Do you acknowledge this?"
        confirmLabel="I Understand"
        cancelLabel="Cancel"
        onConfirm={onSaveConfirm}
        onCancel={onSaveCancel}
      />
    </div>
  );
}

// Container Component Props
interface EditPageProps {
  saveData: SaveData | null;
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  onGoldChange: (gold: number) => void;
  onCharacterLevelChange: (characterId: string, level: number) => void;
  onAchievementToggle: (achievementId: number, unlocked: boolean) => void;
}

// Container Component (データ管理 + ナビゲーション)
export function EditPage({
  saveData,
  hasChanges,
  onSave,
  onReset,
  onGoldChange,
  onCharacterLevelChange,
  onAchievementToggle,
}: EditPageProps) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleSaveConfirm = () => {
    setShowConfirmDialog(false);
    onSave();
  };

  const handleSaveCancel = () => {
    setShowConfirmDialog(false);
  };

  if (!saveData) {
    return (
      <div className="flex flex-col min-h-screen max-w-7xl mx-auto items-center justify-center">
        <Card className="p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">error</span>
          <p className="text-slate-600 dark:text-slate-400">No save data loaded</p>
          <Button variant="primary" onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <EditPageView
      saveData={saveData}
      hasChanges={hasChanges}
      showConfirmDialog={showConfirmDialog}
      onBack={handleBack}
      onSaveClick={handleSaveClick}
      onSaveConfirm={handleSaveConfirm}
      onSaveCancel={handleSaveCancel}
      onReset={onReset}
      onGoldChange={onGoldChange}
      onCharacterLevelChange={onCharacterLevelChange}
      onAchievementToggle={onAchievementToggle}
    />
  );
}
