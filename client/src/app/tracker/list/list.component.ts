import { Component, OnInit } from "@angular/core";

import { LocationService } from "@shared/location.service";
import { SocketService } from "@shared/websocket.service";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { locationArray } from "@shared/route";
import { ToastService } from "@shared/toast/toast.service";
import { tap } from "rxjs";
import { UserDto } from "../../../../../models/src/user";
import { DeleteUserDialogComponent } from "../delete-user-dialog/delete-user-dialog.component";
import { StartRouteDialogComponent } from "../start-route-dialog/start-route-dialog.component";

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
    private readonly matDialog: MatDialog,
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
    if (event) {
      event.preventDefault();
    }
    this.matDialog
      .open(DeleteUserDialogComponent, { data: user })
      .afterClosed()
      .pipe(
        tap((response?: "yes" | "no") => {
          if (response === "yes") {
            this.ws.emit("user-destroy", user.id);
          }
        }),
      )
      .subscribe();
  }

  startRouteFor(user: UserDto): void {
    this.matDialog
      .open(StartRouteDialogComponent)
      .afterClosed()
      .pipe(
        tap((response: number) => {
          if (response != null) {
            this.ws.emit("start-route", {
              userId: user.id,
              startAt: response,
            });
          }
        }),
      )
      .subscribe();
  }
}
