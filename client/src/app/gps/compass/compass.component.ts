import { Component, DestroyRef, Input, OnInit } from "@angular/core";
import { getDistance } from "geolib";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GeoService } from "@shared/geo.service";
import { Coordinate, GeoRoute, postArray } from "@shared/route";
import { SocketService } from "@shared/websocket.service";
import { filter, tap } from "rxjs/operators";

@Component({
  selector: "app-compass",
  templateUrl: "./compass.component.html",
  styleUrls: ["./compass.component.css"],
})
export class CompassComponent implements OnInit {
  @Input({ required: true }) readonly inGameMode: boolean = false;

  private lastHeading = 0;
  private readonly cssVar = "--rotation";

  private readonly triggerDistance = 75; // Meter
  private triggerLocation: GeoRoute = postArray.find((post) => post.isTrigger);

  constructor(
    private geo: GeoService,
    private ws: SocketService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.geo
      .watch()
      .pipe(
        filter(() => !this.inGameMode),
        tap(({ coords }) => {
          this.handleCoords(coords);
          this.checkForRouteStart(coords);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private handleCoords({ heading }: GeolocationCoordinates) {
    if (heading || heading === 0) {
      this.lastHeading = heading;
    }

    document.documentElement.style.setProperty(
      this.cssVar,
      `-${this.lastHeading}deg`,
    );
  }

  private checkForRouteStart(coords: GeolocationCoordinates) {
    const _coords: Coordinate = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const distance = getDistance(_coords, this.triggerLocation.coord);

    if (distance < this.triggerDistance) {
      // Send emit message now.
      setTimeout(() => this.ws.emit("user-in-reach", { distance }), 1000);
    }
  }
}
