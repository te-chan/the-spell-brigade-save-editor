import pako from 'pako';

// ES3暗号化の固定パスワード
const ES3_PASSWORD = 'vhp*UCETJFwjE*8B!EPE';
const PBKDF2_ITERATIONS = 100;
const KEY_LENGTH = 16; // 128 bits
const IV_LENGTH = 16;

/**
 * PBKDF2でキーを導出
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-1',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return crypto.subtle.importKey(
    'raw',
    derivedBits,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * gzip圧縮されているかチェック（マジックバイト 0x1F 0x8B）
 */
function isGzipped(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * ES3ファイルを復号
 * @param data 暗号化されたES3データ
 * @returns 復号されたデータ（Uint8Array）
 */
export async function decryptES3(data: ArrayBuffer): Promise<Uint8Array> {
  const encryptedData = new Uint8Array(data);

  // IVはデータの先頭16バイト
  const iv = encryptedData.slice(0, IV_LENGTH);
  const ciphertext = encryptedData.slice(IV_LENGTH);

  // PBKDF2でキーを導出
  const key = await deriveKey(ES3_PASSWORD, iv);

  // AES-128-CBCで復号
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv },
    key,
    ciphertext
  );

  let result = new Uint8Array(decrypted);

  // gzip圧縮チェックと解凍
  if (isGzipped(result)) {
    result = pako.ungzip(result);
  }

  return result;
}

/**
 * ES3ファイルを暗号化（常にgzip圧縮）
 * @param data 暗号化するデータ
 * @returns 暗号化されたデータ（Uint8Array）
 */
export async function encryptES3(data: ArrayBuffer): Promise<Uint8Array> {
  let plainData = new Uint8Array(data);

  // 常にgzip圧縮
  plainData = pako.gzip(plainData);

  // ランダムなIVを生成
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // PBKDF2でキーを導出
  const key = await deriveKey(ES3_PASSWORD, iv);

  // AES-128-CBCで暗号化
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv },
    key,
    plainData
  );

  // IV + 暗号化データを結合
  const result = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), IV_LENGTH);

  return result;
}
