// ES3 Modifier結果型
export interface ModificationResult {
  success: boolean;
  newRawText: string;
  error?: string;
}

// ES3 検証結果型
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// 実績情報
export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: 'RELICS' | 'WIZARDS' | 'MISSION' | 'MICS' | 'OUTFITS';
  unlocked: boolean;
}

// セーブデータ全体の型定義
export interface SaveData {
  gold: number;
  characters: Character[];
  achievements: Achievement[];
}

// キャラクター情報
export interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  maxLevel: number;
  avatarUrl?: string;
  iconType?: CharacterIconType;
}

// キャラクターアイコンタイプ
export type CharacterIconType = 'fire' | 'water' | 'lightning' | 'earth' | 'wind' | 'light' | 'dark';

// ファイル情報
export interface FileInfo {
  name: string;
  size: number;
  lastModified: Date;
}

// ファイル読み込み状態
export type FileLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

// ページ間で共有するコンテキストの型
export interface EditorContextType {
  saveData: SaveData | null;
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  loadFile: (file: File) => Promise<void>;
  updateGold: (gold: number) => void;
  updateCharacterLevel: (characterId: string, level: number) => void;
  exportSave: () => void;
  resetChanges: () => void;
}

// コンポーネントProps型定義

// Header
export interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children?: React.ReactNode;
}

// IconButton
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

// Card
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// NumberInput
export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  showMaxButton?: boolean;
}

// LevelSlider
export interface LevelSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  isMaxed?: boolean;
}

// FileDropZone
export interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
  isLoading?: boolean;
}

// FileInfoCard
export interface FileInfoCardProps {
  fileInfo: FileInfo | null;
  status: FileLoadStatus;
}

// GoldEditor
export interface GoldEditorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// CharacterCard
export interface CharacterCardProps {
  character: Character;
  onLevelChange: (level: number) => void;
}

// CharacterList
export interface CharacterListProps {
  characters: Character[];
  onCharacterLevelChange: (characterId: string, level: number) => void;
}

// AchievementEditor
export interface AchievementEditorProps {
  achievements: Achievement[];
  onAchievementToggle: (achievementId: number, unlocked: boolean) => void;
}
