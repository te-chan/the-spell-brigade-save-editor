import { useState, useCallback, useMemo } from 'react';
import type { SaveData, FileInfo, FileLoadStatus, Character, Achievement, SaveMetaInfo } from '../types';
import type { TKey } from '../i18n';
import { decryptES3, encryptES3 } from '../services/es3Crypto';
import { extractSaveData, extractActiveSlot } from '../services/es3Parser';
import {
  modifyGold,
  modifyCharacterRank,
  modifyChallengeProgress,
  addCharacterRank,
  validateModifiedSave,
} from '../services/es3Modifier';
import {
  ACHIEVEMENT_METADATA,
  CHARACTER_METADATA,
  CHARACTER_META,
  getSkinDisplayName,
  getPrestigeSkin,
} from '../data/gameMetadata';

// 旧メタデータ定義は src/data/gameMetadata.ts に移動（ゲームから直接ダンプ）。
// 更新方法: lab/frida/dump-all.js でリポジトリをダンプ → lab/gen-metadata.cjs を実行。

// CharacterMeta を id でルックアップ（defaultSkin / rewardName 取得用）
const CHARACTER_META_BY_ID = new Map<number, (typeof CHARACTER_META)[number]>(
  CHARACTER_META.map((c) => [c.id, c])
);

/**
 * パーサー結果と SelectedSkinPerCharacter / CHARACTER_META を組み合わせて
 * UI 用 Character を生成するヘルパー。
 *
 * rank=undefined のときは「未アンロック」を表現する。
 */
function buildCharacter(
  characterId: number,
  rank: { currentRank: number; prestige?: number } | undefined,
  selectedSkins: Map<number, number>
): Character {
  const baseMeta = CHARACTER_METADATA[characterId];
  const repoMeta = CHARACTER_META_BY_ID.get(characterId);
  const internalName = repoMeta?.rewardName;
  const locked = rank === undefined;

  // 装備スキン: セーブの SelectedSkinPerCharacter にあればそれ、無ければ CHARACTER_META.defaultSkin
  const selectedSkinId =
    selectedSkins.get(characterId) ?? repoMeta?.defaultSkin;
  const selectedSkinName =
    selectedSkinId !== undefined ? getSkinDisplayName(selectedSkinId) : undefined;
  const prestigeSkinName = internalName
    ? getPrestigeSkin(internalName)?.displayName
    : undefined;

  const common = {
    level: rank?.currentRank ?? 1,
    prestige: rank?.prestige,
    internalName,
    selectedSkinId,
    selectedSkinName,
    prestigeSkinName,
    locked,
    initialCost: repoMeta?.initialCost,
  };

  if (baseMeta) {
    return { ...baseMeta, ...common };
  }
  return {
    id: String(characterId),
    name: `Character ${characterId}`,
    characterClass: 'Unknown',
    maxLevel: 99,
    ...common,
  };
}

/**
 * 「セーブにあるキャラ」+「dumpで判明している全キャラ」のマージリストを返す
 * (テスト用 99999 と Disabled キャラは除外)
 */
function buildCharacterList(
  characterRanks: Map<number, { currentRank: number; prestige?: number }>,
  selectedSkins: Map<number, number>
): Character[] {
  const allIds = new Set<number>();
  characterRanks.forEach((_, id) => allIds.add(id));
  CHARACTER_META.forEach((c) => {
    if (c.id === 99999) return;
    if (c.disabled) return;
    allIds.add(c.id);
  });

  // SelectionOrder で安定ソート (CHARACTER_META にいないキャラは末尾)
  const orderById = new Map<number, number>();
  CHARACTER_META.forEach((c) => orderById.set(c.id, c.selectionOrder));

  return [...allIds]
    .sort((a, b) => (orderById.get(a) ?? 999) - (orderById.get(b) ?? 999))
    .map((id) => buildCharacter(id, characterRanks.get(id), selectedSkins));
}

export interface UseSaveEditorReturn {
  // State
  saveData: SaveData | null;
  originalSaveData: SaveData | null;
  fileInfo: FileInfo | null;
  loadStatus: FileLoadStatus;
  hasChanges: boolean;

  // save_meta（任意ステップ）— 解析できれば active_slot を提示する
  metaInfo: SaveMetaInfo | null;
  metaErrorKey: TKey | null;

  // Actions
  loadFile: (file: File) => Promise<void>;
  loadMetaFile: (file: File) => Promise<void>;
  clearMeta: () => void;
  updateGold: (gold: number) => void;
  updateCharacterLevel: (characterId: string, level: number) => void;
  updateCharacterPrestige: (characterId: string, prestige: number) => void;
  unlockCharacter: (characterId: string) => void;
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

