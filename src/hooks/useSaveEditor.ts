import { useState, useCallback, useMemo } from 'react';
import type { SaveData, FileInfo, FileLoadStatus, Character, Achievement } from '../types';
import { decryptES3, encryptES3 } from '../services/es3Crypto';
import { extractSaveData } from '../services/es3Parser';
import {
  modifyGold,
  modifyCharacterRank,
  modifyChallengeProgress,
  addCharacterRank,
  validateModifiedSave,
} from '../services/es3Modifier';

// モック実績データ（UI表示用のメタデータ）
const ACHIEVEMENT_METADATA: Omit<Achievement, 'unlocked'>[] = [
  // RELICS カテゴリ
  { id: 24, name: 'Artifact 10', description: 'Revive 10 times', category: 'RELICS' },
  { id: 41, name: 'Artifact 11', description: 'Die 30 times', category: 'RELICS' },
  { id: 42, name: 'Artifact 12', description: 'Complete 4 objectives', category: 'RELICS' },
  { id: 43, name: 'Artifact 13', description: 'Reach 80 armor', category: 'RELICS' },
  { id: 44, name: 'Artifact 14', description: 'Reach 201% critical damage', category: 'RELICS' },
  { id: 45, name: 'Artifact 15', description: 'Equip 4 different element spells', category: 'RELICS' },
  { id: 68, name: 'Artifact 16', description: 'Stand still for 900 seconds', category: 'RELICS' },
  { id: 69, name: 'Artifact 17', description: 'Heal from low health', category: 'RELICS' },
  { id: 70, name: 'Artifact 18', description: 'Collect potions within timeframe', category: 'RELICS' },
  { id: 71, name: 'Artifact 19', description: 'Level up within timeframe', category: 'RELICS' },
  { id: 72, name: 'Artifact 20', description: 'Defeat boss without luck improvements', category: 'RELICS' },
  { id: 22, name: 'Artifact 8', description: 'Reroll common store 5 times', category: 'RELICS' },
  { id: 23, name: 'Artifact 9', description: 'Level up 500 times', category: 'RELICS' },
  // WIZARDS カテゴリ
  { id: 62, name: 'Bird Mage', description: 'Equip 50 spells', category: 'WIZARDS' },
  { id: 19, name: 'Campanelli', description: 'Equip 86 spells', category: 'WIZARDS' },
  { id: 74, name: 'Flute Mage', description: 'Play for 400 minutes', category: 'WIZARDS' },
  { id: 20, name: 'Hatty', description: 'Level up 600 times', category: 'WIZARDS' },
  { id: 16, name: 'Key Mage', description: 'Play for 240 minutes', category: 'WIZARDS' },
  { id: 18, name: 'Ludwig', description: 'Equip 36 spells', category: 'WIZARDS' },
  { id: 15, name: 'Moon Mage', description: 'Level up 180 times', category: 'WIZARDS' },
  { id: 65, name: 'Plant Mage', description: 'Play for 343 minutes', category: 'WIZARDS' },
  { id: 52, name: 'Smithy', description: 'Level up 360 times', category: 'WIZARDS' },
  { id: 46, name: 'Star Mage', description: 'Play for 273 minutes', category: 'WIZARDS' },
  { id: 17, name: 'Sun Mage', description: 'Play for 30 minutes', category: 'WIZARDS' },
  { id: 77, name: 'Vampire Mage', description: 'Equip 75 spells', category: 'WIZARDS' },
  { id: 21, name: 'Wizard King', description: 'Level up 1111 times', category: 'WIZARDS' },
  // MISSION カテゴリ
  { id: 84, name: 'World 4 Nightmare', description: 'Complete World 4 on Nightmare', category: 'MISSION' },
  { id: 50, name: 'World 2 Nightmare', description: 'Complete World 2 on Nightmare', category: 'MISSION' },
  { id: 51, name: 'World 3 Nightmare', description: 'Complete World 3 on Nightmare', category: 'MISSION' },
  { id: 49, name: 'World 1 Nightmare', description: 'Complete World 1 on Nightmare', category: 'MISSION' },
  { id: 82, name: 'World 4 Hard', description: 'Complete World 4 on Normal', category: 'MISSION' },
  { id: 83, name: 'World 4 Nightmare Unlock', description: 'Complete World 4 on Hard', category: 'MISSION' },
  { id: 8, name: 'World 2 Hard', description: 'Complete World 2 on Normal', category: 'MISSION' },
  { id: 9, name: 'World 2 Nightmare Unlock', description: 'Complete World 2 on Hard', category: 'MISSION' },
  { id: 10, name: 'World 3 Hard', description: 'Complete World 3 on Normal', category: 'MISSION' },
  { id: 11, name: 'World 3 Nightmare Unlock', description: 'Complete World 3 on Hard', category: 'MISSION' },
  { id: 6, name: 'World 1 Hard', description: 'Complete World 1 on Normal', category: 'MISSION' },
  { id: 7, name: 'World 1 Nightmare Unlock', description: 'Complete World 1 on Hard', category: 'MISSION' },
  { id: 4, name: 'Crystal Frostlands', description: 'Survive 12 minutes in World 1', category: 'MISSION' },
  { id: 5, name: 'Scorched Abyss', description: 'Survive 12 minutes in World 2', category: 'MISSION' },
  { id: 81, name: 'Astral Planes', description: 'Survive 12 minutes in World 3', category: 'MISSION' },
  // MICS カテゴリ
  { id: 80, name: 'Toad Boss', description: 'Defeat Toad Boss', category: 'MICS' },
  { id: 60, name: 'Endless Mode', description: "Defeat Sol'phish", category: 'MICS' },
  { id: 59, name: 'Peaceful Mode', description: 'Take friendly fire damage', category: 'MICS' },
  { id: 61, name: 'Single Spell Mode', description: 'Level up spell 20 times', category: 'MICS' },
  { id: 13, name: 'Acid Element', description: 'Perform 7 infusions', category: 'MICS' },
  { id: 73, name: 'Dark Element', description: 'Perform 26 infusions', category: 'MICS' },
  { id: 14, name: 'Ice Element', description: 'Perform 15 infusions', category: 'MICS' },
  { id: 12, name: 'Lightning Element', description: 'Perform 2 infusions', category: 'MICS' },
  { id: 1, name: 'Upgrade Tier 1', description: 'Die once', category: 'MICS' },
  { id: 2, name: 'Upgrade Tier 2', description: 'Perform 5 upgrades', category: 'MICS' },
  { id: 3, name: 'Upgrade Tier 3', description: 'Perform 15 upgrades', category: 'MICS' },
  // OUTFITS カテゴリ
  { id: 63, name: 'Bird Mage Skin 1', description: 'Two stones one bird', category: 'OUTFITS' },
  { id: 64, name: 'Bird Mage Skin 2', description: 'Pick up 33 relics', category: 'OUTFITS' },
  { id: 35, name: 'Campanelli Skin 1', description: 'Revive 13 times', category: 'OUTFITS' },
  { id: 36, name: 'Campanelli Skin 2', description: 'Shoot 10 phantom blades', category: 'OUTFITS' },
  { id: 75, name: 'Flute Mage Skin 1', description: '8 concurrent summons', category: 'OUTFITS' },
  { id: 76, name: 'Flute Mage Skin 2', description: '12 min summon duration', category: 'OUTFITS' },
  { id: 37, name: 'Hatty Skin 1', description: 'Augment rune burst 4 times', category: 'OUTFITS' },
  { id: 38, name: 'Hatty Skin 2', description: 'Deal 314159 plasma damage', category: 'OUTFITS' },
  { id: 56, name: 'Hatty Skin 3', description: 'Hide in bush 300 times', category: 'OUTFITS' },
  { id: 31, name: 'Key Mage Skin 1', description: 'Spawn 19440 rocks', category: 'OUTFITS' },
  { id: 32, name: 'Key Mage Skin 2', description: 'Reach 100% rock size', category: 'OUTFITS' },
  { id: 33, name: 'Ludwig Skin 1', description: 'Venom arcane broadsword', category: 'OUTFITS' },
  { id: 34, name: 'Ludwig Skin 2', description: 'Sacrifice 1066 times', category: 'OUTFITS' },
];

