import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'tracker-client';

  ngOnInit () {
    setTimeout(() => window.scrollTo(0, 1), 10);
  }
}
