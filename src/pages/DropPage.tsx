import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Button, FileDropZone, FileInfoCard, ConfirmDialog } from '../components/ui';
import type { FileInfo, FileLoadStatus } from '../types';

// Presentational Component Props
interface DropPageViewProps {
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  showConfirmDialog: boolean;
  onFileDrop: (file: File) => void;
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
  onFileDrop,
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
        {/* Drag and Drop Zone */}
        <section className="flex flex-col flex-1 justify-center">
          <FileDropZone onFileDrop={onFileDrop} isLoading={isLoading} />

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
  onFileDrop: (file: File) => void;
  onExportSave: () => void;
}

// Container Component (データ管理 + ナビゲーション)
export function DropPage({ fileInfo, loadStatus, onFileDrop, onExportSave }: DropPageProps) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLoadData = () => {
    if (loadStatus === 'ready') {
      navigate('/edit');
    }
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
      onFileDrop={onFileDrop}
      onLoadData={handleLoadData}
      onExportClick={handleExportClick}
      onExportConfirm={handleExportConfirm}
      onExportCancel={handleExportCancel}
      onHelpClick={handleHelpClick}
    />
  );
}
