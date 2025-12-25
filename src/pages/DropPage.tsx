import { useNavigate } from 'react-router-dom';
import { Header, Button, FileDropZone, FileInfoCard } from '../components/ui';
import type { FileInfo, FileLoadStatus } from '../types';

// Presentational Component Props
interface DropPageViewProps {
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  onFileDrop: (file: File) => void;
  onLoadData: () => void;
  onExportSave: () => void;
  onHelpClick: () => void;
}

// Presentational Component (見た目のみ)
export function DropPageView({
  fileInfo,
  loadStatus,
  onFileDrop,
  onLoadData,
  onExportSave,
  onHelpClick,
}: DropPageViewProps) {
  const isLoading = loadStatus === 'loading';
  const isReady = loadStatus === 'ready';

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
            onClick={onExportSave}
            disabled={!isReady}
            className="uppercase tracking-wide"
          >
            Export Save
          </Button>
        </section>
        <div className="h-6" />
      </main>
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

  const handleLoadData = () => {
    if (loadStatus === 'ready') {
      navigate('/edit');
    }
  };

  const handleHelpClick = () => {
    // TODO: ヘルプダイアログを表示
    console.log('Help clicked');
  };

  return (
    <DropPageView
      fileInfo={fileInfo}
      loadStatus={loadStatus}
      onFileDrop={onFileDrop}
      onLoadData={handleLoadData}
      onExportSave={onExportSave}
      onHelpClick={handleHelpClick}
    />
  );
}