  // save_meta（オプション）— active_slot を表示してスロット選択を補助
  const [metaInfo, setMetaInfo] = useState<SaveMetaInfo | null>(null);
  const [metaErrorKey, setMetaErrorKey] = useState<TKey | null>(null);

  // rawTextからUI表示用のSaveDataを生成
  const saveData = useMemo<SaveData | null>(() => {
    if (!rawText) return null;

    const es3Data = extractSaveData(rawText);

    const characters = buildCharacterList(es3Data.characterRanks, es3Data.selectedSkins);

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

    const characters = buildCharacterList(es3Data.characterRanks, es3Data.selectedSkins);

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

  /**
   * save_meta ファイルを読み込んで active_slot を抽出する。
   * 失敗しても editor 側のロードフローは独立して継続できるようエラーは内部状態に格納するだけ。
   */
  const loadMetaFile = useCallback(async (file: File) => {
    setMetaErrorKey(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decryptedData = await decryptES3(arrayBuffer);
      const jsonString = new TextDecoder('utf-8').decode(decryptedData);

      const activeSlot = extractActiveSlot(jsonString);
      if (activeSlot === undefined) {
        setMetaErrorKey('errors.metaNoActiveSlot');
        return;
      }

      setMetaInfo({
        fileName: file.name,
        activeSlot,
        rawText: jsonString,
      });
    } catch (error) {
      console.error('Failed to decrypt save_meta:', error);
      setMetaErrorKey('errors.metaDecryptFailed');
    }
  }, []);

  const clearMeta = useCallback(() => {
    setMetaInfo(null);
    setMetaErrorKey(null);
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

    // 既存の ProgressTowardsNextRank / Prestige は保持するため、現在値を読み取る
    const es3Data = extractSaveData(rawText);
    const currentRank = es3Data.characterRanks.get(numericId);
    const ptnr = currentRank?.progressTowardsNextRank ?? 0;

    // まず既存エントリの変更を試みる
    let result = modifyCharacterRank(rawText, numericId, level, ptnr);

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

  // Prestige 更新（新フォーマットのみ。旧セーブの場合はno-op）
  const updateCharacterPrestige = useCallback((characterId: string, prestige: number) => {
    if (!rawText) return;

    const numericId = parseInt(characterId, 10);

    const es3Data = extractSaveData(rawText);
    const currentRank = es3Data.characterRanks.get(numericId);
    if (!currentRank) {
      console.error(`Character ${characterId} not found for prestige update`);
      return;
    }
    // 旧フォーマット（Prestigeフィールド未存在）の場合は何もしない
    if (currentRank.prestige === undefined) {
      console.warn(`Save file has no Prestige field for character ${characterId}; skipping`);
      return;
    }

    const result = modifyCharacterRank(
      rawText,
      numericId,
      currentRank.currentRank,
      currentRank.progressTowardsNextRank,
      prestige
    );
    if (result.success) {
      setRawText(result.newRawText);
    } else {
      console.error('Failed to update character prestige:', result.error);
    }
  }, [rawText]);

  /**
   * 未アンロックのキャラクターを有効化する。
   * RankProgressPerCharacter に新規 entry を追加するだけで実質アンロック扱い。
   * Gold は減らさない (ユーザー設定)。
   */
  const unlockCharacter = useCallback((characterId: string) => {
    if (!rawText) return;

    const numericId = parseInt(characterId, 10);

    // 既にいる場合は no-op
    const es3Data = extractSaveData(rawText);
    if (es3Data.characterRanks.has(numericId)) {
      console.warn(`Character ${characterId} is already unlocked`);
      return;
    }

    const result = addCharacterRank(rawText, numericId, 1, 0, 0);
    if (result.success) {
      setRawText(result.newRawText);
    } else {
      console.error('Failed to unlock character:', result.error);
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
      // 出力ファイル名:
      //   - 新フォーマット (save_slot_N) → save_slot_N_edited (拡張子なし)
      //   - 旧フォーマット (*.es3 等)    → <base>_edited.es3
      const inputName = fileInfo.name;
      if (/^save_slot_\d+$/i.test(inputName)) {
        // 新フォーマット: そのままのスロット名 + _edited で出力（ユーザーが手動でリネームしてゲームフォルダに配置）
        a.download = `${inputName}_edited`;
      } else {
        const baseName = inputName.replace(/\.(es3|sav|json)$/i, '');
        a.download = `${baseName}_edited.es3`;
      }
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
    metaInfo,
    metaErrorKey,
    loadFile,
    loadMetaFile,
    clearMeta,
    updateGold,
    updateCharacterLevel,
    updateCharacterPrestige,
    unlockCharacter,
    updateAchievement,
    exportSave,
    resetChanges,
  };
}
