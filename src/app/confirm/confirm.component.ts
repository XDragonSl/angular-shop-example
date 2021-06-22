import { Component, Inject } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html'
})
export class ConfirmComponent {
    constructor(public dialogRef: MatDialogRef<ConfirmComponent>) { }
}
