import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  protected readonly thisYear = new Date().getFullYear();

  ngOnInit () {
    setTimeout(() => window.scrollTo(0, 1), 10);
  }
}
