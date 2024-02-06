import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, ReplaySubject, fromEvent } from "rxjs";
import { ManagerOptions, io as socketIo } from "socket.io-client";

import { environment } from "@env/environment";
import { Toast } from "@shared/toast/toast.interface";
import { switchMap, take } from "rxjs/operators";
import { Socket, SocketOptions } from "socket.io-client/build/esm/socket";
import { ToastService } from "./toast/toast.service";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;

  private socketAnnouncedSubject = new ReplaySubject<void>(1);
  socketAnnounced = this.socketAnnouncedSubject.asObservable();

  private $isOnline = new BehaviorSubject(false);
  readonly isOnline$ = this.$isOnline.asObservable();

  constructor(
    private toast: ToastService,
    private router: Router,
  ) {}

  initSocket(limited = true): void {
    if (this.socket) {
      this.socket.close();
    }

    const token = limited ? environment.ws_key_lim : environment.ws_key;

    const socketOptions: Partial<ManagerOptions & SocketOptions> = {
      auth: {
        token,
        admin_token: window.localStorage.getItem("admin_token"),
        access_token: window.localStorage.getItem("access_token"),
      },
    };

    if (this.socket) {
      this.socket.disconnect();
    }

    // TODO SEND auth token via auth.token QUERY is te groot en dan faalt het.
    this.socket = socketIo(environment.ws_url, socketOptions);

    // TODO Notify to the tracker for offline states..
    // this.onEvent('connect_error').subscribe((error: Error) => {
    //   console.error(error);
    //   alert(error);
    // });

    this.onEvent<Toast>("growl").subscribe((msg) => {
      this.toast.open(msg);
    });

    this.socket.on("error", (error: any) => {
      if (error === "Unable to authenticate.") {
        this.toast.error(error);
        window.localStorage.removeItem("admin_token");
        this.router.navigate(["login"]);
      }
    });

    // Use latest token on reconnect.
    this.socket.on("reconnect_attempt", () => {
      this.socket.io.opts.query = {
        ...this.socket.io.opts.query,
      };
    });

    this.socket.on("connect", () => this.$isOnline.next(true));
    this.socket.on("disconnect", () => this.$isOnline.next(false));

    this.announceSocket();
  }

  announceSocket(): void {
    this.socketAnnouncedSubject.next();
  }

  onEvent<T = unknown>(event: string): Observable<T> {
    return this.socketAnnounced.pipe(
      take(1),
      switchMap(() => fromEvent<T>(this.socket, event)),
    );
  }

  emit(event: string, data: unknown) {
    console.log("Send message to:", event);
    this.socket.emit(event, data);
  }
}
