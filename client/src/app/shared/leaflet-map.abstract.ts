import { OnInit, OnDestroy } from '@angular/core';
import { Position } from '@shared/position';

import { environment } from '@env/environment';

import * as L from 'leaflet';
import { LocationService } from './location.service';
import { ToastService } from './toast/toast.service';
import { Subscription } from 'rxjs';

export abstract class LeafletMap implements OnInit, OnDestroy {
  static blokhut: L.LatLngExpression = [51.6267702062721, 5.522872209548951];

  protected readonly subscriptions = new Subscription();
  protected readonly leaflet = L;

  protected mapId = 'tracker-map';
  protected map: L.Map;
  protected markerLayer = L.featureGroup();
  protected mapUrl = environment.map_url;

  autoZoom = true;

  constructor (
    protected readonly ts: ToastService,
  ) {}

  ngOnInit () {
    // Base coordinates go to the blokhut of Scouting Veghel
    this.map = L.map(this.mapId).setView(LeafletMap.blokhut, 15);

    L.tileLayer(this.mapUrl, {
        attribution: 'S5 StamTour Tracker',
    }).addTo(this.map);
  }

  ngOnDestroy () {
    this.subscriptions.unsubscribe();
  }

  static speedStringFrom (data: Position): string {
    const speed = Math.round(data.speed * 3.6);

    return `${data.name} (${speed} Km/h)`;
  }
 }
