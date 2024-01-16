import { Component, OnInit, inject } from "@angular/core";
import { SocketService } from "@shared/websocket.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  protected readonly socketService = inject(SocketService);

  protected readonly thisYear = new Date().getFullYear();

  ngOnInit() {
    setTimeout(() => window.scrollTo(0, 1), 10);
  }
}
