const crypto = require('crypto');

// Add a date.. just as extra..
const hashString = (string) => {
  const hash = crypto.createHash('sha256');
  return hash.update(new Date().toISOString() + string).digest('hex');
}

const connectedNames = {};

/**
 * Returns a new name and token based on the connected versions of it.
 * @param { string } name
 * @param { ?string } token Provided token is applicable
 * @param { ?number } suffix
 * @returns { object } { name, token }
 */
exports.handleName = (name, token = '', suffix = 0) => {
  // If username exists, but token is wrong..
  if (connectedNames[name] && connectedNames[name] !== token) {
    const n = name.includes('~') ? name.split('~')[0] : name;

    const suf = suffix === 0 ? '' : `~${suffix}`;
    const newName = n + suf;

    return exports.handleName(newName, hashString(newName), suffix + 1);
  }

  // Generate new token if it doesn't exist yet.
  const access_token = token !== '' ? token : hashString(name);

  connectedNames[name] = access_token;

  return {
    name,
    access_token
  }
}