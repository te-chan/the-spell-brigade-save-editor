const crypto = require('crypto');
const zlib = require('zlib');
const fs = require('fs');

/**
 * ES3ファイルを復号する
 * - IVはデータの先頭16バイト
 * - キーはPBKDF2(password, IV, 100, 16, sha1)で導出
 * - AES-128-CBCで復号
 * - 復号後にgzip圧縮されていれば解凍
 */
function decryptES3(filePath, password) {
    const data = fs.readFileSync(filePath);
    console.log(`File: ${filePath}`);
    console.log(`Size: ${data.length} bytes`);
    console.log(`Password: ${password}\n`);

    // IVはデータの先頭16バイト
    const iv = data.subarray(0, 16);
    const encrypted = data.subarray(16);

    // PBKDF2でキーを導出（ソルト=IV, iterations=100, keylen=16, digest=sha1）
    const key = crypto.pbkdf2Sync(password, iv, 100, 16, 'sha1');

    // AES-128-CBCで復号
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // Gzipチェック（0x1F 0x8B）
    let wasGzipped = false;
    if (decrypted[0] === 0x1F && decrypted[1] === 0x8B) {
        console.log('Gzip detected, decompressing...');
        decrypted = zlib.gunzipSync(decrypted);
        wasGzipped = true;
    }

    const content = decrypted.toString('utf8');
    console.log('\n--- Decrypted Content ---');
    console.log(content);

    // ファイルに保存
    const outputPath = filePath.replace('.es3', '_decrypted.json');
    fs.writeFileSync(outputPath, content);
    console.log(`\nSaved to: ${outputPath}`);
    if (wasGzipped) {
        console.log('Note: File was gzipped. Remember to gzip when re-encrypting.');
    }

    return content;
}

/**
 * ES3ファイルを暗号化する
 */
function encryptES3(filePath, password, shouldGzip = false) {
    let data = fs.readFileSync(filePath);
    console.log(`File: ${filePath}`);
    console.log(`Size: ${data.length} bytes`);
    console.log(`Password: ${password}`);
    console.log(`Gzip: ${shouldGzip}\n`);

    // Gzip圧縮
    if (shouldGzip) {
        console.log('Compressing with gzip...');
        data = zlib.gzipSync(data);
    }

    // ランダムなIVを生成
    const iv = crypto.randomBytes(16);

    // PBKDF2でキーを導出
    const key = crypto.pbkdf2Sync(password, iv, 100, 16, 'sha1');

    // AES-128-CBCで暗号化
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);

    // ファイルに保存
    const outputPath = filePath.replace(/\.[^.]+$/, '.es3');
    fs.writeFileSync(outputPath, encrypted);
    console.log(`Saved to: ${outputPath}`);

    return encrypted;
}

// CLI
const args = process.argv.slice(2);
const command = args[0];
const filePath = args[1];
const password = args[2] || 'vhp*UCETJFwjE*8B!EPE';
const gzipFlag = args.includes('--gzip');

if (!command || !filePath) {
    console.log('Usage:');
    console.log('  node decrypt-es3.js decrypt <file.es3> [password]');
    console.log('  node decrypt-es3.js encrypt <file.json> [password] [--gzip]');
    console.log('\nDefault password: vhp*UCETJFwjE*8B!EPE');
    process.exit(1);
}

if (command === 'decrypt' || command === 'd') {
    decryptES3(filePath, password);
} else if (command === 'encrypt' || command === 'e') {
    encryptES3(filePath, password, gzipFlag);
} else {
    console.log(`Unknown command: ${command}`);
    process.exit(1);
}
