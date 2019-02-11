const crypto = require('crypto');

const config = require('../config/server');

const hashString = (string) => {
  const hash = crypto.createHash('sha256');
  return hash.update(string).digest('hex');
}

// TODO FIND CRYPTING METHODS
const encrypt = (object) => {
  return JSON.stringify(object);
}
const decrypt = (string) => {
  const asString = string;

  try {
    return JSON.parse(asString);
  } catch (e) {
    return false;
  }
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
  return encrypt({
    password: hashString(password),
    // Add a date.. just as extra..
    date: new Date()
  });
}
/**
 * Verifys the token given.
 * @param { string } token given token.
 * @returns { boolean }
 */
exports.verifyToken = (token) => {
  const asObject = decrypt(token);

  if (!asObject) {
    return false;
  }

  return hashedPassword === asObject.password;
}