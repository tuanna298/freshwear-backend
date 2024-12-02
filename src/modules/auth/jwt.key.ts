import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'node:path';

function checkExistFolder(name: string) {
  const checkPath = path.join(__dirname, `../../../${name}`);
  if (!fs.existsSync(checkPath)) fs.mkdir(checkPath, (err) => err);
}

function getAccessTokenKeyPair() {
  checkExistFolder('secure');
  const accessTokenPrivateKeyPath = path.join(
    __dirname,
    '../../../secure/access_token_private.key',
  );
  const accessTokenPublicKeyPath = path.join(
    __dirname,
    '../../../secure/access_token_public.key',
  );
  // Kiểm tra xem file khóa đã tồn tại chưa
  const accessTokenPrivateKeyExists = fs.existsSync(accessTokenPrivateKeyPath);
  const accessTokenPublicKeyExists = fs.existsSync(accessTokenPublicKeyPath);
  if (!accessTokenPrivateKeyExists || !accessTokenPublicKeyExists) {
    // Nếu file khóa không tồn tại, tạo cặp khóa mới
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Lưu khóa bí mật và khóa công khai vào file
    fs.writeFileSync(accessTokenPrivateKeyPath, privateKey);
    fs.writeFileSync(accessTokenPublicKeyPath, publicKey);
  }

  // Đọc khóa bí mật và khóa công khai từ file
  const accessTokenPrivateKey = fs.readFileSync(
    accessTokenPrivateKeyPath,
    'utf-8',
  );
  const accessTokenPublicKey = fs.readFileSync(
    accessTokenPublicKeyPath,
    'utf-8',
  );
  return {
    accessTokenPrivateKey,
    accessTokenPublicKey,
  };
}

function getRefreshTokenKeyPair() {
  checkExistFolder('secure');
  const refreshTokenPrivateKeyPath = path.join(
    __dirname,
    '../../../secure/refresh_token_private.key',
  );
  const refreshTokenPublicKeyPath = path.join(
    __dirname,
    '../../../secure/refresh_token_public.key',
  );
  // Kiểm tra xem file khóa đã tồn tại chưa
  const refreshTokenPrivateKeyExists = fs.existsSync(
    refreshTokenPrivateKeyPath,
  );
  const refreshTokenPublicKeyExists = fs.existsSync(refreshTokenPublicKeyPath);
  if (!refreshTokenPrivateKeyExists || !refreshTokenPublicKeyExists) {
    // Nếu file khóa không tồn tại, tạo cặp khóa mới
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Lưu khóa bí mật và khóa công khai vào file
    fs.writeFileSync(refreshTokenPrivateKeyPath, privateKey);
    fs.writeFileSync(refreshTokenPublicKeyPath, publicKey);
  }

  // Đọc khóa bí mật và khóa công khai từ file
  const refreshTokenPrivateKey = fs.readFileSync(
    refreshTokenPrivateKeyPath,
    'utf-8',
  );
  const refreshTokenPublicKey = fs.readFileSync(
    refreshTokenPublicKeyPath,
    'utf-8',
  );
  return {
    refreshTokenPrivateKey,
    refreshTokenPublicKey,
  };
}

export const { accessTokenPrivateKey, accessTokenPublicKey } =
  getAccessTokenKeyPair();
export const { refreshTokenPrivateKey, refreshTokenPublicKey } =
  getRefreshTokenKeyPair();
