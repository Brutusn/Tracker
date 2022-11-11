const { currentTimeStamp } = require('./timestamp.js');
const { EOL } = require('os');

module.exports = class Logger {
  #_section;

  /** @param { string } section */
  constructor(section) {
    this.#_section = section;
  }

  /**
    * @param { string | string[] } message
    * @returns void
    */
  log(...message) {
    console.log(`[${currentTimeStamp()}][${this.#_section}]`, ...message, EOL);
  }

  // Possible to extend with info, debug, warn, error...
}