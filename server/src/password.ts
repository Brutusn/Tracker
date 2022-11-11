const { createHash } = require('crypto');
const jwt = require('jsonwebtoken');

const _config = require('../../config/server');

const hashString = (string: string): string => {
  const hash = createHash('sha256');
  return hash.update(string + _config.jwt_secret).digest('hex');
}

const hashedPassword = hashString(_config.password);

/**
 * Verifies the password given.
 * @param { string } password possible pass.
 * @returns { boolean }
 */
exports.verifyPassword = (password?: string): boolean => {
  if (!password) {
    return false;
  }

  const passAsHash = hashString(password);
  return hashedPassword === passAsHash;
}

/**
 * Creates access token.
 * @param { string } password correct password.
 * @returns { string }
 */
exports.createToken = (password: string): string => {
  return jwt.sign({ password: hashString(password), date: new Date() }, _config.jwt_secret);
}

const decode = (token, pass) => {
  try {
    return jwt.verify(token, pass);
  } catch (e) {
    return false;
  }
}

/**
 * Verifies the token given.
 * @param { string } token given token.
 * @returns { boolean }
 */
exports.verifyToken = (token: string): boolean => {
  const asObject = decode(token, _config.jwt_secret);

  if (!asObject) {
    return false;
  }

  return hashedPassword === asObject.password;
}