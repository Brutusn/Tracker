import { Component, OnInit } from '@angular/core';

import { LocationService } from '../shared/location.service';

import { environment } from '../../environments/environment';

import * as L from 'leaflet';
import { Position, PositionMapped } from '../shared/position';
import { SocketService } from '../shared/websocket.service';

import { locationArray, Route } from '../../../../shared/route';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private map;
  private markerLayer = L.featureGroup();
  private blokhut: L.LatLngExpression = [51.6267702062721, 5.522872209548951];

  private markers = {};

  private onlineCirle = {
    radius: 8,
    fillOpacity: 0.75,
    color: '#4d13d1',
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
        marker.setStyle(this.returnMarkerOpts(false));
      }
    });
  }

  private handleError (error) {
    // For now...
    alert(error);
  }

  private tooltipString (data: Position): string {
    const speed = Math.round(data.speed);

    return `${data.name} (${speed} Km/h)`;
  }

  private returnMarkerOpts (online: boolean) {
    return online ? this.onlineCirle : this.offLineCircle;
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
      .addTo(this.map)
      .openTooltip();

    this.listenToPositions();

    // Show the locations
    locationArray.forEach((item: Route) => {
      const coord: L.LatLngExpression = [item.coord.latitude, item.coord.longitude];

      L.circleMarker(coord, {
        ...this.onlineCirle,
        color: '#f89406',
      })
        .bindTooltip(atob(item.code))
        .addTo(this.map)
        .openTooltip();
    });
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

  setBounds () {
    const bounds = this.markerLayer.getBounds();

    if (Object.keys(bounds).length > 0 && this.autoZoom === true) {
      this.map.fitBounds(bounds);
    }
  }

  handleCoordinates (data: PositionMapped) {
    Object.entries(data).forEach((entry) => this.markerHandler(entry));

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
