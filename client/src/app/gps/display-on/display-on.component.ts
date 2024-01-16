import { Component, HostListener, OnInit } from "@angular/core";

import NoSleep from "nosleep.js";

@Component({
  selector: "app-display-on",
  templateUrl: "./display-on.component.html",
  styleUrls: ["./display-on.component.css"],
})
export class DisplayOnComponent implements OnInit {
  displayOn = false;

  private noSleep: any;

  // The no sleep option might stop working of the window loses focus. So now we set it visually!
  @HostListener("window:blur", ["$event"])
  stopNosleep() {
    this.displayOn = false;
    this.noSleep.disable();
  }

  constructor() {
    this.noSleep = new NoSleep();
  }

  ngOnInit() {}

  setDisplayOn() {
    if (this.displayOn === true) {
      this.noSleep.enable();
    } else {
      this.noSleep.disable();
    }
  }
}
