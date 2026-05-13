/**
 * ES3形式セーブデータの読み取り専用パーサー
 *
 * UI表示用にrawTextから値を抽出する（読み取り専用）
 * 変更はes3Modifier.tsで行う
 */

export interface ChallengeProgress {
  value: number;
  isCompleted: boolean;
}

export interface CharacterRank {
  currentRank: number;
  progressTowardsNextRank: number;
  // 新フォーマット(v1.0.x)で追加されたPrestige値（旧セーブでは undefined）
  prestige?: number;
}

export interface ES3SaveData {
  // 基本情報
  versionNumber: string;
  playTimeInMinutes: number;
  gold: number;

  // キャラクター関連
  characterRanks: Map<number, CharacterRank>;
  selectedCharacter: number;
  // SelectedSkinPerCharacter — 各キャラの装備中スキンID
  selectedSkins: Map<number, number>;

  // 実績/チャレンジ
  // 旧 ProgressForChallenges と 新 New_ProgressForChallenges を統合（新セクション優先）
  challenges: Map<number, ChallengeProgress>;

  // その他
  numberOfAttemptedRuns: number;
}

/**
 * rawTextからUI表示用のデータを抽出
 */
export function extractSaveData(rawText: string): ES3SaveData {
  return {
    versionNumber: extractVersionNumber(rawText),
    playTimeInMinutes: extractPlayTime(rawText),
    gold: extractGold(rawText),
    characterRanks: extractCharacterRanks(rawText),
    selectedCharacter: extractSelectedCharacter(rawText),
    selectedSkins: extractSelectedSkins(rawText),
    challenges: extractChallenges(rawText),
    numberOfAttemptedRuns: extractAttemptedRuns(rawText),
  };
}

/**
 * バージョン番号を抽出
 */
function extractVersionNumber(rawText: string): string {
  const match = rawText.match(/"VersionNumber"\s*:\s*"([^"]+)"/);
  return match ? match[1] : 'unknown';
}

/**
 * プレイ時間を抽出（分単位）
 */
