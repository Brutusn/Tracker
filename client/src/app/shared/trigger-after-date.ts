import { interval, Observable } from 'rxjs';
import { filter, mapTo, startWith, take } from 'rxjs/operators';

/** Function that will return a false until the given date is passed. */
export function triggerAfterDate$(date: Date): Observable<boolean> {
  const time = date.getTime();

  return interval(1000).pipe(
    filter(() => time < now()),
    mapTo(true),
    take(1),
    startWith(time < now()),
  );
}

function now(): number {
  return new Date().getTime();
}
