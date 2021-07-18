import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { EditorComponent } from '../../shared/components/editor/editor.component';
import { ProductService } from '../../shared/services/product.service';
import { ToastService } from '../../shared/services/toast.service';
import { StateService } from '../../shared/services/state.service';
import { Product } from '../../shared/interfaces/product.interface';
import { User } from '../../shared/interfaces/user.interface';
import { Role } from '../../shared/enums/role.enum';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

    user?: User;

    role = Role;
    products = new Array<Product>();
    displayProducts = new Array<Product>();
    defPageSize = 5;
    isAuth = false;
    loaded = false;

    constructor(private productService: ProductService, private toastService: ToastService, public dialog: MatDialog) {}

    ngOnInit() {
        this.getProducts();
        // FixMe implement without setInterval
        setInterval(() => {
            this.isAuth = StateService.isAuth();
            this.user = StateService.getUser();
        });
    }

    getProducts(): void {
        this.loaded = false;
        this.productService.getAll().pipe(catchError(error => {
            this.toastService.showDefaultError();
            this.loaded = true;
            return throwError(error);
        })).subscribe((prods: Array<Product>) => {
            this.products = prods;
            this.displayProducts = this.products.slice(0, this.defPageSize);
            this.loaded = true;
        });
    }

    add(name: string, id: string): void {
        if (!localStorage[id]) {
            localStorage[id] = 1;
        } else {
            localStorage[id] = +localStorage[id] + 1;
        }
        this.toastService.show(`${name} added to basket`, 'Cancel').onAction().subscribe(() => {
            if (+localStorage[id] > 1) {
                localStorage[id] = +localStorage[id] - 1;
            } else {
                delete localStorage[id];
            }
        });
    }

    remove(id: string): void {
        this.dialog.open(ConfirmComponent, {
            minWidth: '200px',
            width: '20vw'
        }).afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.productService.remove(id).pipe(catchError(error => {
                    this.toastService.showDefaultError();
                    return throwError(error);
                })).subscribe(() => {
                    this.toastService.show('Successfully deleted');
                    this.getProducts();
                });
            }
        });
    }

    editor(prod: Product | null) {
        this.dialog.open(EditorComponent, {
            minWidth: '300px',
            width: '60vw',
            data: prod
        }).afterClosed().subscribe((cancel) => {
            if (!cancel) {
                this.getProducts();
            }
        });
    }

    setPage(pageEvent: PageEvent): void {
        this.displayProducts = this.products.slice(
            pageEvent.pageIndex * pageEvent.pageSize,
            pageEvent.pageIndex * pageEvent.pageSize + pageEvent.pageSize
        );
    }
}
