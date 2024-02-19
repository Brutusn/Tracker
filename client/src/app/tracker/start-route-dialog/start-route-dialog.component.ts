import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { locationArray } from "@shared/route";

@Component({
  selector: "app-start-route-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: "./start-route-dialog.component.html",
  styleUrl: "./start-route-dialog.component.css",
})
export class StartRouteDialogComponent {
  protected readonly locations = locationArray;
}
