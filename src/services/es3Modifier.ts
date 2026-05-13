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
 *
 * 新フォーマット(v1.0.x)では同じIDが ProgressForChallenges と
 * New_ProgressForChallenges の両方に存在する場合がある。ゲーム本体は
 * 新セクションを参照するため、見つかった全エントリを更新する。
 */
export function modifyChallengeProgress(
  rawText: string,
  challengeId: number,
  newValue: number,
  isCompleted: boolean
): ModificationResult {
  // フォーマット: {ID:{...} または },ID:{ ... "Value" : X, ... "IsCompleted" : true/false ... }
  // セクション先頭エントリは `{` に続くため `[\{,]` を境界として許可する
  const pattern = new RegExp(
    `((?:^|[\\{,])${challengeId}:\\{[^}]*"Value"\\s*:\\s*)(-?\\d+)([^}]*"IsCompleted"\\s*:\\s*)(true|false)`,
    'gs'
  );

  if (!pattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Challenge ${challengeId} not found` };
  }

  // g フラグ付きで全マッチを置換（旧・新両セクションのエントリを更新）
  pattern.lastIndex = 0;
  const newRawText = rawText.replace(pattern, `$1${newValue}$3${isCompleted}`);
  return { success: true, newRawText };
}

/**
 * キャラクターランクを変更（既存エントリのみ）
 * 旧: { "CurrentRank" : 10, "ProgressTowardsNextRank" : 0 }
 * 新: { "CurrentRank" : 10, "ProgressTowardsNextRank" : 0.99, "Prestige" : N }
 *
 * `prestige` を指定した場合のみ Prestige 値も更新する。
 */
export function modifyCharacterRank(
  rawText: string,
  characterId: number,
  currentRank: number,
  progressTowardsNextRank: number = 0,
  prestige?: number
): ModificationResult {
  // 浮動小数点の ProgressTowardsNextRank (0.99 等) を捕捉できるようにする
  // セクション先頭エントリ (ID:{ の直前が `{`) と それ以外 (直前が `,`) の両方に対応
  const pattern = new RegExp(
    `((?:^|[\\{,])${characterId}:\\{[^}]*"CurrentRank"\\s*:\\s*)(\\d+)([^}]*"ProgressTowardsNextRank"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)`,
    's'
  );

  if (!pattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Character ${characterId} not found` };
  }

  let newRawText = rawText.replace(pattern, `$1${currentRank}$3${progressTowardsNextRank}`);

  // Prestige 指定があれば併せて更新（既存エントリにPrestigeフィールドがある場合のみ）
  if (prestige !== undefined) {
    const prestigePattern = new RegExp(
      `((?:^|[\\{,])${characterId}:\\{[^}]*"Prestige"\\s*:\\s*)(\\d+)`,
      's'
    );
    if (prestigePattern.test(newRawText)) {
      newRawText = newRawText.replace(prestigePattern, `$1${prestige}`);
    }
  }

  return { success: true, newRawText };
}

/**
 * 新しいキャラクターランクエントリを追加
 * RankProgressPerCharacterセクションに新規エントリを挿入
 *
 * 新フォーマット(v1.0.x)では Prestige フィールドが必須なので、
 * 既存エントリに Prestige があるかを検出して同じ形式で追加する。
 */
export function addCharacterRank(
  rawText: string,
  characterId: number,
  currentRank: number,
  progressTowardsNextRank: number = 0,
  prestige: number = 0
): ModificationResult {
  // 既に存在するか確認（セクション先頭エントリ も検出するため `[\{,]` を境界として許可）
  const existsPattern = new RegExp(`(?:^|[\\{,])${characterId}:\\{[^}]*"CurrentRank"`, 's');
  if (existsPattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: `Character ${characterId} already exists` };
  }

  const sectionPattern = /"RankProgressPerCharacter"\s*:\s*\{/;
  if (!sectionPattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: 'RankProgressPerCharacter section not found' };
  }

  // 新フォーマット判定: セクション内に "Prestige" が現れるか
  const sectionContentMatch = rawText.match(/"RankProgressPerCharacter"\s*:\s*\{([\s\S]*?)\n\t\t\t\}/);
  const hasPrestige = sectionContentMatch
    ? /"Prestige"\s*:\s*\d+/.test(sectionContentMatch[1])
    : false;

  // セクションの最終エントリの } と、セクション全体の } を捕捉する
  // 旧: ...ProgressTowardsNextRank" : N\n\t\t\t}\n\t\t}
  // 新: ...Prestige" : N\n\t\t\t}\n\t\t}
  const endPattern = hasPrestige
    ? /("RankProgressPerCharacter"\s*:\s*\{[\s\S]*?"Prestige"\s*:\s*\d+\s*\})(\s*\})/
    : /("RankProgressPerCharacter"\s*:\s*\{[\s\S]*?"ProgressTowardsNextRank"\s*:\s*-?\d+(?:\.\d+)?\s*\})(\s*\})/;

  if (!endPattern.test(rawText)) {
    return { success: false, newRawText: rawText, error: 'Could not find RankProgressPerCharacter section end' };
  }

  const newEntry = hasPrestige
    ? `,${characterId}:{
				"CurrentRank" : ${currentRank},
				"ProgressTowardsNextRank" : ${progressTowardsNextRank},
				"Prestige" : ${prestige}
			}`
    : `,${characterId}:{
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
