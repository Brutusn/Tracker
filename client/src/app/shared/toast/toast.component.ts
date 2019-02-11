import { Component, OnInit } from '@angular/core';

import { Toast } from './toast.interface';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {

  hasToast = false;
  toast: Toast;

  toastTimer = null;

  constructor(private ts: ToastService) { }

  ngOnInit() {
    this.ts.toasts.subscribe((toast: Toast) => {
      this.hasToast = true;
      this.toast = toast;

      console.log(toast);

      this.toastTimeout(toast.closeDelay);
    });
  }

  private toastTimeout(timeout: number) {
    if (this.toastTimer) {
      this.toastTimer.clearTimout();
    }

    this.toastTimer = setTimeout(() => {
      this.hasToast = false;
    }, timeout);
  }
}
