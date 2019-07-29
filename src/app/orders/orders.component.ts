import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfirmComponent } from '../confirm/confirm.component';
import { Product } from '../product';
import { ProductInBasket } from '../product-in-basket';
import { ProductService } from '../product.service';
import { Order } from '../order';
import { OrderTable } from '../order-table';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
    
    orders: Array<OrderTable>;
    displayOrders: Array<OrderTable>;
    error: any;
    pageEvent: PageEvent;

    defPageSize = 3;
    loaded = false;

    constructor(private productService: ProductService, private orderService: OrderService, public dialog: MatDialog, private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.getOrders();
    }
    
    getOrders(): void {
        this.orderService.getAll().pipe(catchError(err => {
            this.error = err;
            return of([]);
        })).subscribe((ords: Array<Order>) => {
            let num = 0;
            this.orders = [];
            for (let i = 0; i < ords.length; i++) {
                let ordT = new OrderTable();
                ordT._id = ords[i]._id;
                ordT.user = ords[i].user;
                this.orders.push(ordT); 
                this.convertOrder(ords[i], i, (prods: Array<ProductInBasket>, number: number) => {
                    this.orders[number].products = prods;
                    ++num;
                    if (num === ords.length) {
                        this.displayOrders = this.orders.slice(0, this.defPageSize);
                        this.loaded = true;
                    }
                });
            }
        });
    }
    
    convertOrder(order: Order, number: number, callback: any): void {
        let products = [];
        let num = 0;
        for (let j = 0; j < order.products.length; j++) {
            this.getProduct(order.products[j], (prod: Product) => {
                products.push(new ProductInBasket(prod));
                products[products.length - 1].number = +order.numbers[j];
                ++num;
                if (num === order.products.length) {
                    callback(products, number);
                }
            });
        }
    }
    
    getProduct(id: string, callback: any): void {
        this.productService.get(id).pipe(catchError(err => {
            this.error = err;
            return of({});
        })).subscribe((prod: Product) => {
            if (!this.error) {
                callback(prod);
            }
        });
    }
    
    getTotalCost(order: Array<ProductInBasket>): number {
        let sum = 0;
        for (let i = 0; i < order.length; i++) {
            sum += order[i].number * order[i].cost;
        }
        return sum;
    }
    
    setPage(): void {
        this.displayOrders = this.orders.slice(this.pageEvent.pageIndex * this.pageEvent.pageSize, this.pageEvent.pageIndex * this.pageEvent.pageSize + this.pageEvent.pageSize);
    }
    
    close(id: string): void {
        let dialogRef = this.dialog.open(ConfirmComponent, {
            minWidth: '200px',
            width: '20vw'
        });
        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.orderService.remove(id).pipe(catchError(err => {
                    this.error = err;
                    return of();
                })).subscribe(() => {
                    if (!this.error) {
                        this.snackBar.open('Successfully closed', 'Ok', {
                            duration: 2000
                        });
                        this.loaded = false;
                        this.getOrders();
                    }
                });
            }
        });
    }
}
