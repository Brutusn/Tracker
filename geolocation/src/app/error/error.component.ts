import { Component, OnInit, Input } from '@angular/core';
import { SocketService } from '../shared/websocket.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  @Input() error = '';

  constructor(private ws: SocketService) { }

  private prefix = 'Verbindingsfout:';
  private handleConnectError = (error: Error) => {
    console.error(error);

    const parseError = error.toString();

    this.error = `${this.prefix} ${error.message || parseError}`;
  }

  ngOnInit() {
    this.ws.socketAnnounced.subscribe(() => {
      this.ws.onEvent('error').subscribe(this.handleConnectError);
      this.ws.onEvent('connect_error').subscribe(this.handleConnectError);
      this.ws.onEvent('disconnect').subscribe((reason) => {
        this.error = `${this.prefix} ${reason}`;
      });

      this.ws.onEvent('growl').subscribe((msg) => {
        console.warn('GROWL:', msg);
        this.error = `Server message: ${msg}`;
      });

      this.ws.onEvent('connect').subscribe(() => {
        this.error = '';
      });
    });
  }
}
