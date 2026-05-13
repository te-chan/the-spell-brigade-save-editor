import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Button, FileDropZone, FileInfoCard, ConfirmDialog } from '../components/ui';
import type { FileInfo, FileLoadStatus, SaveMetaInfo } from '../types';

// Presentational Component Props
interface DropPageViewProps {
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  showConfirmDialog: boolean;
  // save_meta フロー (任意)
  metaInfo: SaveMetaInfo | null;
  metaError: string | null;
  metaSkipped: boolean;
  slotMismatchWarning: string | null;
  onMetaFileDrop: (file: File) => void;
  onSlotFileDrop: (file: File) => void;
  onSkipMeta: () => void;
  onResetMeta: () => void;
  onLoadData: () => void;
  onExportClick: () => void;
  onExportConfirm: () => void;
  onExportCancel: () => void;
  onHelpClick: () => void;
}

// Presentational Component (見た目のみ)
export function DropPageView({
  fileInfo,
  loadStatus,
  showConfirmDialog,
  metaInfo,
  metaError,
  metaSkipped,
  slotMismatchWarning,
  onMetaFileDrop,
  onSlotFileDrop,
  onSkipMeta,
  onResetMeta,
  onLoadData,
  onExportClick,
  onExportConfirm,
  onExportCancel,
  onHelpClick,
}: DropPageViewProps) {
  const isLoading = loadStatus === 'loading';
  const isReady = loadStatus === 'ready';
  const [copied, setCopied] = useState(false);
  const savePath = '%USERPROFILE%\\AppData\\LocalLow\\BoltBlasterGames\\TheSpellBrigade';

  const handleCopyPath = async () => {
    await navigator.clipboard.writeText(savePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 現在のウィザードステップを決定:
  //   step 1 (meta)  → save_meta を選ばせる
  //   step 2 (slot)  → save_slot_N を選ばせる（meta解析済み or skip後）
  const inSlotStep = metaInfo !== null || metaSkipped;

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto px-4">
      <Header
        title="Save Editor"
        rightAction={
          <button
            onClick={onHelpClick}
            className="flex items-center justify-center rounded-full size-10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">help</span>
          </button>
        }
      />

      <main className="flex-1 flex flex-col p-4 w-full h-full">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          <span className={inSlotStep ? '' : 'text-primary font-bold'}>1. save_meta</span>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className={inSlotStep ? 'text-primary font-bold' : ''}>2. save_slot_N</span>
        </div>

        {/* Drag and Drop Zone */}
        <section className="flex flex-col flex-1 justify-center">
          {!inSlotStep ? (
            <>
              <FileDropZone onFileDrop={onMetaFileDrop} isLoading={false} mode="meta" />
              {metaError && (
                <p className="mt-3 text-center text-sm text-red-500 dark:text-red-400">
                  {metaError}
                </p>
              )}
              <button
                onClick={onSkipMeta}
                className="mt-3 text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors underline-offset-2 hover:underline self-center"
              >
                Skip — I'll pick the slot file directly
              </button>
            </>
          ) : (
            <>
              {/* Meta status banner */}
              {metaInfo && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">
                      check_circle
                    </span>
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">
                      Active slot: <span className="font-bold">{metaInfo.activeSlot}</span>{' '}
                      <span className="opacity-60">({metaInfo.fileName})</span>
                    </span>
                  </div>
                  <button
                    onClick={onResetMeta}
                    className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
              {metaSkipped && !metaInfo && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Skipped save_meta — pick any save_slot_N file below.
                  </span>
                  <button
                    onClick={onResetMeta}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    Use save_meta
                  </button>
                </div>
              )}

              <FileDropZone
                onFileDrop={onSlotFileDrop}
                isLoading={isLoading}
                mode="slot"
                hintActiveSlot={metaInfo?.activeSlot}
              />

              {slotMismatchWarning && (
                <p className="mt-3 text-center text-sm text-amber-600 dark:text-amber-400">
                  ⚠ {slotMismatchWarning}
                </p>
              )}
            </>
          )}

          {/* Save File Location Guide */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            <p className="mb-2">Save file location:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded text-xs font-mono">
                {savePath}
              </code>
              <button
                onClick={handleCopyPath}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Copy path"
              >
                <span className="material-symbols-outlined text-lg">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs opacity-75">
              Press Win+R → paste the path → Enter to open the folder
            </p>
          </div>
        </section>

        {/* Current File / Status Section */}
        <FileInfoCard fileInfo={fileInfo} status={loadStatus} />

        {/* Action Buttons Group */}
        <section className="grid grid-cols-2 gap-4 mt-auto pt-4">
          <Button
            variant="primary"
            size="lg"
            icon="data_object"
            onClick={onLoadData}
            disabled={!isReady}
            className="uppercase tracking-wide shadow-lg shadow-primary/25"
          >
            Load Data
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon="download"
            onClick={onExportClick}
            disabled={!isReady}
            className="uppercase tracking-wide"
          >
            Export Save
          </Button>
        </section>
        <div className="h-6" />
      </main>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Warning"
        message="This data may cause unexpected game behavior or significantly disrupt your game experience. Also, this data does not represent your actual skill. Do you acknowledge this?"
        confirmLabel="I Understand"
        cancelLabel="Cancel"
        onConfirm={onExportConfirm}
        onCancel={onExportCancel}
      />
    </div>
  );
}

// Container Component Props
interface DropPageProps {
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  metaInfo: SaveMetaInfo | null;
  metaError: string | null;
  onFileDrop: (file: File) => void;
  onMetaFileDrop: (file: File) => void;
  onClearMeta: () => void;
  onExportSave: () => void;
}

// Container Component (データ管理 + ナビゲーション)
export function DropPage({
  fileInfo,
  loadStatus,
  metaInfo,
  metaError,
  onFileDrop,
  onMetaFileDrop,
  onClearMeta,
  onExportSave,
}: DropPageProps) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [metaSkipped, setMetaSkipped] = useState(false);
  const [slotMismatchWarning, setSlotMismatchWarning] = useState<string | null>(null);

  const handleLoadData = () => {
    if (loadStatus === 'ready') {
      navigate('/edit');
    }
  };

  const handleSlotFileDrop = (file: File) => {
    // ファイル名が save_slot_N でない場合は警告 (旧 .es3 やリネーム済みなら通す)
    const slotMatch = file.name.match(/^save_slot_(\d+)$/i);
    if (slotMatch && metaInfo) {
      const slotNum = parseInt(slotMatch[1], 10);
      if (slotNum !== metaInfo.activeSlot) {
        setSlotMismatchWarning(
          `You picked save_slot_${slotNum} but the active slot is ${metaInfo.activeSlot}. Editing it is still fine — just won't be the one the game loads by default.`
        );
      } else {
        setSlotMismatchWarning(null);
      }
    } else if (!slotMatch && !/\.es3$/i.test(file.name)) {
      setSlotMismatchWarning(
        `"${file.name}" doesn't look like a save_slot_N file. Continuing anyway.`
      );
    } else {
      setSlotMismatchWarning(null);
    }
    onFileDrop(file);
  };

  const handleSkipMeta = () => {
    setMetaSkipped(true);
    setSlotMismatchWarning(null);
  };

  const handleResetMeta = () => {
    setMetaSkipped(false);
    setSlotMismatchWarning(null);
    onClearMeta();
  };

  const handleExportClick = () => {
    setShowConfirmDialog(true);
  };

  const handleExportConfirm = () => {
    setShowConfirmDialog(false);
    onExportSave();
  };

  const handleExportCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleHelpClick = () => {
    // TODO: ヘルプダイアログを表示
    console.log('Help clicked');
  };

  return (
    <DropPageView
      fileInfo={fileInfo}
      loadStatus={loadStatus}
      showConfirmDialog={showConfirmDialog}
      metaInfo={metaInfo}
      metaError={metaError}
      metaSkipped={metaSkipped}
      slotMismatchWarning={slotMismatchWarning}
      onMetaFileDrop={onMetaFileDrop}
      onSlotFileDrop={handleSlotFileDrop}
      onSkipMeta={handleSkipMeta}
      onResetMeta={handleResetMeta}
      onLoadData={handleLoadData}
      onExportClick={handleExportClick}
      onExportConfirm={handleExportConfirm}
      onExportCancel={handleExportCancel}
      onHelpClick={handleHelpClick}
    />
  );
}
