import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  pass: string;

  constructor(
    private ts: ToastService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    if (!this.pass) {
      this.ts.error('Enter a password!');
    }

    console.log('hi');
    this.ts.normal('Logging in..');

    this.http
      .post(environment.ws_url + '/api/login', {
        password: this.pass
      }, {
        headers: { Authorization: `Bearer ${environment.ws_key}` }
      })
      .subscribe(
        (response) => this.handleSuccess(response),
        (error) => this.handleError(error)
      );

  }

  private handleSuccess (response) {
    window.sessionStorage.setItem('auth-token', response.access_token);

    this.ts.success('Loggin success!');
    this.router.navigate(['tracker']);
  }

  private handleError (error) {
    console.error(error);
    this.ts.error(error.error || error);
  }
}
