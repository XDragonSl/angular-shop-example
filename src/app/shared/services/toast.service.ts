import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

    constructor(private snackBar: MatSnackBar) {}

    show(message: string, action = 'Ok'):  MatSnackBarRef<TextOnlySnackBar> {
        return this.snackBar.open(message, action, {
            duration: 2000
        });
    }

    showDefaultError(): MatSnackBarRef<TextOnlySnackBar> {
        return this.show('Sorry, something went wrong, try again');
    }
}
