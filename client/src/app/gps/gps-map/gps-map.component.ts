import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { LeafletMap } from '@shared/leaflet-map.abstract';
import { ToastService } from '@shared/toast/toast.service';
import { GeoService } from '@shared/geo.service';
import { Subscription } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';
import { CircleMarker, LatLngTuple } from 'leaflet';
import { Route, locationArray, Coordinate } from '@shared/route';
import { SocketService } from '@shared/websocket.service';
import * as geolib from 'geolib';

@Component({
  selector: 'app-gps-map',
  templateUrl: './gps-map.component.html',
  styleUrls: ['./gps-map.component.css'],
})
export class GpsMapComponent extends LeafletMap implements OnInit, OnChanges {
  @Input() inGameMode = false;
  @Output() endFound = new EventEmitter<boolean>();

  codeWord: string;
  remainingDistance = '?';

  private readonly userCircle = {
    radius: 8,
    fillOpacity: 0.75,
    color: '#4d13d1',
  };
  private readonly goToCircle = {
    ...this.userCircle,
    color: '#2e3131',
  };
  private readonly userMarker = this.leaflet
    .circleMarker(LeafletMap.blokhut, this.userCircle)
    .bindTooltip('You', { permanent: true });
  private readonly goToMarker = this.leaflet
    .circleMarker(LeafletMap.blokhut, this.goToCircle);

  private findRadius = 25;
  private waypoint = 0;
  private locations = locationArray;

  constructor (
    protected readonly ts: ToastService,
    private readonly geo: GeoService,
    private ws: SocketService,
    ) {
    super(ts);
  }

  ngOnChanges (changes: SimpleChanges) {
    if (changes.inGameMode && this.map) {
      this.setMode();
    }
  }

  ngOnInit () {
    super.ngOnInit();
    this.subscriptions.add(this.geoPositionSubscription());

    this.markerLayer.addLayer(this.userMarker);
    this.markerLayer.addLayer(this.goToMarker);

    this.setMode();
    this.placeGoToMarker(this.getWaypoint(0));

    this.ws.onEvent<number>('start-route')
      .pipe(
        take(1),
        tap((start) => this.setWaypoint(start)),
        map((start) => this.getWaypoint(start)),
        tap((route) => this.codeWord = route.code),
      ).subscribe();
  }

  private getWaypoint (waypoint: string | number = 0): Route {
    const obj = this.locations[parseInt(waypoint as string, 10)];

    if (obj) {
      return obj;
    }

    return this.locations[0];
  }
  private setWaypoint (waypoint: string | number = 0) {
    const index = parseInt(waypoint as string, 10);
    const obj = this.locations[waypoint];
    const store = (wp: number) => {
      this.waypoint = wp;
      localStorage.setItem('waypoint', wp.toString());
    };

    if (!obj) {
      return;
    }

    store(index);
  }

  private placeMarker (latlng: LatLngTuple, marker: CircleMarker) {
    marker.setLatLng(latlng as any);
  }

  private setMode () {
    this.inGameMode ? this.setGameMode() : this.clearGameMode();
  }

  private setGameMode () {
    this.markerLayer.addTo(this.map);
  }

  private clearGameMode () {
    this.map.removeLayer(this.markerLayer);
  }

  private placeGoToMarker (route: Route) {
    this.placeMarker([route.coord.latitude, route.coord.longitude], this.goToMarker);
  }

  private placeUserMarker (coords: Coordinates) {
      const lat = coords.latitude;
      const lng = coords.longitude;

      this.placeMarker([lat, lng], this.userMarker);
  }

  private fitMapToBounds () {
    const bounds = this.markerLayer.getBounds();

    this.map.fitBounds(bounds);
    this.goToMarker.setRadius(GpsMapComponent.radiusFrom(this.map.getZoom()));
  }

  private centerMapOnCoordinate (coords: Coordinates) {
    this.map.panTo([coords.latitude, coords.longitude]);
  }

  private geoPositionSubscription (): Subscription {
    return this.geo.watch()
      .pipe(
        map((position) => position.coords),
        tap((coords) => {
          this.placeUserMarker(coords);
          if (this.inGameMode) {
            this.handleCoords(coords);
            this.fitMapToBounds();
          } else {
            this.centerMapOnCoordinate(coords);
          }
        }),
      ).subscribe();
  }

  foundWaypoint (distance: number) {
    if (distance < this.findRadius) {
      // Point found.. whoohoo!
      if ((this.waypoint + 1) === this.locations.length) {
        // Endpoint is found!
        this.setWaypoint(this.waypoint + 1);
        this.endFound.emit(true);
      }

      if ((this.waypoint + 1) < this.locations.length) {
        // Next point is also an object.. so use that one next.
        this.waypoint++;

        this.setWaypoint(this.waypoint);
        this.codeWord = this.locations[this.waypoint].code;
      }
    }
  }

  handleCoords (coords: Coordinate) {
    const toLocation = this.getWaypoint(this.waypoint);

    const distance =  geolib.getDistance(coords, toLocation.coord, 1);
    this.remainingDistance = GpsMapComponent.distanceToGo(distance);

    // And are we close enough?
    this.foundWaypoint(distance);
  }

  private static radiusFrom (zoom: number) {
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

  private static distanceToGo (distance: number): string {
    const gt = distance > 1000;
    const convert = gt ? geolib.convertDistance(distance, 'km') : Math.round(distance);
    const suffix = gt ? 'km' : 'm';

    return `${convert} ${suffix}`;
  }
}
