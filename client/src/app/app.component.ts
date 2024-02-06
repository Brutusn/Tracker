import { Component, inject } from "@angular/core";
import { SocketService } from "@shared/websocket.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  protected readonly socketService = inject(SocketService);

  protected readonly thisYear = new Date().getFullYear();
}
