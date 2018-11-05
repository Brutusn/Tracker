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
            token: environment.ws_key
          }
        });
    }

    public onEvent(event: string): Observable<any> {
      return new Observable<Object>((observer) => {
        this.socket.on(event, (data: any) => observer.next(data));
      });
    }
}