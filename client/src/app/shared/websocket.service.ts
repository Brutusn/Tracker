import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as socketIo from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  private socketAnnouncedSubject = new Subject<any>();
  socketAnnounced = this.socketAnnouncedSubject.asObservable();

  public initSocket(limited = true, name?: string, access_token = ''): void {
    console.log('init socket');
    if (this.socket) {
      this.socket.close();
    }

    const token = limited ? environment.ws_key_lim : environment.ws_key;
    const query: any = {
      token,
      requestPositions: !limited,
    };

    if (name) {
      query.name = name;
      query.access_token = access_token;
    }

    this.socket = socketIo(environment.ws_url, { query });

    // TODO Notify to the tracker for offline states..
    // this.onEvent('connect_error').subscribe((error: Error) => {
    //   console.error(error);
    //   alert(error);
    // });

    // this.onEvent('growl').subscribe((msg) => {
    //   console.warn('GROWL:', msg);
    //   alert(msg);
    // });

    // Use latest token on reconnect.
    this.socket.on('reconnect_attempt', () => {
      this.socket.io.opts.query = {
        ...this.socket.io.opts.query,

        access_token: window.localStorage.getItem('access_token')
      };
    });

    this.announceSocket();
  }


  public announceSocket (): void {
    this.socketAnnouncedSubject.next();
  }

  public onEvent(event: string): Observable<any> {
    return new Observable<Object>((observer) => {
      this.socket.on(event, (data: any) => {
        console.log('Got message on:', event);
        return observer.next(data);
      });
    });
  }

  public emit(event: string, data) {
    console.log('Send message to:', event);
    this.socket.emit(event, data);
  }
}
