import { createHash } from "crypto";
import jwt = require("jsonwebtoken");

import _config = require("../../config/server");

// TODO Create class!

const hashString = (string: string): string => {
  const hash = createHash("sha256");
  return hash.update(string + _config.jwt_secret).digest("hex");
};

const hashedPassword = hashString(_config.password);

/**
 * Verifies the password given.
 * @param { string } password possible pass.
 * @returns { boolean }
 */
export function verifyPassword(password?: string): boolean {
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
export function createToken(password: string): string {
  return jwt.sign(
    { password: hashString(password), date: new Date() },
    _config.jwt_secret,
  );
}

const decode = (token, pass) => {
  try {
    return jwt.verify(token, pass);
  } catch (e) {
    return false;
  }
};

/**
 * Verifies the token given.
 * @param { string } token given token.
 * @returns { boolean }
 */
export function verifyToken(token: string): boolean {
  const asObject = decode(token, _config.jwt_secret);

  if (!asObject) {
    return false;
  }

  return hashedPassword === asObject.password;
}
