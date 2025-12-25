/**
 * ES3形式セーブデータの正規表現ベース変更処理
 *
 * ES3は標準JSONではないため、フルパースせず正規表現で部分変更する
 * rawText（生テキスト）をSource of Truthとして保持し、安全に変更を行う
 */

export interface ModificationResult {
  success: boolean;
  newRawText: string;
  error?: string;
}

/**
 * Gold値を変更
 * パターン: "Gold" : 11523,
 */
export function modifyGold(rawText: string, newValue: number): ModificationResult {
  const pattern = /("Gold"\s*:\s*)(\d+)/;

  if (!pattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: 'Gold field not found' };
  }

  const newRawText = rawText.replace(pattern, `$1${newValue}`);
  return { success: true, newRawText };
}

/**
 * チャレンジ（実績）の進捗を変更
 * パターン: 1:{ "Value" : 1, "IsCompleted" : true }
 */
export function modifyChallengeProgress(
  rawText: string,
  challengeId: number,
  newValue: number,
  isCompleted: boolean
): ModificationResult {
  // ProgressForChallengesセクション内で、特定IDのエントリを見つける
  // フォーマット: },ID:{ ... "Value" : X, ... "IsCompleted" : true/false ... }
  const pattern = new RegExp(
    `((?:^|,)${challengeId}:\\{[^}]*"Value"\\s*:\\s*)(\\d+)([^}]*"IsCompleted"\\s*:\\s*)(true|false)`,
    's'
  );

  if (!pattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Challenge ${challengeId} not found` };
  }

  const newRawText = rawText.replace(pattern, `$1${newValue}$3${isCompleted}`);
  return { success: true, newRawText };
}

/**
 * キャラクターランクを変更（既存エントリのみ）
 * パターン: 0:{ "CurrentRank" : 10, "ProgressTowardsNextRank" : 0 }
 */
export function modifyCharacterRank(
  rawText: string,
  characterId: number,
  currentRank: number,
  progressTowardsNextRank: number = 0
): ModificationResult {
  // RankProgressPerCharacterセクション内で、特定IDのエントリを見つける
  const pattern = new RegExp(
    `((?:^|,)${characterId}:\\{[^}]*"CurrentRank"\\s*:\\s*)(\\d+)([^}]*"ProgressTowardsNextRank"\\s*:\\s*)(\\d+)`,
    's'
  );

  if (!pattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Character ${characterId} not found` };
  }

  const newRawText = rawText.replace(pattern, `$1${currentRank}$3${progressTowardsNextRank}`);
  return { success: true, newRawText };
}

/**
 * 新しいキャラクターランクエントリを追加
 * RankProgressPerCharacterセクションに新規エントリを挿入
 */
export function addCharacterRank(
  rawText: string,
  characterId: number,
  currentRank: number,
  progressTowardsNextRank: number = 0
): ModificationResult {
  // 既に存在するか確認
  const existsPattern = new RegExp(`(?:^|,)${characterId}:\\{[^}]*"CurrentRank"`, 's');
  if (existsPattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Character ${characterId} already exists` };
  }

  // RankProgressPerCharacterセクションの終端を見つける
  // パターン: "RankProgressPerCharacter" : {0:{...},1:{...},2:{...}
  //                                                              ^ ここに追加
  // 終端の } の前に挿入

  // まずセクションを見つける
  const sectionPattern = /"RankProgressPerCharacter"\s*:\s*\{/;
  if (!sectionPattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: 'RankProgressPerCharacter section not found' };
  }

  // セクション内の最後のエントリの後に追加
  // },[space/newline] の後に追加する
  // 実際のフォーマットを維持するため、既存エントリのフォーマットを参考にする

  // RankProgressPerCharacter セクションの末尾を見つける
  // フォーマット: ...ProgressTowardsNextRank" : 0\n\t\t\t}\n\t\t},
  const endPattern = /("RankProgressPerCharacter"\s*:\s*\{[\s\S]*?"ProgressTowardsNextRank"\s*:\s*\d+\s*\})\s*(\})/;

  const match = rawText.match(endPattern);
  if (!match) {
    return { success: false, newRawText: rawText, error: 'Could not find RankProgressPerCharacter section end' };
  }

  // 新しいエントリを作成（既存のフォーマットに合わせる）
  const newEntry = `,${characterId}:{
				"CurrentRank" : ${currentRank},
				"ProgressTowardsNextRank" : ${progressTowardsNextRank}
			}`;

  const newRawText = rawText.replace(endPattern, `$1${newEntry}$2`);
  return { success: true, newRawText };
}

/**
 * 変更後のセーブデータを検証
 */
export function validateModifiedSave(rawText: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 必須フィールドの存在確認
  if (!/"Gold"\s*:\s*\d+/.test(rawText)) {
    errors.push('Gold field missing or malformed');
  }

  if (!/"ProgressForChallenges"\s*:\s*\{/.test(rawText)) {
    errors.push('ProgressForChallenges section missing');
  }

  if (!/"RankProgressPerCharacter"\s*:\s*\{/.test(rawText)) {
    errors.push('RankProgressPerCharacter section missing');
  }

  // ブラケットバランスチェック
  const openBraces = (rawText.match(/\{/g) || []).length;
  const closeBraces = (rawText.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Bracket mismatch: ${openBraces} open, ${closeBraces} close`);
  }

  const openBrackets = (rawText.match(/\[/g) || []).length;
  const closeBrackets = (rawText.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`Square bracket mismatch: ${openBrackets} open, ${closeBrackets} close`);
  }

  return { valid: errors.length === 0, errors };
}
