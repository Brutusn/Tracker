import { currentTimeStamp } from './timestamp';
import { EOL } from 'os';

export class Logger {
  constructor(private readonly section: string) {}

  log(...message: string[]): void {
    console.log(`[${currentTimeStamp()}][${this.section}]`, ...message, EOL);
  }

  obj(obj: Record<string, unknown>): void {
    console.log(JSON.stringify(obj, null, 2));
  }

  // Possible to extend with info, debug, warn, error...
}