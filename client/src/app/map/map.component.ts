import { Component, OnInit } from '@angular/core';

import { LocationService } from '../shared/location.service';

import { environment } from '../../environments/environment';

import * as L from 'leaflet';
import { Position, PositionMapped } from '../shared/position';
import { SocketService } from '../shared/websocket.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private map;
  private markerLayer = L.featureGroup();
  private blokhut: any = [51.6267702062721, 5.522872209548951];

  private markers = {};

  private onlineCirle = {
    radius: 8,
    fillOpacity: 0.75,
  };
  private offLineCircle = {
    ...this.onlineCirle,
    color: '#F22613',
  };

  public autoZoom = true;

  constructor(private loc: LocationService, private ws: SocketService) {
    this.ws.onEvent('user-destroyed').subscribe((name: string) => {
      this.markerLayer.removeLayer(this.markers[name]);

      this.setBounds();

      delete this.markers[name];
    });

    this.ws.onEvent('user-left').subscribe((name: string) => {
      const marker = this.markers[name];

      if (marker) {
        marker.setStyle(this.offLineCircle);
      }
    });
  }

  private handleError (error) {
    // For now...
    alert(error);
  }

  private tooltipString (data: Position): string {
    return `${data.name} (${data.speed} Km/h)`;
  }

  ngOnInit() {
    // Base coordinates go to the blokhut of Scouting Veghel
    this.map = L.map('tracker-map').setView(this.blokhut, 15);

    L.tileLayer(environment.map_url, {
        attribution: 'S5 StamTour Tracker'
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.markerLayer.on('click', (e) => this.markerClick(e));

    L.circleMarker(this.blokhut, {
      ...this.onlineCirle,
      color: '#2e3131',
    })
      .bindTooltip('Blokhut (HQ)')
      .addTo(this.map);

    this.listenToPositions();
  }

  markerClick (layer) {
    this.map.setView(layer.latlng, 17);
  }

  createMarker (data: Position): any {
    const opts = data.online ? this.onlineCirle : this.offLineCircle;

    this.markers[data.name] = L.circleMarker(data.position, opts)
      .bindTooltip(this.tooltipString(data));

    return this.markers[data.name];
  }

  markerHandler ([key, item]) {
    // Only create a new marker if it's not yet known.
    if (!this.markers[item.name]) {
      this.markerLayer.addLayer(this.createMarker(item));
    } else {
      // Update the tooltip with the new speed.
      this.markers[item.name].setTooltipContent(this.tooltipString(item));
      this.markers[item.name].setLatLng(item.position);
    }
  }

  setBounds () {
    const bounds = this.markerLayer.getBounds();

    if (Object.keys(bounds).length > 0 && this.autoZoom === true) {
      this.map.fitBounds(bounds);
    }
  }

  handleCoordinates (data: PositionMapped) {
    Object.entries(data).forEach(this.markerHandler.bind(this));

    this.setBounds();

    this.markerLayer.getLayers().forEach((layer) => layer.openTooltip());
  }

  listenToPositions () {
    this.loc.getLocations().subscribe((data: PositionMapped) => {
        this.handleCoordinates(data);
      },
      this.handleError
    );
    this.loc.getNewLocation().subscribe((data: PositionMapped) => {
        this.handleCoordinates(data);
      },
      this.handleError
    );
  }
}
