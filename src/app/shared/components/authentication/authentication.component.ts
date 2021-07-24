import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Authentication } from '../../interfaces/authentication.interface';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['../../styles/_dialog.scss']
})
export class AuthenticationComponent {

    name = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required, Validators.email]);
    password = new FormControl('', [Validators.required]);
    passwordHide = true;
    remember = true;
    
    constructor(
        private authenticationService: AuthenticationService,
        private toastService: ToastService,
        private dialogRef: MatDialogRef<AuthenticationComponent>,
        @Inject(MAT_DIALOG_DATA) public newUser: boolean
    ) { }
    
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
        return this.newUser
            ? this.name.invalid || this.email.invalid || this.password.invalid
            : this.email.invalid || this.password.invalid;
    }
    
    auth(): void {
        if (this.newUser) {
            this.authenticationService
                .register(this.name.value, this.email.value, this.password.value)
                .pipe(catchError(error => {
                    error.status === 401 ? this.toastService.show(error.error.message) : this.toastService.showDefaultError();
                    return throwError(error);
                }))
                .subscribe((auth: Authentication) => {
                    sessionStorage.token = auth.token;
                    if (this.remember) {
                        localStorage.token = sessionStorage.token;
                    }
                    this.dialogRef.close();
                });
        } else {
            this.authenticationService
                .login(this.email.value, this.password.value)
                .pipe(catchError(error => {
                    error.status === 401 ? this.toastService.show(error.error.message) : this.toastService.showDefaultError();
                    return throwError(error);
                }))
                .subscribe((auth: Authentication) => {
                    sessionStorage.token = auth.token;
                    if (this.remember) {
                        localStorage.token = sessionStorage.token;
                    }
                    this.dialogRef.close();
                });
        }
    }
}
