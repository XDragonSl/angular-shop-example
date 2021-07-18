import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./../../styles/dialog.scss']
})
export class EditorComponent implements OnInit{

    nameCtrl = new FormControl('', [Validators.required]);
    costCtrl = new FormControl('', [Validators.required,
                                                         Validators.pattern(/^[+]?((\d+\.?\d*)|(\d*\.?\d+))$/),
                                                         Validators.min(0.01)]);
    isNew = true;

    constructor(
        private productService: ProductService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<EditorComponent>,
        @Inject(MAT_DIALOG_DATA) private product: Product
    ) { }
    
    ngOnInit() {
        if (this.product) {
            this.isNew = false;
            this.nameCtrl.setValue(this.product.name);
            this.costCtrl.setValue(this.product.cost);
        }
    }
    
    nameErrorMessages(): string {
        let message = '';
        if (this.nameCtrl.hasError('required')) {
            message = 'This field is required'
        }
        return message;
    }
    
    costErrorMessages(): string {
        let message = '';
        if (this.costCtrl.hasError('required')) {
            message = 'This field is required'
        } else if (this.costCtrl.hasError('pattern')) {
            message = 'Not a valid number';
        } else if (this.costCtrl.hasError('min')) {
            message = 'Minimal value is 0.01';
        }
        return message;
    }
    
    disable(): boolean {
        return this.nameCtrl.invalid || this.costCtrl.invalid;
    }
    
    save(): void {
        if (this.isNew){
            this.productService.create({
                name: this.nameCtrl.value,
                cost: this.costCtrl.value
            }).pipe(catchError(err => {
                this.snackBar.open('Sorry, something went wrong, try again', 'Ok', {
                    duration: 2000
                });
                return throwError(err);
            })).subscribe((_: Product) => {
                this.snackBar.open('Successfully created', 'Ok', {
                    duration: 2000
                });
                this.dialogRef.close();
            });
        } else {
            this.productService.update(this.product._id!, {
                name: this.nameCtrl.value,
                cost: this.costCtrl.value
            }).pipe(catchError(err => {
                this.snackBar.open('Sorry, something went wrong, try again', 'Ok', {
                    duration: 2000
                });
                return throwError(err);
            })).subscribe((_: Product) => {
                this.snackBar.open('Successfully updated', 'Ok', {
                    duration: 2000
                });
                this.dialogRef.close();
            });
        }
    }
}
