import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material';

import { Authentication } from '../authentication';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent {

    name = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required, Validators.email]);
    password = new FormControl('', [Validators.required]);
    passwordHide = true;
    remember = true;
    
    constructor(private authenticationService: AuthenticationService, private snackBar: MatSnackBar, public dialogRef: MatDialogRef<AuthenticationComponent>, @Inject(MAT_DIALOG_DATA) public newUser: boolean) { }
    
    nameErrorMessages(): string {
        let message = '';
        if (this.name.hasError('required')) {
            message = 'This field is required'
        }
        return message;
    }

    emailErrorMessages(): string {
        let message = '';
        if (this.email.hasError('email')) {
            message = 'Not a valid email';
        } else if (this.email.hasError('required')) {
            message = 'This field is required'
        }
        return message;
    }

    passwordErrorMessages(): string {
        let message = '';
        if (this.password.hasError('required')) {
            message = 'This field is required'
        }
        return message;
    }
    
    disable(): boolean {
        if (this.newUser) {
            return this.name.invalid || this.email.invalid || this.password.invalid;
        } else {
            return this.email.invalid || this.password.invalid;
        }
    }
    
    auth(): void {
        if (this.newUser) {
            this.authenticationService.register(this.name.value, this.email.value, this.password.value).pipe(catchError(err => {
                let message = '';
                if (err.status === 401) {
                    message = err.error.message;
                } else {
                    message = 'Sorry, something went wrong, try again';
                }
                this.snackBar.open(message, 'Ok', {
                    duration: 2000
                });
                return of({});
            })).subscribe((auth: Authentication) => {
                if (auth.token) {
                    sessionStorage.token = auth.token;
                    if (this.remember) {
                        localStorage.token = sessionStorage.token;
                    }
                    this.dialogRef.close();
                }
            });
        } else {
            this.authenticationService.login(this.email.value, this.password.value).pipe(catchError(err => {
                let message = '';
                if (err.status === 401) {
                    message = err.error.message;
                } else {
                    message = 'Sorry, something went wrong, try again';
                }
                this.snackBar.open(message, 'Ok', {
                    duration: 2000
                });
                return of({});
            })).subscribe((auth: Authentication) => {
                if (auth.token) {
                    sessionStorage.token = auth.token;
                    if (this.remember) {
                        localStorage.token = sessionStorage.token;
                    }
                    this.dialogRef.close();
                }
            });
        }
    }
}
