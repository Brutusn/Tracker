import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
      this.socket = socketIo(environment.ws_url, {
        query: {
          token: environment.ws_key,
          requestPositions: true
        }
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error(error);
        alert(error);
      });

      this.socket.on('growl', (msg) => {
        console.warn('GROWL:', msg);
        alert(msg);
      });
    }

    public onEvent(event: string): Observable<any> {
      return new Observable<Object>((observer) => {
        this.socket.on(event, (data: any) => {
          console.debug('Got message on:', event);
          return observer.next(data);
        });
      });
    }
}