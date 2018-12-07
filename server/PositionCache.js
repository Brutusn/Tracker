//@ts-check
// Simple position class
module.exports = class PositionCache {
  constructor () {
    this.positions = {};
  }

  get getAll () {
    // This is the fallback name.. doesn't need to be send to the front...
    delete this.positions.__nameless__;

    return this.positions;
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
  }
};