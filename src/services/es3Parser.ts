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
}

export interface ES3SaveData {
  // 基本情報
  versionNumber: string;
  playTimeInMinutes: number;
  gold: number;

  // キャラクター関連
  characterRanks: Map<number, CharacterRank>;
  selectedCharacter: number;

  // 実績/チャレンジ
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
 * パターン: "RankProgressPerCharacter" : {0:{...},1:{...}}
 */
function extractCharacterRanks(rawText: string): Map<number, CharacterRank> {
  const ranks = new Map<number, CharacterRank>();

  // RankProgressPerCharacterセクションを抽出
  const sectionMatch = rawText.match(/"RankProgressPerCharacter"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/);
  if (!sectionMatch) {
    return ranks;
  }

  const sectionContent = sectionMatch[1];

  // 各キャラクターエントリを抽出
  // パターン: ID:{ "CurrentRank" : X, "ProgressTowardsNextRank" : Y }
  const entryPattern = /(\d+):\{\s*"CurrentRank"\s*:\s*(\d+)\s*,\s*"ProgressTowardsNextRank"\s*:\s*(\d+)/g;

  let match;
  while ((match = entryPattern.exec(sectionContent)) !== null) {
    const characterId = parseInt(match[1], 10);
    const currentRank = parseInt(match[2], 10);
    const progressTowardsNextRank = parseInt(match[3], 10);

    ranks.set(characterId, { currentRank, progressTowardsNextRank });
  }

  return ranks;
}

/**
 * チャレンジ（実績）進捗を抽出
 * パターン: "ProgressForChallenges" : {1:{...},2:{...}}
 */
function extractChallenges(rawText: string): Map<number, ChallengeProgress> {
  const challenges = new Map<number, ChallengeProgress>();

  // ProgressForChallengesセクションを抽出
  const sectionMatch = rawText.match(/"ProgressForChallenges"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/);
  if (!sectionMatch) {
    return challenges;
  }

  const sectionContent = sectionMatch[1];

  // 各チャレンジエントリを抽出
  // パターン: ID:{ "Value" : X, "IsCompleted" : true/false }
  const entryPattern = /(\d+):\{\s*"Value"\s*:\s*(\d+)\s*,\s*"IsCompleted"\s*:\s*(true|false)/g;

  let match;
  while ((match = entryPattern.exec(sectionContent)) !== null) {
    const challengeId = parseInt(match[1], 10);
    const value = parseInt(match[2], 10);
    const isCompleted = match[3] === 'true';

    challenges.set(challengeId, { value, isCompleted });
  }

  return challenges;
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
