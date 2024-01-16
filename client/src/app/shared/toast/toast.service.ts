import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Toast } from "./toast.interface";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts = this.toastSubject.asObservable();

  private defaults: Toast = {
    message: "",
    style: "normal",
    title: "",
    closeDelay: 3000,
  };

  constructor() {}

  open(options: Toast) {
    const opts = { ...this.defaults, ...options };

    this.toastSubject.next(opts);
  }

  // Wrappers..
  error(message: string, title = "") {
    this.open({
      message,
      style: "error",
      title,
    });
  }
  info(message: string, title = "") {
    this.open({
      message,
      style: "info",
      title,
    });
  }
  success(message: string, title = "") {
    this.open({
      message,
      style: "success",
      title,
    });
  }
  normal(message: string, title = "") {
    this.open({ message, title });
  }
}
