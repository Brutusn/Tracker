import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { GeoService } from "@shared/geo.service";
import { SocketService } from "@shared/websocket.service";

import { ToastService } from "@shared/toast/toast.service";
import { UserService } from "@shared/user.service";

enum TrackingModes {
  /** The gps of the user is not yet enabled */
  NOT_STARTED,
  /** We are just following the user, the game mode is off. */
  TRACKING,
  /** Game mode on! */
  COMPASS,
}

@Component({
  selector: "app-body",
  templateUrl: "./body.component.html",
  styleUrls: ["./body.component.css"],
})
export class BodyComponent implements OnInit {
  readonly trackingModes = TrackingModes;
  tracking: TrackingModes = TrackingModes.NOT_STARTED;
  currentPosition = "wacht op locatie..";

  // TODO: Get this from the compass..
  currentPost = 0;

  private prefix = "Verbindingsfout:";
  private handleConnectError = (error: Error) => {
    console.error(error);

    const parseError = error.toString();

    this.toast.error(`${this.prefix} ${error.message ?? parseError}`);
  };

  constructor(
    private geo: GeoService,
    private ws: SocketService,
    private toast: ToastService,
    private readonly destroyRef: DestroyRef,
    private readonly userService: UserService,
  ) {
    this.ws
      .onEvent("error")
      .pipe(takeUntilDestroyed())
      .subscribe(this.handleConnectError);
    this.ws
      .onEvent("connect_error")
      .pipe(takeUntilDestroyed())
      .subscribe(this.handleConnectError);
    this.ws
      .onEvent("disconnect")
      .pipe(takeUntilDestroyed())
      .subscribe((reason) => {
        this.toast.error(`${this.prefix} ${reason}`);
      });

    this.ws
      .onEvent("growl")
      .pipe(takeUntilDestroyed())
      .subscribe((msg) => {
        console.warn("GROWL:", msg);
        this.toast.normal(`Server message: ${msg}`);
      });
    this.ws
      .onEvent("connect")
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.toast.info("Connection success");
      });
  }

  ngOnInit(): void {
    // Init the socket with the given username.
    this.ws.initSocket(true);
  }

  geoError(error: Error): void {
    // Silent error.
    console.error(error);
    // this.toast.error(error.message || "GPS Error");
  }

  start(): void {
    this.tracking = TrackingModes.TRACKING;

    this.sendPosition();

    this.ws
      .onEvent("start-route")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tracking = TrackingModes.COMPASS;
      });
  }

  onEndFound(found: boolean): void {
    if (found) {
      this.tracking = TrackingModes.TRACKING;
    }
  }

  sendPosition(): void {
    this.geo
      .watch()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ coords }) => {
          this.ws.emit("send-position", {
            userId: this.userService.user.id,
            position: [coords.latitude, coords.longitude],
            speed: coords.speed,
            heading: coords.heading,
            post: this.currentPost,
            waypoint: parseInt(localStorage.getItem("waypoint"), 10) ?? 0,
            gpsStarted: this.tracking === TrackingModes.COMPASS,
          });
        },
        error: (error) => this.geoError(error),
      });
  }
}
