import { Component, OnInit } from '@angular/core';

import { LocationService } from '../shared/location.service';

import { environment } from '../../environments/environment';

import * as L from 'leaflet';
import { Position, PositionMapped } from '../shared/position';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private map;
  private markerLayer = L.featureGroup();

  private onlineCirle = {
    radius: 8,
    fillOpacity: 0.5,
  };
  private offLineCircle = {
    ...this.onlineCirle,
    color: '#F22613',
  }

  public autoZoom: boolean = true;

  constructor(private loc: LocationService) { }

  private handleError (error) {
    // For now...
    alert(error);
  }

  ngOnInit() {
    // Base coordinates go to the blokhut of Scouting Veghel
    this.map = L.map('tracker-map').setView([51.6267702062721, 5.522872209548951], 15);

    L.tileLayer(environment.map_url, {
        attribution: 'S5 StamTour Tracker'
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.markerLayer.on('click', (e) => this.markerClick(e));

    this.listenToPositions();
  }

  markerClick (layer) {
    this.map.setView(layer.latlng, 17);
  }

  createMarker (data: Position): any {
    const opts = data.online ? this.onlineCirle : this.offLineCircle;

    return L.circleMarker(data.position, opts)
      .bindTooltip(data.name);
  }

  handleCoordinates (data: PositionMapped) {
    this.markerLayer.clearLayers();

    Object.entries(data).forEach(([key, item]) => {
      this.markerLayer.addLayer(this.createMarker(item));
    });

    const bounds = this.markerLayer.getBounds();

    if (Object.keys(bounds).length > 0 && this.autoZoom === true) {
      this.map.fitBounds(bounds);
    }

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
