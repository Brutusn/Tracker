const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../config/server');

const hashString = (string) => {
  const hash = crypto.createHash('sha256');
  return hash.update(string + config.jwt_secret).digest('hex');
}

const hashedPassword = hashString(config.password);

/**
 * Verifys the password given.
 * @param { string } password possible pass.
 * @returns { boolean }
 */
exports.verifyPassword = (password) => {
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
exports.createToken = (password) => {
  return jwt.sign({ password: hashString(password), date: new Date() }, config.jwt_secret);
}

const decode = (token, pass) => {
  try {
    return jwt.verify(token, pass);
  } catch (e) {
    return false;
  }
}

/**
 * Verifys the token given.
 * @param { string } token given token.
 * @returns { boolean }
 */
exports.verifyToken = (token) => {
  const asObject = decode(token, config.jwt_secret);

  if (!asObject) {
    return false;
  }

  return hashedPassword === asObject.password;
}