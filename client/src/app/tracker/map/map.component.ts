import { Component, OnInit, OnDestroy } from "@angular/core";

import { LocationService } from "@shared/location.service";

import { Position, PositionMapped } from "@shared/position";
import { SocketService } from "@shared/websocket.service";
import * as L from "leaflet";

import { LeafletMap } from "@shared/leaflet-map.abstract";
import { locationArray, postArray, Route } from "@shared/route";
import { ToastService } from "@shared/toast/toast.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent extends LeafletMap implements OnInit, OnDestroy {
  private onlineCirle = {
    radius: 8,
    fillOpacity: 0.75,
    color: "#4d13d1",
  };
  private offLineCircle = {
    ...this.onlineCirle,
    color: "#F22613",
  };

  private readonly onDestroy$ = new Subject<void>();

  constructor(
    private readonly loc: LocationService,
    private readonly ws: SocketService,
    protected readonly ts: ToastService,
  ) {
    super(ts);
    this.ws
      .onEvent("user-destroyed")
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((name: string) => {
        this.markerLayer.removeLayer(this.markers[name]);

        this.setBounds();

        delete this.markers[name];
      });

    this.ws
      .onEvent("user-left")
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((name: string) => {
        const marker = this.markers[name];

        if (marker) {
          marker.setStyle(this.returnMarkerOpts(false));
        }
      });
  }

  private handleError(error) {
    this.ts.error(error.message || error);
  }

  private tooltipString(data: Position): string {
    const speed = Math.round(data.speed * 3.6);

    return `${data.name} (${speed} Km/h)`;
  }

  private returnMarkerOpts(online: boolean) {
    return online ? this.onlineCirle : this.offLineCircle;
  }

  ngOnInit() {
    super.ngOnInit();

    this.markerLayer.addTo(this.map);
    this.markerLayer.on("click", (e) => this.markerClick(e));

    L.circleMarker(LeafletMap.blokhut, {
      ...this.onlineCirle,
      color: "#2e3131",
    })
      .bindTooltip("Blokhut (HQ)", { permanent: true })
      .addTo(this.map);

    this.listenToPositions();

    // Show the locations
    const filteredArray = locationArray.filter((i) => i.skip !== true);
    locationArray.forEach((item: Route) => {
      const coord: L.LatLngExpression = [
        item.coord.latitude,
        item.coord.longitude,
      ];
      const code = item.code.toUpperCase();
      const indexOfFiltered =
        item.skip !== true
          ? `(${filteredArray.findIndex((i) => i.code === item.code) + 1})`
          : "";

      this.addPostCircle(coord, code, indexOfFiltered, "#f89406");
    });

    postArray.forEach((item: Route) => {
      const coord: L.LatLngExpression = [
        item.coord.latitude,
        item.coord.longitude,
      ];
      const code = item.code.toUpperCase();

      this.addPostCircle(coord, code, "", "#e47833");
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  private addPostCircle(
    coord: L.LatLngExpression,
    code: string,
    indexOfFiltered: string,
    color: string,
  ) {
    L.circleMarker(coord, {
      ...this.onlineCirle,
      color,
    })
      .bindTooltip(`${code} ${indexOfFiltered}`.trim(), { permanent: true })
      .addTo(this.map);
  }

  markerClick(event: any) {
    this.map.setView(event.latlng, 17);
  }

  createMarker(data: Position): any {
    const opts = data.online ? this.onlineCirle : this.offLineCircle;

    this.markers[data.name] = L.circleMarker(data.position, opts).bindTooltip(
      this.tooltipString(data),
      { permanent: true },
    );

    return this.markers[data.name];
  }

  markerHandler([key, item]) {
    // Only create a new marker if it's not yet known.
    const marker = this.markers[item.name];
    if (!marker) {
      this.markerLayer.addLayer(this.createMarker(item));
    } else {
      // Update the tooltip with the new speed.
      marker
        .setTooltipContent(this.tooltipString(item))
        .setLatLng(item.position)
        .setStyle(this.returnMarkerOpts(item.online));
    }
  }

  setBounds() {
    const bounds = this.markerLayer.getBounds();

    if (Object.keys(bounds).length > 0 && this.autoZoom === true) {
      this.map.fitBounds(bounds);
    }
  }

  handleCoordinates(data: PositionMapped) {
    Object.entries(data).forEach((entry) => this.markerHandler(entry));

    this.setBounds();
  }

  listenToPositions() {
    this.loc
      .getLocations()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (data: PositionMapped) => {
          this.handleCoordinates(data);
        },
        error: this.handleError,
      });
    this.loc
      .getNewLocation()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (data: PositionMapped) => {
          this.handleCoordinates(data);
        },
        error: this.handleError,
      });
  }
}
