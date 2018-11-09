import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable()
export class SocketService {
  private socket;

  public initSocket(name): void {
    console.log('init socket');
    if (this.socket) {
      this.socket.close();
    }
    this.socket = socketIo(environment.ws_url, {
      query: {
        token: environment.ws_key_lim,
        requestPositions: false,
        name
      }
    });

    this.onEvent('connect_error').subscribe((error: Error) => {
      console.error(error);
      alert(error);
    });

    this.onEvent('growl').subscribe((msg) => {
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

  public emit(event: string, data) {
    console.debug('Send message to:', event);
    this.socket.emit(event, data);
  }
}