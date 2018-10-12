//@ts-check
// Simple position class
module.exports = class PositionCache {
  constructor (options) {
    this.limit = options.positionLimit;
    this.positions = [];
  }

  getAll () {
    return this.positions;
  }

  checkLength () {
    if (this.positions.length > this.limit) {
      this.positions.shift();
      this.checkLength();
    }
  }

  addPosition (pos) {
    this.positions.push(pos);
    this.checkLength();
  }
};