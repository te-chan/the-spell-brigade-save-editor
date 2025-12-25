import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DropPage, EditPage } from './pages';
import { useSaveEditor } from './hooks';

function AppContent() {
  const {
    saveData,
    fileInfo,
    loadStatus,
    hasChanges,
    loadFile,
    updateGold,
    updateCharacterLevel,
    updateAchievement,
    exportSave,
    resetChanges,
  } = useSaveEditor();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DropPage
            fileInfo={fileInfo}
            loadStatus={loadStatus}
            onFileDrop={loadFile}
            onExportSave={exportSave}
          />
        }
      />
      <Route
        path="/edit"
        element={
          <EditPage
            saveData={saveData}
            hasChanges={hasChanges}
            onSave={exportSave}
            onReset={resetChanges}
            onGoldChange={updateGold}
            onCharacterLevelChange={updateCharacterLevel}
            onAchievementToggle={updateAchievement}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
