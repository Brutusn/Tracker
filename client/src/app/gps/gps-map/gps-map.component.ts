import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LeafletMap } from '@shared/leaflet-map.abstract';
import { ToastService } from '@shared/toast/toast.service';
import { GeoService } from '@shared/geo.service';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-gps-map',
  templateUrl: './gps-map.component.html',
  styleUrls: ['./gps-map.component.css'],
})
export class GpsMapComponent extends LeafletMap implements OnInit, OnChanges {
  @Input() inGameMode = false;

  constructor (protected readonly ts: ToastService, private readonly geo: GeoService) {
    super(ts);
  }

  ngOnInit () {
    super.ngOnInit();
    this.subscriptions.add(this.geoPositionSubscription());
  }

  ngOnChanges (changes: SimpleChanges) {
    console.log(changes);
    if (changes.inGameMode) {
      if (changes.inGameMode.currentValue) {
        this.setGameMode();
      } else {
        this.clearGameMode();
      }
    }
  }

  private setGameMode () {

  }

  private clearGameMode () {

  }

  private fitMapToBounds (coords: Coordinates) {
    // For the game mode.
  }

  private centerMapOnCoordinate (coords: Coordinates) {
    const lat = coords.latitude;
    const lng = coords.longitude;

    this.map.panTo([lat, lng]);
  }

  private geoPositionSubscription (): Subscription {
    return this.geo.watch()
      .pipe(
        map((position) => position.coords),
        tap(console.log),
        tap((coords) => {
          if (this.inGameMode) {
            this.fitMapToBounds(coords);
          } else {
            this.centerMapOnCoordinate(coords);
          }
        }),
      ).subscribe();
  }

}
