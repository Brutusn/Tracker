import { Component, DestroyRef, OnInit } from "@angular/core";

import { LocationService } from "@shared/location.service";

import { BroadcastPositionDto } from "@shared/position";
import { SocketService } from "@shared/websocket.service";
import * as L from "leaflet";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LeafletMap } from "@shared/leaflet-map.abstract";
import { GeoRoute, locationArray, postArray } from "@shared/route";
import { ToastService } from "@shared/toast/toast.service";
import { User } from "@shared/user.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent extends LeafletMap implements OnInit {
  private onlineCirle = {
    radius: 8,
    fillOpacity: 0.75,
    color: "#4d13d1",
  };
  private offLineCircle = {
    ...this.onlineCirle,
    color: "#F22613",
  };

  constructor(
    private readonly loc: LocationService,
    private readonly ws: SocketService,
    protected readonly ts: ToastService,
    private readonly destroyRef: DestroyRef,
  ) {
    super(ts);
    this.ws
      .onEvent("user-destroyed")
      .pipe(takeUntilDestroyed())
      .subscribe((user: User) => {
        this.markerLayer.removeLayer(this.markers[user.id]);

        this.setBounds();

        delete this.markers[user.id];
      });

    this.ws
      .onEvent("user-left")
      .pipe(takeUntilDestroyed())
      .subscribe((user: User) => {
        const marker = this.markers[user.id];

        if (marker) {
          marker.setStyle(this.returnMarkerOpts(false));
        }
      });
  }

  private handleError(error) {
    this.ts.error(error.message || error);
  }

  private tooltipString(data: BroadcastPositionDto): string {
    const speed = Math.round(data.speed * 3.6);

    return `${data.user.name} (${speed} Km/h)`;
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
    locationArray.forEach((item: GeoRoute) => {
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

    postArray.forEach((item: GeoRoute) => {
      const coord: L.LatLngExpression = [
        item.coord.latitude,
        item.coord.longitude,
      ];
      const code = item.code.toUpperCase();

      this.addPostCircle(coord, code, "", "#e47833");
    });
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

  createMarker(data: BroadcastPositionDto): any {
    const opts = data.isOnline ? this.onlineCirle : this.offLineCircle;

    this.markers[data.user.id] = L.circleMarker(
      data.position,
      opts,
    ).bindTooltip(this.tooltipString(data), { permanent: true });

    return this.markers[data.user.id];
  }

  markerHandler(pos: BroadcastPositionDto) {
    if (!pos.position) return;

    // Only create a new marker if it's not yet known.
    const marker = this.markers[pos.user.id];
    if (!marker) {
      this.markerLayer.addLayer(this.createMarker(pos));
    } else {
      // Update the tooltip with the new speed.
      marker
        .setTooltipContent(this.tooltipString(pos))
        .setLatLng(pos.position)
        .setStyle(this.returnMarkerOpts(pos.isOnline));
    }
  }

  setBounds() {
    const bounds = this.markerLayer.getBounds();

    if (Object.keys(bounds).length > 0 && this.autoZoom === true) {
      this.map.fitBounds(bounds);
    }
  }

  handleCoordinates(data: BroadcastPositionDto[]) {
    data.forEach((entry) => this.markerHandler(entry));

    this.setBounds();
  }

  listenToPositions() {
    this.loc
      .getLocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.handleCoordinates(data);
        },
        error: this.handleError,
      });
  }
}
