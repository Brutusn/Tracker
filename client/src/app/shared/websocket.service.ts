import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { io as socketIo } from 'socket.io-client';

import { environment } from '../../environments/environment';
import { ToastService } from './toast/toast.service';
import { switchMap, take, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any;

  private socketAnnouncedSubject = new ReplaySubject<void>();
  socketAnnounced = this.socketAnnouncedSubject.asObservable();

  private readonly socketMap = new Map<string, Observable<any>>();

  constructor (
    private toast: ToastService,
    private router: Router,
  ) {}

  initSocket (limited = true, name?: string, access_token = ''): void {
    console.count('Init socket');
    if (this.socket) {
      this.socket.close();
    }

    const token = limited ? environment.ws_key_lim : environment.ws_key;
    const query: any = {
      token,
      requestPositions: !limited,
      admin_token: window.localStorage.getItem('admin_token'),
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

    this.onEvent('growl').subscribe((msg) => {
      this.toast.open(msg);
    });

    this.socket.on('error', (error: any) => {
      if (error === 'Unable to authenticate.') {
        this.toast.error(error);
        window.localStorage.removeItem('admin_token');
        this.router.navigate(['login']);
      }
    });

    // Use latest token on reconnect.
    this.socket.on('reconnect_attempt', () => {
      this.socket.io.opts.query = {
        ...this.socket.io.opts.query,

        access_token: window.localStorage.getItem('access_token'),
        admin_token: window.localStorage.getItem('admin_token'),
      };
    });

    this.announceSocket();
  }

  announceSocket (): void {
    this.socketAnnouncedSubject.next();
  }

  onEvent<T = any> (event: string): Observable<T> {
    return this.socketAnnounced
      .pipe(
        take(1),
        switchMap(() => this.eventObservable(event)),
      );
  }

  // This will stop adding multiple listerers for a single event.
  private eventObservable<T = any> (event: string): Observable<T> {
    if (this.socketMap.has(event)) {
      return this.socketMap.get(event);
    }

    const observable = new Observable<T>((observer) => {
      this.socket.on(event, (data: T) => {
        console.log('Got message on:', event);
        return observer.next(data);
      });
    }).pipe(share());

    this.socketMap.set(event, observable);
    return observable;
  }

  emit (event: string, data: any) {
    console.log('Send message to:', event);
    this.socket.emit(event, data);
  }
}
