import { Component, OnInit } from "@angular/core";

import { LocationService } from "@shared/location.service";
import { SocketService } from "@shared/websocket.service";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { locationArray } from "@shared/route";
import { ToastService } from "@shared/toast/toast.service";
import { tap } from "rxjs";
import { UserDto } from "../../../../../models/src/user";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.css"],
})
export class ListComponent implements OnInit {
  readonly listData$ = this.loc.getLocations();

  private locations = locationArray.filter((i) => i.skip !== true);
  totalPost = this.locations.length;

  constructor(
    private loc: LocationService,
    private ws: SocketService,
    private ts: ToastService,
  ) {
    this.ws
      .onEvent("user-joined")
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (name: string) => {
          this.ts.info(`Welcome "${name}"!`, "User joined!");
        },
      });
  }

  ngOnInit(): void {
    this.ws.socketAnnounced.pipe(
      tap(() => this.ws.emit("request-initial-users", null)),
    );
  }
  removeOffline(user: UserDto, event?: Event): void {
    const del = confirm(`Deleting ${user.name}.. You sure mate?!`);

    if (event) {
      event.preventDefault();
    }

    if (del) {
      this.ws.emit("user-destroy", user.id);
    }
  }

  startRouteFor(user: UserDto): void {
    const start = prompt("Vanaf welke post moet er gestart worden?", "0");
    const parsed = parseInt(start, 10);

    if (!start || isNaN(parsed)) {
      return;
    }

    const code = this.locations[parsed]
      ? this.locations[parsed].code.toUpperCase()
      : "Onbekend";
    const correct = confirm(`Dat is post: ${code}`);

    if (correct) {
      this.ws.emit("start-route", {
        userId: user.id,
        startAt: parsed,
      });
    }
  }
}
