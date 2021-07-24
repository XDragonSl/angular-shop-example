import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { ToastService } from '../../shared/services/toast.service';
import { ProductService } from '../../shared/services/product.service';
import { OrderService } from '../../shared/services/order.service';
import { OrderTable } from '../../shared/models/order-table.model';
import { ProductInBasket } from '../../shared/models/product-in-basket.model';
import { Order } from '../../shared/models/order.model';
import { Product } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

    orders = new Array<OrderTable>();
    displayOrders = new Array<OrderTable>();
    loadedProducts = new Array<Product>();
    defPageSize = 3;
    loaded = false;

    constructor(
        private productService: ProductService,
        private orderService: OrderService,
        private dialog: MatDialog,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.getOrders();
    }
    
    getOrders(): void {
        this.loaded = false;
        this.orderService.getAll().pipe(catchError(error => {
            this.toastService.showDefaultError();
            return throwError(error);
        })).subscribe((ords: Array<Order>) => {
            let num = 0;
            this.orders = new Array<OrderTable>();
            ords.forEach((order: Order) => {
                this.convertOrder(order, (prods: Array<ProductInBasket>) => {
                    this.orders.push(new OrderTable(order, prods));
                    ++num;
                    if (num === ords.length) {
                        this.displayOrders = this.orders.slice(0, this.defPageSize);
                        this.loaded = true;
                    }
                });
            });
        });
    }
    
    convertOrder(order: Order, callback: (products: Array<ProductInBasket>) => void): void {
        let products = new Array<ProductInBasket>();
        let num = 0;
        for (let j = 0; j < order.products.length; j++) {
            this.getProduct(order.products[j], (prod: Product) => {
                products.push(new ProductInBasket(prod, order.numbers[j] as number));
                ++num;
                if (num === order.products.length) {
                    callback(products);
                }
            });
        }
    }
    
    getProduct(id: string, callback: (prod: Product) => void): void {
        const foundProduct = this.loadedProducts.find((product: Product) => {
            return product._id === id;
        });
        if (foundProduct) {
            callback(foundProduct);
        } else {
            this.productService.get(id).pipe(catchError(err => {
                this.toastService.showDefaultError();
                return throwError(err);
            })).subscribe((prod: Product) => {
                this.loadedProducts.push(prod);
                callback(prod);
            });
        }
    }

    close(id: string): void {
        this.dialog.open(ConfirmComponent, {
            minWidth: '200px',
            width: '20vw'
        }).afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.orderService.remove(id).pipe(catchError(error => {
                    this.toastService.showDefaultError();
                    return throwError(error);
                })).subscribe(() => {
                    this.toastService.show('Successfully closed');
                    this.getOrders();
                });
            }
        });
    }
    
    getTotalCost(order: Array<ProductInBasket>): number {
        return order.reduce((sum: number, product: ProductInBasket) => {
            return sum + product.number * product.cost;
        }, 0);
    }

    setPage(pageEvent: PageEvent): void {
        this.displayOrders = this.orders.slice(
            pageEvent.pageIndex * pageEvent.pageSize,
            pageEvent.pageIndex * pageEvent.pageSize + pageEvent.pageSize
        );
    }
}
