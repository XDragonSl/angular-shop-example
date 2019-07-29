import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material';

import { AuthenticationComponent } from './authentication/authentication.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private shopVersion = '008';

  title = 'Shop';
  
  user: any;
  
  constructor(public dialog: MatDialog) {}
  
  ngOnInit() {
      this.checkVersion();
      if (localStorage.token) {
          sessionStorage.token = localStorage.token;
      }
  }
  
  checkVersion(): void {
      if (localStorage.shopVersion !== this.shopVersion) {
          localStorage.clear();
          localStorage.shopVersion = this.shopVersion;
      }
  }
  
  auth(newUser: boolean): void {
      this.dialog.open(AuthenticationComponent, {
          minWidth: '250px',
          width: '50vw',
          data: newUser
      });
  }
  
  isAuth(): boolean {
      if (sessionStorage.token) {
          this.user = JSON.parse(atob(sessionStorage.token.split('.')[1]));
          return true;
      } else {
          return false;
      }
  }
  
  out(): void {
      delete localStorage.token;
      delete sessionStorage.token;
  }
}