// キャラクターメタデータ（UI表示用）
// ゲーム内のCharacterIDに対応
const CHARACTER_METADATA: Record<number, Omit<Character, 'level'>> = {
  0: {
    id: '0',
    name: 'Reginald',
    characterClass: 'Wizard',
    maxLevel: 10,
    iconType: 'fire',
  },
  1: {
    id: '1',
    name: 'Moon Mage',
    characterClass: 'Lunar Wizard',
    maxLevel: 10,
    iconType: 'dark',
  },
  2: {
    id: '2',
    name: 'Sun Mage',
    characterClass: 'Solar Wizard',
    maxLevel: 10,
    iconType: 'light',
  },
  3: {
    id: '3',
    name: 'Key Mage',
    characterClass: 'Key Wizard',
    maxLevel: 10,
    iconType: 'earth',
  },
  4: {
    id: '4',
    name: 'Ludwig',
    characterClass: 'Swordsman',
    maxLevel: 10,
    iconType: 'lightning',
  },
  5: {
    id: '5',
    name: 'Campanelli',
    characterClass: 'Bell Wizard',
    maxLevel: 10,
    iconType: 'wind',
  },
  6: {
    id: '6',
    name: 'Hatty',
    characterClass: 'Hat Wizard',
    maxLevel: 10,
    iconType: 'lightning',
  },
  7: {
    id: '7',
    name: 'Wizard King',
    characterClass: 'King',
    maxLevel: 10,
    iconType: 'light',
  },
  8: {
    id: '8',
    name: 'Star Mage',
    characterClass: 'Star Wizard',
    maxLevel: 10,
    iconType: 'light',
  },
  9: {
    id: '9',
    name: 'Smithy',
    characterClass: 'Blacksmith',
    maxLevel: 10,
    iconType: 'fire',
  },
  10: {
    id: '10',
    name: 'Bird Mage',
    characterClass: 'Bird Wizard',
    maxLevel: 10,
    iconType: 'wind',
  },
  11: {
    id: '11',
    name: 'Plant Mage',
    characterClass: 'Plant Wizard',
    maxLevel: 10,
    iconType: 'earth',
  },
  12: {
    id: '12',
    name: 'Flute Mage',
    characterClass: 'Flute Wizard',
    maxLevel: 10,
    iconType: 'wind',
  },
  13: {
    id: '13',
    name: 'Vampire Mage',
    characterClass: 'Vampire Wizard',
    maxLevel: 10,
    iconType: 'dark',
  },
  99999: {
    id: '99999',
    name: 'Test Character',
    characterClass: 'Test',
    maxLevel: 99,
    iconType: 'fire',
  },
};

