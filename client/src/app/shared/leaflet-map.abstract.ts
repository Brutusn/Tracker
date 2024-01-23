import { Directive, OnInit } from "@angular/core";

import { environment } from "@env/environment";

import * as L from "leaflet";
import { ToastService } from "./toast/toast.service";

@Directive()
export abstract class LeafletMap implements OnInit {
  static blokhut: L.LatLngExpression = [51.6267702062721, 5.522872209548951];
  protected readonly leaflet = L;

  protected mapId = "tracker-map";
  protected map: L.Map;
  protected markerLayer = this.leaflet.featureGroup();
  protected mapUrl = environment.map_url;
  protected readonly markers = {};

  autoZoom = false;

  constructor(protected readonly ts: ToastService) {}

  ngOnInit() {
    // Base coordinates go to the blokhut of Scouting Veghel
    this.map = L.map(this.mapId).setView(LeafletMap.blokhut, 15);

    L.tileLayer(this.mapUrl, {
      attribution: "S5 StamTour Tracker",
    }).addTo(this.map);
  }
}
