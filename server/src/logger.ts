const { currentTimeStamp } = require('./timestamp');
const { EOL } = require('os');

module.exports = class Logger {
  constructor(private readonly section: string) {}

  log(...message: string[]): void {
    console.log(`[${currentTimeStamp()}][${this.section}]`, ...message, EOL);
  }

  // Possible to extend with info, debug, warn, error...
}