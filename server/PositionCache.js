//@ts-check

const { handleName } = require('./handleName.js');

// Simple position class
module.exports = class PositionCache {
  constructor () {
    this.positions = {};
    this.users = {};
    this.sockets = {};
  }

  get getAll () {
    // This is the fallback name.. doesn't need to be send to the front...
    delete this.positions.__nameless__;

    return this.positions;
  }

  registerUser (name, token = '', socket) {
    const [users, nameObj] = handleName(this.users, name, token);

    this.users = users;

    // Add the socket.
    this.sockets[nameObj.name] = socket;

    return nameObj;
  }

  getSocketOfUser (user) {
    const socket = this.sockets[user];

    if (!socket) {
      return;
    }

    return socket;
  }

  userOffline (user) {
    if (this.positions[user]) {
      this.positions[user].online = false;
    }
  }

  addPosition (pos) {
    // will add or update the position.
    this.positions[pos.name] = pos;
    this.positions[pos.name].online = true;
  }

  removeUser (user) {
    if (this.positions[user] && this.positions[user].online === false) {
      delete this.positions[user];
    }
    if (this.users[user]) {
      delete this.users[user];
    }
  }
};