export interface UseSaveEditorReturn {
  // State
  saveData: SaveData | null;
  originalSaveData: SaveData | null;
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  hasChanges: boolean;

  // Actions
  loadFile: (file: File) => Promise<void>;
  updateGold: (gold: number) => void;
  updateCharacterLevel: (characterId: string, level: number) => void;
  updateAchievement: (achievementId: number, unlocked: boolean) => void;
  exportSave: () => void;
  resetChanges: () => void;
}

export function useSaveEditor(): UseSaveEditorReturn {
  // rawTextがSource of Truth
  const [rawText, setRawText] = useState<string | null>(null);
  const [originalRawText, setOriginalRawText] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loadStatus, setLoadStatus] = useState<FileLoadStatus>('idle');

  // rawTextからUI表示用のSaveDataを生成
  const saveData = useMemo<SaveData | null>(() => {
    if (!rawText) return null;

    const es3Data = extractSaveData(rawText);

    // キャラクターデータを構築
    const characters: Character[] = [];
    es3Data.characterRanks.forEach((rank, characterId) => {
      const metadata = CHARACTER_METADATA[characterId];
      if (metadata) {
        characters.push({
          ...metadata,
          level: rank.currentRank,
        });
      } else {
        // 未知のキャラクターでもデフォルト表示
        characters.push({
          id: String(characterId),
          name: `Character ${characterId}`,
          characterClass: 'Unknown',
          level: rank.currentRank,
          maxLevel: 99,
        });
      }
    });

    // 実績データを構築
    const achievements: Achievement[] = ACHIEVEMENT_METADATA.map(meta => {
      const progress = es3Data.challenges.get(meta.id);
      return {
        ...meta,
        unlocked: progress?.isCompleted ?? false,
      };
    });

    return {
      gold: es3Data.gold,
      characters,
      achievements,
    };
  }, [rawText]);

  // 元のSaveData（変更検知用）
  const originalSaveData = useMemo<SaveData | null>(() => {
    if (!originalRawText) return null;

    const es3Data = extractSaveData(originalRawText);

    const characters: Character[] = [];
    es3Data.characterRanks.forEach((rank, characterId) => {
      const metadata = CHARACTER_METADATA[characterId];
      if (metadata) {
        characters.push({
          ...metadata,
          level: rank.currentRank,
        });
      } else {
        characters.push({
          id: String(characterId),
          name: `Character ${characterId}`,
          characterClass: 'Unknown',
          level: rank.currentRank,
          maxLevel: 99,
        });
      }
    });

    const achievements: Achievement[] = ACHIEVEMENT_METADATA.map(meta => {
      const progress = es3Data.challenges.get(meta.id);
      return {
        ...meta,
        unlocked: progress?.isCompleted ?? false,
      };
    });

    return {
      gold: es3Data.gold,
      characters,
      achievements,
    };
  }, [originalRawText]);

  // ファイル読み込み
  const loadFile = useCallback(async (file: File) => {
    setLoadStatus('loading');
    setFileInfo({
      name: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
    });

    try {
      // ファイルをArrayBufferとして読み込み
      const arrayBuffer = await file.arrayBuffer();

      // ES3復号
      const decryptedData = await decryptES3(arrayBuffer);

      // 復号されたデータをUTF-8文字列に変換
      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder.decode(decryptedData);

      console.log('Decrypted JSON length:', jsonString.length);

      // 検証
      const validation = validateModifiedSave(jsonString);
      if (!validation.valid) {
        console.warn('Save file validation warnings:', validation.errors);
      }

      // rawTextとして保存
      setRawText(jsonString);
      setOriginalRawText(jsonString);
      setLoadStatus('ready');
    } catch (error) {
      console.error('Failed to decrypt file:', error);
      setLoadStatus('error');
    }
  }, []);

  // ゴールド更新
  const updateGold = useCallback((gold: number) => {
    if (!rawText) return;

    const result = modifyGold(rawText, gold);
    if (result.success) {
      setRawText(result.newRawText);
    } else {
      console.error('Failed to update gold:', result.error);
    }
  }, [rawText]);

  // キャラクターレベル更新
  const updateCharacterLevel = useCallback((characterId: string, level: number) => {
    if (!rawText) return;

    const numericId = parseInt(characterId, 10);

    // まず既存エントリの変更を試みる
    let result = modifyCharacterRank(rawText, numericId, level);

    // 存在しない場合は新規追加
    if (!result.success && result.error?.includes('not found')) {
      result = addCharacterRank(rawText, numericId, level);
    }

    if (result.success) {
      setRawText(result.newRawText);
    } else {
      console.error('Failed to update character level:', result.error);
    }
  }, [rawText]);

  // 実績更新
  const updateAchievement = useCallback((achievementId: number, unlocked: boolean) => {
    if (!rawText) return;

    // IsCompletedを変更し、Valueは現状維持（変更する場合は現在のValueを抽出する必要あり）
    const es3Data = extractSaveData(rawText);
    const currentProgress = es3Data.challenges.get(achievementId);
    const currentValue = currentProgress?.value ?? 0;

    const result = modifyChallengeProgress(rawText, achievementId, currentValue, unlocked);
    if (result.success) {
      setRawText(result.newRawText);
    } else {
      console.error('Failed to update achievement:', result.error);
    }
  }, [rawText]);

  // セーブデータエクスポート
  const exportSave = useCallback(async () => {
    if (!rawText || !fileInfo) return;

    try {
      // 検証
      const validation = validateModifiedSave(rawText);
      if (!validation.valid) {
        console.warn('Export validation warnings:', validation.errors);
      }

      // rawTextを直接エンコード
      const encoder = new TextEncoder();
      const jsonBytes = encoder.encode(rawText);

      // ES3暗号化（常にgzip圧縮付き）
      const encryptedData = await encryptES3(jsonBytes.buffer as ArrayBuffer);

      // ダウンロード
      const blob = new Blob([encryptedData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // .es3拡張子で保存
      const baseName = fileInfo.name.replace(/\.(es3|sav|json)$/i, '');
      a.download = `${baseName}_edited.es3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to encrypt file:', error);
    }
  }, [rawText, fileInfo]);

  // 変更リセット
  const resetChanges = useCallback(() => {
    if (originalRawText) {
      setRawText(originalRawText);
    }
  }, [originalRawText]);

  // 変更検知
  const hasChanges = rawText !== originalRawText;

  return {
    saveData,
    originalSaveData,
    fileInfo,
    loadStatus,
    hasChanges,
    loadFile,
    updateGold,
    updateCharacterLevel,
    updateAchievement,
    exportSave,
    resetChanges,
  };
}
