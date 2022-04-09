import { Component } from '@angular/core';
import { triggerAfterDate$ } from '@shared/trigger-after-date';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly eveningRouteUnlocked$ = triggerAfterDate$(new Date(2022, 3, 9, 20, 0));
  readonly dayRouteUnlocked$ = triggerAfterDate$(new Date(2022, 3, 10, 8, 30));
}
