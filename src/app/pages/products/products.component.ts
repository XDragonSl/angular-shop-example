import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { EditorComponent } from '../../shared/components/editor/editor.component';
import { Product } from '../../shared/models/product';
import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

    products?: Array<Product>;
    displayProducts?: Array<Product>;
    error: any;
    user: any;
    pageEvent?: PageEvent;

    defPageSize = 5;
    loaded = false;

    constructor(private productService: ProductService, private snackBar: MatSnackBar, public dialog: MatDialog) { }

    ngOnInit() {
        this.getProducts();
    }

    getProducts(): void {
        this.productService.getAll().pipe(catchError(err => {
            this.error = err;
            return of([]);
        })).subscribe((prods: Array<Product>) => {
            this.products = prods;
            this.displayProducts = this.products.slice(0, this.defPageSize);
            this.loaded = true;
        });
    }

    setPage(): void {
        this.displayProducts = this.products!.slice(this.pageEvent!.pageIndex * this.pageEvent!.pageSize, this.pageEvent!.pageIndex * this.pageEvent!.pageSize + this.pageEvent!.pageSize);
    }

    add(name: string, id: string): void {
        if (!localStorage[id]) {
            localStorage[id] = 1;
        } else {
            localStorage[id] = +localStorage[id] + 1;
        }
        this.snackBar.open(name + ' added to basket', 'Cancel', {
            duration: 2000
        }).onAction().subscribe(() => {
            if (+localStorage[id] > 1) {
                localStorage[id] = +localStorage[id] - 1;
            } else {
                delete localStorage[id];
            }
        });
    }

    remove(id: string): void {
        let dialogRef = this.dialog.open(ConfirmComponent, {
            minWidth: '200px',
            width: '20vw'
        });
        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.productService.remove(id).pipe(catchError(err => {
                    this.error = err;
                    return of();
                })).subscribe(() => {
                    if (!this.error) {
                        this.snackBar.open('Successfully deleted', 'Ok', {
                            duration: 2000
                        });
                        this.loaded = false;
                        this.getProducts();
                    }
                });
            }
        });
    }

    editor(prod: Product | null) {
        let dialogRef = this.dialog.open(EditorComponent, {
            minWidth: '300px',
            width: '60vw',
            data: prod
        });
        dialogRef.afterClosed().subscribe((cancel) => {
            if (!cancel) {
                this.loaded = false;
                this.getProducts();
            }
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
}
