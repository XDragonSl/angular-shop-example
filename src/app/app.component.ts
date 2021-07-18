import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { environment } from '../environments/environment';
import { AuthenticationComponent } from './shared/components/authentication/authentication.component';
import { StateService } from './shared/services/state.service';
import { User } from './shared/interfaces/user.interface';
import { Role } from './shared/enums/role.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    user?: User;

    role = Role;
    isAuth = false;

    constructor(private dialog: MatDialog) {}

    ngOnInit() {
        this.checkVersion();
        if (localStorage.token) {
            sessionStorage.token = localStorage.token;
        }
        // FixMe implement without setInterval
        setInterval(() => {
            this.isAuth = StateService.isAuth();
            this.user = StateService.getUser();
        });
    }

    checkVersion(): void {
        if (localStorage.shopVersion !== environment.shopVersion) {
            localStorage.clear();
            localStorage.shopVersion = environment.shopVersion;
        }
    }

    auth(newUser: boolean): void {
        this.dialog.open(AuthenticationComponent, {
            minWidth: '250px',
            width: '50vw',
            data: newUser
        });
    }

    out(): void {
        delete localStorage.token;
        delete sessionStorage.token;
    }
}
