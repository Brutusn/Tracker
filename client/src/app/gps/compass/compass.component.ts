import { Component, OnInit } from '@angular/core';
import { GeoService } from 'src/app/shared/geo.service';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.css']
})
export class CompassComponent implements OnInit {

  private lastHeading = 0;
  private cssVar = '--rotation';

  constructor (
    private geo: GeoService
  ) { }

  ngOnInit () {
    this.geo.watch().subscribe(({ coords }) => {
      this.handleCoords(coords);
    });
  }

  handleCoords ({ heading }: any) {
    if (heading || heading === 0) {
      this.lastHeading = 0;
    }

    document.documentElement.style.setProperty(this.cssVar, `${this.lastHeading}deg`);
  }
}