function extractPlayTime(rawText: string): number {
  const match = rawText.match(/"PlayTimeInMinutes"\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Gold値を抽出
 */
function extractGold(rawText: string): number {
  const match = rawText.match(/"Gold"\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 選択中キャラクターを抽出
 */
function extractSelectedCharacter(rawText: string): number {
  const match = rawText.match(/"SelectedCharacter"\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 挑戦回数を抽出
 */
function extractAttemptedRuns(rawText: string): number {
  const match = rawText.match(/"NumberOfAttemptedRuns"\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * キャラクターランク情報を抽出
 * 旧: ID:{ "CurrentRank" : X, "ProgressTowardsNextRank" : Y }
 * 新: ID:{ "CurrentRank" : X, "ProgressTowardsNextRank" : 0.99, "Prestige" : N }
 */
function extractCharacterRanks(rawText: string): Map<number, CharacterRank> {
  const ranks = new Map<number, CharacterRank>();

  // RankProgressPerCharacterセクションを抽出
  const sectionMatch = rawText.match(/"RankProgressPerCharacter"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/);
  if (!sectionMatch) {
    return ranks;
  }

  const sectionContent = sectionMatch[1];

  // ProgressTowardsNextRank は新フォーマットで浮動小数点になった (例: 0.99)
  // Prestige は新フォーマットで追加された任意フィールド
  const entryPattern = /(\d+):\{\s*"CurrentRank"\s*:\s*(\d+)\s*,\s*"ProgressTowardsNextRank"\s*:\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*"Prestige"\s*:\s*(\d+))?/g;

  let match;
  while ((match = entryPattern.exec(sectionContent)) !== null) {
    const characterId = parseInt(match[1], 10);
    const currentRank = parseInt(match[2], 10);
    const progressTowardsNextRank = parseFloat(match[3]);
    const prestige = match[4] !== undefined ? parseInt(match[4], 10) : undefined;

    ranks.set(characterId, { currentRank, progressTowardsNextRank, prestige });
  }

  return ranks;
}

/**
 * SelectedSkinPerCharacter を抽出
 * フォーマット: "SelectedSkinPerCharacter" : {0:0,2:9,1:3,4:15}
 * （未エントリのキャラは CHARACTER_META.defaultSkin にフォールバック）
 */
function extractSelectedSkins(rawText: string): Map<number, number> {
  const skins = new Map<number, number>();
  // 単一行のシンプルな {id:value,...} 辞書
  const sectionMatch = rawText.match(/"SelectedSkinPerCharacter"\s*:\s*\{([^}]*)\}/);
  if (!sectionMatch) return skins;

  const entryPattern = /(\d+)\s*:\s*(\d+)/g;
  let match;
  while ((match = entryPattern.exec(sectionMatch[1])) !== null) {
    skins.set(parseInt(match[1], 10), parseInt(match[2], 10));
  }
  return skins;
}

/**
 * チャレンジ（実績）進捗を抽出
 *
 * 新フォーマット(v1.0.x)では `New_ProgressForChallenges` セクションが
 * 追加され、ゲーム本体はこちらを参照する。旧 `ProgressForChallenges`
 * もマイグレーション後に保持されるため、両方をスキャンして統合する。
 * IDが重複する場合は新セクションの値を優先する。
 */
function extractChallenges(rawText: string): Map<number, ChallengeProgress> {
  const challenges = new Map<number, ChallengeProgress>();

  // 旧セクションを先に取り込む
  const oldSection = extractChallengeSection(rawText, 'ProgressForChallenges');
  oldSection.forEach((v, k) => challenges.set(k, v));

  // 新セクションは上書き優先
  const newSection = extractChallengeSection(rawText, 'New_ProgressForChallenges');
  newSection.forEach((v, k) => challenges.set(k, v));

  return challenges;
}

/**
 * 指定セクション名のチャレンジ進捗を抽出するヘルパー
 */
function extractChallengeSection(
  rawText: string,
  sectionName: 'ProgressForChallenges' | 'New_ProgressForChallenges'
): Map<number, ChallengeProgress> {
  const result = new Map<number, ChallengeProgress>();

  // セクション名を厳密に区切る (New_ProgressForChallenges を含まないように、直前が `,` か `{` を要求)
  // 旧セクション(ProgressForChallenges)の直前は `,`、新セクションも同様。
  const sectionRegex =
    sectionName === 'ProgressForChallenges'
      ? /(?:^|[,{])\s*"ProgressForChallenges"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/
      : /"New_ProgressForChallenges"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/;

  const sectionMatch = rawText.match(sectionRegex);
  if (!sectionMatch) {
    return result;
  }

  const sectionContent = sectionMatch[1];

  // パターン: ID:{ "Value" : X, "IsCompleted" : true/false }
  const entryPattern = /(\d+):\{\s*"Value"\s*:\s*(-?\d+)\s*,\s*"IsCompleted"\s*:\s*(true|false)/g;

  let match;
  while ((match = entryPattern.exec(sectionContent)) !== null) {
    const challengeId = parseInt(match[1], 10);
    const value = parseInt(match[2], 10);
    const isCompleted = match[3] === 'true';

    result.set(challengeId, { value, isCompleted });
  }

  return result;
}

/**
 * キャラクターIDとレベル（CurrentRank）のシンプルなマップを取得
 * UI表示用のヘルパー
 */
export function getCharacterLevels(rawText: string): Map<number, number> {
  const ranks = extractCharacterRanks(rawText);
  const levels = new Map<number, number>();

  ranks.forEach((rank, characterId) => {
    levels.set(characterId, rank.currentRank);
  });

  return levels;
}

/**
 * 特定のキャラクターのレベルを取得
 */
export function getCharacterLevel(rawText: string, characterId: number): number | undefined {
  const ranks = extractCharacterRanks(rawText);
  return ranks.get(characterId)?.currentRank;
}

/**
 * save_meta ファイルから現在アクティブなスロット番号を抽出
 * フォーマット: { "active_slot" : { "__type" : "int", "value" : 4 } }
 */
export function extractActiveSlot(rawText: string): number | undefined {
  const match = rawText.match(/"active_slot"\s*:\s*\{[^}]*"value"\s*:\s*(-?\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * 完了した実績IDのリストを取得
 */
export function getCompletedChallengeIds(rawText: string): number[] {
  const challenges = extractChallenges(rawText);
  const completed: number[] = [];

  challenges.forEach((progress, challengeId) => {
    if (progress.isCompleted) {
      completed.push(challengeId);
    }
  });

  return completed.sort((a, b) => a - b);
}
