import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
    
    error: any;

    nameCtrl = new FormControl('', [Validators.required]);
    costCtrl = new FormControl('', [Validators.required, Validators.pattern(/^[+]?((\d+\.?\d*)|(\d*\.?\d+))$/), Validators.min(0.01)]);

    constructor(private productService: ProductService, private snackBar: MatSnackBar, public dialogRef: MatDialogRef<EditorComponent>, @Inject(MAT_DIALOG_DATA) public product: Product) { }
    
    ngOnInit() {
        if (this.product) {
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
        if (this.product){
            this.productService.update(this.product._id, {
                name: this.nameCtrl.value,
                cost: this.costCtrl.value
            }).pipe(catchError(err => {
                this.error = err;
                this.snackBar.open('Sorry, something went wrong, try again', 'Ok', {
                    duration: 2000
                });
                return of({});
            })).subscribe((prod: Product) => {
                if (!this.error) {
                    this.snackBar.open('Successfully updated', 'Ok', {
                        duration: 2000
                    });
                    this.dialogRef.close();
                }
                this.error = null;
            });
        } else {
            this.productService.create({
                name: this.nameCtrl.value,
                cost: this.costCtrl.value
            }).pipe(catchError(err => {
                this.error = err;
                this.snackBar.open('Sorry, something went wrong, try again', 'Ok', {
                    duration: 2000
                });
                return of({});
            })).subscribe((prod: Product) => {
                if (!this.error) {
                    this.snackBar.open('Successfully created', 'Ok', {
                        duration: 2000
                    });
                    this.dialogRef.close();
                }
                this.error = null;
            });
        }
    }
}
