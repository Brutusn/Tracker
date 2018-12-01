import { Component, OnInit } from '@angular/core';

import NoSleep from 'nosleep.js';

@Component({
  selector: 'app-display-on',
  templateUrl: './display-on.component.html',
  styleUrls: ['./display-on.component.css']
})
export class DisplayOnComponent implements OnInit {
  
  public displayOn = false;

  private noSleep: any;

  constructor() { 
    this.noSleep = new NoSleep();
  }

  ngOnInit() {
  }

  setDisplayOn () {
    if (this.displayOn === true) {
      this.noSleep.enable();
    } else {
      this.noSleep.disable();
    }
  }

}
