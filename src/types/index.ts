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
  // 新フォーマット(v1.0.x)で導入された Prestige。旧セーブでは undefined
  prestige?: number;
  // 内部キャラ名 (CHARACTER_META.rewardName)。スキン検索等に使用
  internalName?: string;
  // 装備中スキンID（SelectedSkinPerCharacter）。未設定なら defaultSkin
  selectedSkinId?: number;
  // 装備中スキンの表示名（解決済み）。例: "Bell Mage — Variant 1"
  selectedSkinName?: string;
  // このキャラの Prestige スキン表示名（unlocked 判定はprestige>0で UI 側）
  prestigeSkinName?: string;
  // RankProgressPerCharacter に entry が無い = まだロック中
  locked?: boolean;
  // ロック中のときに表示する解除コスト (Gold)。CHARACTER_META.initialCost 由来
  initialCost?: number;
}

// キャラクターアイコンタイプ
export type CharacterIconType = 'fire' | 'water' | 'lightning' | 'earth' | 'wind' | 'light' | 'dark';

// ファイル情報
export interface FileInfo {
  name: string;
  size: number;
  lastModified: Date;
}

// save_meta の解析結果
export interface SaveMetaInfo {
  fileName: string;
  activeSlot: number;
  // 後で active_slot を書き換えてエクスポートしたい場合に備え rawText を保持
  rawText: string;
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
export type FileDropZoneMode = 'meta' | 'slot' | 'legacy';

export interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
  isLoading?: boolean;
  mode?: FileDropZoneMode;
  // mode='slot' のときに表示する「推奨スロット番号」(active_slot)
  hintActiveSlot?: number;
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
  onPrestigeChange?: (prestige: number) => void;
  onUnlock?: () => void;
}

// CharacterList
export interface CharacterListProps {
  characters: Character[];
  onCharacterLevelChange: (characterId: string, level: number) => void;
  onCharacterPrestigeChange?: (characterId: string, prestige: number) => void;
  onCharacterUnlock?: (characterId: string) => void;
}

// AchievementEditor
export interface AchievementEditorProps {
  achievements: Achievement[];
  onAchievementToggle: (achievementId: number, unlocked: boolean) => void;
}
