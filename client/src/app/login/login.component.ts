import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '@shared/toast/toast.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  pass: string;

  private httpSub: Subscription;

  constructor (
    private ts: ToastService,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnDestroy (): void {
    this.unsub();
  }

  onSubmit () {
    if (!this.pass) {
      this.ts.error('Enter a password!');
    }

    this.ts.normal('Logging in..');

    this.unsub();

    this.httpSub = this.http
      .post(environment.ws_url + '/api/login', {
        password: this.pass,
      }, {
        headers: { Authorization: `Bearer ${environment.ws_key}` },
      })
      .subscribe(
        (response) => this.handleSuccess(response),
        (error) => this.handleError(error),
      );

  }

  private unsub (): void {
    if (this.httpSub) {
      this.httpSub.unsubscribe();
    }
  }

  private handleSuccess (response) {
    window.localStorage.setItem('admin_token', response.access_token);

    this.ts.success('Loggin success!');
    this.router.navigate(['tracker']);
  }

  private handleError (error) {
    console.error(error);
    this.ts.error(error.error || error);
  }
}
