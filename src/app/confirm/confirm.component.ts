import { Component, Inject } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent {

    constructor(public dialogRef: MatDialogRef<ConfirmComponent>) { }
    
}
