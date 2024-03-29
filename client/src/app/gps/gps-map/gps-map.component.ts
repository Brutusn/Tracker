import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GeoService } from "@shared/geo.service";
import { LeafletMap } from "@shared/leaflet-map.abstract";
import { Coordinate, GeoRoute, locationArray } from "@shared/route";
import { ToastService } from "@shared/toast/toast.service";
import { SocketService } from "@shared/websocket.service";
import { convertDistance, getDistance } from "geolib";
import { CircleMarker, LatLngTuple, MapOptions } from "leaflet";
import { Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";

@Component({
  selector: "app-gps-map",
  templateUrl: "./gps-map.component.html",
  styleUrls: ["./gps-map.component.css"],
})
export class GpsMapComponent extends LeafletMap implements OnInit, OnChanges {
  protected readonly mapOptions: MapOptions = {
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
  };

  @Input() inGameMode = false;
  @Output() endFound = new EventEmitter<boolean>();

  codeWord: string;
  remainingDistance = "?";

  private readonly userCircle = {
    radius: 8,
    fillOpacity: 0.75,
    color: "#4d13d1",
  };
  private readonly goToCircle = {
    ...this.userCircle,
    color: "#2e3131",
  };
  private readonly userMarker = this.leaflet
    .circleMarker(LeafletMap.blokhut, this.userCircle)
    .bindTooltip("You", { permanent: true });
  private readonly goToMarker = this.leaflet.circleMarker(
    LeafletMap.blokhut,
    this.goToCircle,
  );

  private findRadius = 50;
  private waypoint = 0;
  private locations = locationArray;
  private readonly triggerLocation = locationArray.find((loc) => loc.isTrigger);

  constructor(
    protected readonly ts: ToastService,
    private readonly geo: GeoService,
    private ws: SocketService,
    private readonly destroyRef: DestroyRef,
  ) {
    super(ts);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.inGameMode && this.map) {
      this.setMode();
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.geoPositionSubscription();

    this.map.removeControl(this.map.zoomControl);

    this.markerLayer.addLayer(this.userMarker);
    this.markerLayer.addTo(this.map);

    this.setMode();
    this.placeGoToMarker(this.getWaypoint(0));

    this.ws
      .onEvent<number>("start-route")
      .pipe(
        tap((start) => this.setWaypoint(start)),
        map((start) => this.getWaypoint(start)),
        tap((route) => {
          this.codeWord = route.code;
          this.placeGoToMarker(route);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private getWaypoint(waypoint: string | number = 0): GeoRoute {
    const obj = this.locations[parseInt(waypoint as string, 10)];

    if (obj) {
      return obj;
    }

    return this.locations[0];
  }
  private setWaypoint(waypoint: string | number = 0) {
    const index = parseInt(waypoint as string, 10);
    const obj = this.locations[waypoint];
    const store = (wp: number) => {
      this.waypoint = wp;
      localStorage.setItem("waypoint", wp.toString());
    };

    if (!obj) {
      return;
    }

    store(index);
  }

  private placeMarker(latlng: LatLngTuple, marker: CircleMarker) {
    marker.setLatLng(latlng);
  }

  private setMode() {
    this.inGameMode ? this.setGameMode() : this.clearGameMode();
  }

  private setGameMode() {
    if (!this.markerLayer.hasLayer(this.goToMarker)) {
      this.markerLayer.addLayer(this.goToMarker);
    }
  }

  private clearGameMode() {
    this.markerLayer.removeLayer(this.goToMarker);
  }

  private placeGoToMarker(route: GeoRoute) {
    this.placeMarker(
      [route.coord.latitude, route.coord.longitude],
      this.goToMarker,
    );
  }

  private placeUserMarker(coords: Coordinate) {
    const lat = coords.latitude;
    const lng = coords.longitude;

    this.placeMarker([lat, lng], this.userMarker);
  }

  private fitMapToBounds() {
    const bounds = this.markerLayer.getBounds();

    this.map.fitBounds(bounds);
    this.goToMarker.setRadius(GpsMapComponent.radiusFrom(this.map.getZoom()));
  }

  private centerMapOnCoordinate(coords: Coordinate) {
    this.map.panTo([coords.latitude, coords.longitude]);
  }

  private geoPositionSubscription(): Subscription {
    return this.geo
      .watch()
      .pipe(
        map((position) => position.coords),
        map((coords) => {
          // Have to create the object. If passed on it results in a NaN
          return {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }),
        tap((coords) => {
          this.placeUserMarker(coords);
          this.handleCoords(coords);
          this.handleTriggerLocation(coords);

          if (this.inGameMode) {
            this.fitMapToBounds();
          } else {
            this.centerMapOnCoordinate(coords);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  foundWaypoint(distance: number) {
    if (distance < this.findRadius) {
      // Point found.. whoohoo!
      if (this.waypoint + 1 === this.locations.length) {
        // Endpoint is found!
        this.setWaypoint(this.waypoint + 1);
        this.endFound.emit(true);
      }

      if (this.waypoint + 1 < this.locations.length) {
        // Next point is also an object.. so use that one next.
        this.waypoint++;

        this.setWaypoint(this.waypoint);
        this.codeWord = this.locations[this.waypoint].code;
        this.placeGoToMarker(this.getWaypoint(this.waypoint));
      }
    }
  }

  private handleTriggerLocation(coords: Coordinate): void {
    const distance = getDistance(coords, this.triggerLocation.coord);

    if (distance < this.findRadius) {
      // Send emit message now.
      setTimeout(() => this.ws.emit("user-in-reach", { distance }), 500);
    }
  }

  handleCoords(coords: Coordinate) {
    const toLocation = this.getWaypoint(this.waypoint);
    // Have to create the object. If passed on it results in a NaN
    const distance = getDistance(coords, toLocation.coord);

    this.remainingDistance = GpsMapComponent.distanceToGo(distance);

    // And are we close enough?
    this.foundWaypoint(distance);
  }

  private static radiusFrom(zoom: number) {
    if (zoom < 11) {
      return 250;
    }

    switch (zoom) {
      case 11:
        return 200;
      case 12:
        return 175;
      case 13:
        return 150;
      case 14:
        return 125;
      case 15:
        return 100;
      case 16:
        return 75;
      case 17:
        return 50;
      case 18:
        return 25;
    }

    return 25;
  }

  private static distanceToGo(distance: number): string {
    const gt = distance > 1000;
    const convert = gt ? convertDistance(distance, "km") : Math.round(distance);
    const localNumber = convert.toLocaleString("nl-NL", {
      maximumSignificantDigits: 2,
    });
    const suffix = gt ? "km" : "m";

    return `${localNumber} ${suffix}`;
  }
}
