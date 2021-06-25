import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../../shared/models/product';
import { ProductInBasket } from '../../shared/models/product-in-basket';
import { ProductService } from '../../shared/services/product.service';
import { Order } from '../../shared/models/order';
import { OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {

    products?: Array<ProductInBasket>;
    displayProducts?: Array<ProductInBasket>;
    loadedProducts?: Array<ProductInBasket>;
    error: any;
    ordErr: any;
    pageEvent?: PageEvent;

    sum = 0;
    defPageSize = 5;
    loaded = false;

    constructor(private productService: ProductService, private orderService: OrderService, private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.getProducts();
    }
    
    isAuth(): boolean {
        if (sessionStorage.token) {
            return true;
        } else {
            return false;
        }
    }
    
    getProducts(): void {
        let basket = (<any>Object).assign({}, localStorage);
        delete basket.shopVersion;
        delete basket.token;
        this.loadedProducts = [];
        let num = 0;
        if (Object.keys(basket).length === 0) {
            this.calculate();
            this.loaded = true;
        } else {
            for (let i = 0; i < Object.keys(basket).length; i++) {
                this.productService.get(Object.keys(basket)[i]).pipe(catchError(err => {
                    this.error = err;
                    return of({});
                })).subscribe((prod: Product) => {
                    if (!this.error) {
                        this.loadedProducts!.push(new ProductInBasket(prod));
                    }
                    ++num;
                    if (num === Object.keys(basket).length) {
                        this.calculate();
                        this.loaded = true;
                    }
                });
            }
        }
    }
    
    setPage(): void {
        this.displayProducts = this.products!.slice(this.pageEvent!.pageIndex * this.pageEvent!.pageSize, this.pageEvent!.pageIndex * this.pageEvent!.pageSize + this.pageEvent!.pageSize);
    }
    
    calculate(): void {
        let basket = (<any>Object).assign({}, localStorage);
        delete basket.shopVersion;
        this.products = [];
        this.sum = 0;
        for (let i = 0; i < this.loadedProducts!.length; i++) {
            this.loadedProducts![i].number = basket[this.loadedProducts![i]._id!] ? basket[this.loadedProducts![i]._id!] : 0;
            if (this.loadedProducts![i].number > 0) {
                this.products.push(this.loadedProducts![i]);
            }
            this.sum += this.loadedProducts![i].number * this.loadedProducts![i].cost!;
        }
        if (this.pageEvent) {
            this.setPage();
        } else {
            this.displayProducts = this.products.slice(0, this.defPageSize);
        }
    }
    
    decrease(name: string, id: string): void {
        if (+localStorage[id] > 1) {
            localStorage[id] = +localStorage[id] - 1;
        } else {
            delete localStorage[id];
        }
        this.snackBar.open('Number of ' + name + ' decreased in basket', 'Cancel', {
            duration: 2000
        }).onAction().subscribe(() => {
            if (!localStorage[id]) {
                localStorage[id] = 1;
            } else {
                localStorage[id] = +localStorage[id] + 1;
            }
            this.calculate();
        });
        this.calculate();
    }
    
    remove(name: string, id: string): void {
        let num = localStorage[id];
        delete localStorage[id];
        this.snackBar.open(name + ' removed from basket', 'Cancel', {
            duration: 2000
        }).onAction().subscribe(() => {
            localStorage[id] = num;
            this.calculate();
        });
        this.calculate();
    }
    
    clear(): void {
        let basket = (<any>Object).assign({}, localStorage);
        localStorage.clear();
        localStorage.shopVersion = basket.shopVersion;
        if (basket.token) {
            localStorage.token = basket.token;
        }
        this.snackBar.open('Basket cleared', 'Cancel', {
            duration: 2000
        }).onAction().subscribe(() => {
            for (let i in basket) {
                localStorage[i] = basket[i];
            }
            this.calculate();
        });
        this.calculate();
    }
    
    order(): void {
        let basket = (<any>Object).assign({}, localStorage);
        delete basket.shopVersion;
        delete basket.token;
        let nums = [];
        let order = new Order();
        if (Object.keys(basket).length === 0) {
            this.snackBar.open('Basket is emtpy, nothing to order!', 'Ok', {
                duration: 2000
            });
        } else {
            for (let i = 0; i < Object.keys(basket).length; i++) {
                nums.push(basket[Object.keys(basket)[i]]);
            }
            order.products = Object.keys(basket).join(',');
            order.numbers = nums.join(',');
            this.orderService.create(order).pipe(catchError(err => {
                this.ordErr = err;
                this.snackBar.open('Sorry, something went wrong, try again', 'Ok', {
                    duration: 2000
                });
                return of({});
            })).subscribe((ord: Order) => {
                if (!this.ordErr) {
                    this.snackBar.open('Order successfully submitted!', 'Ok', {
                        duration: 2000
                    });
                    let basket = (<any>Object).assign({}, localStorage);
                    localStorage.clear();
                    localStorage.shopVersion = basket.shopVersion;
                    if (basket.token) {
                        localStorage.token = basket.token;
                    }
                    this.calculate();
                } else {
                    this.ordErr = null;
                }
            });
        }
    }
}
