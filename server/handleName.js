const crypto = require('crypto');

// Add a date.. just as extra..
const hashString = (string) => {
  const hash = crypto.createHash('sha256');
  return hash.update('Make a token: ' + new Date() + string).digest('hex');
}

/**
 * Returns a new name and token based on the connected versions of it.
 * @param { object } connectedNames Object with all the connected users.
 * @param { string } name
 * @param { ?string } token Provided token is applicable
 * @param { ?number } suffix
 * @returns { array } [connectedNames, { name, token }]
 */
exports.handleName = (connectedNames, name, token = '', suffix = 0) => {
  const user = connectedNames[name];

  // User exists and has the correct token, send original details back.
  if (user === token) {
    return [
      connectedNames,
      {
        name,
        access_token: token
      }
    ]
  }

  // User exists but token is wrong, send back a new user.
  if (user && user !== token) {
    const n = name.includes('~') ? name.split('~')[0] : name;

    const suf = suffix === 0 ? '' : `~${suffix}`;
    const newName = n + suf;

    return exports.handleName(connectedNames, newName, hashString(newName), suffix + 1);
  }

  // In here the user didn't exist. So we create a new one.
  // Generate new token if it doesn't exist yet.
  const access_token = hashString(name);

  connectedNames[name] = access_token;

  return [
    connectedNames, 
    {
      name,
      access_token
    }
  ];
}