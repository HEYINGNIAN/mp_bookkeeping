// utils/crypto.js
// 简单的密码加密工具

// 简单的哈希函数，实际生产环境建议使用更安全的加密方式
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // 转换为16进制字符串
  return Math.abs(hash).toString(16);
}

// 生成随机盐值
function generateSalt() {
  return Math.random().toString(36).substring(2, 15);
}

// 加密密码（添加盐值并哈希）
function encryptPassword(password) {
  const salt = generateSalt();
  const hashedPassword = simpleHash(password + salt);
  return `${salt}:${hashedPassword}`;
}

// 验证密码
function verifyPassword(inputPassword, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const hashedInput = simpleHash(inputPassword + salt);
  return hashedInput === hash;
}

module.exports = {
  encryptPassword,
  verifyPassword
};