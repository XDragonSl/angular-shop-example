import { Component, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../../shared/interfaces/product.interface';
import { ProductInBasket } from '../../shared/models/product-in-basket.model';
import { ProductService } from '../../shared/services/product.service';
import { Order } from '../../shared/models/order.model';
import { OrderService } from '../../shared/services/order.service';
import { StateService } from '../../shared/services/state.service';
import { ToastService } from '../../shared/services/toast.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {

    products = new Array<ProductInBasket>();
    displayProducts = new Array<ProductInBasket>();
    loadedProducts = new Array<ProductInBasket>();
    sum = 0;
    defPageSize = 5;
    isAuth = false;
    loaded = false;

    constructor(
        private productService: ProductService,
        private orderService: OrderService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.getProducts();
        // FixMe implement without setInterval
        setInterval(() => {
            this.isAuth = StateService.isAuth();
        });
    }

    getProducts(): void {
        this.loaded = false;
        this.loadedProducts = new Array<ProductInBasket>();
        let basket = this.getBasket();
        let num = 0;
        if (Object.keys(basket).length === 0) {
            this.calculate();
            this.loaded = true;
        } else {
            for (let i = 0; i < Object.keys(basket).length; i++) {
                this.productService.get(Object.keys(basket)[i]).pipe(catchError(err => {
                    this.toastService.showDefaultError();
                    return throwError(err);
                })).subscribe((prod: Product) => {
                    this.loadedProducts.push(new ProductInBasket(prod));
                    ++num;
                    if (num === Object.keys(basket).length) {
                        this.calculate();
                        this.loaded = true;
                    }
                });
            }
        }
    }
    
    decrease(name: string, id: string): void {
        if (+localStorage[id] > 1) {
            localStorage[id] = +localStorage[id] - 1;
        } else {
            delete localStorage[id];
        }
        this.toastService.show(`Number of ${name} decreased in basket`, 'Cancel').onAction().subscribe(() => {
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
        this.toastService.show(`${name} removed from basket`, 'Cancel').onAction().subscribe(() => {
            localStorage[id] = num;
            this.calculate();
        });
        this.calculate();
    }
    
    clear(): void {
        let basket = this.getBasket();
        this.clearBasket();
        this.toastService.show('Basket cleared', 'Cancel').onAction().subscribe(() => {
            for (let i in basket) {
                localStorage[i] = basket[i]; // ToDo check hasOwnProperty
            }
            this.calculate();
        });
        this.calculate();
    }
    
    order(): void {
        let basket = this.getBasket();
        if (Object.keys(basket).length === 0) {
            this.toastService.show('Basket is empty, nothing to order!');
        } else {
            this.orderService.create(
                new Order(
                    Object.keys(basket).join(','),
                    Object.values(basket).join(',')
                )
            ).pipe(catchError(error => {
                this.toastService.showDefaultError();
                return throwError(error);
            })).subscribe((_: Order) => {
                this.toastService.show('Order successfully submitted!');
                this.clearBasket();
                this.calculate();
            });
        }
    }

    calculate(): void {
        let basket = this.getBasket();
        this.products = new Array<ProductInBasket>();
        this.sum = this.loadedProducts.reduce((sum: number, product: ProductInBasket, index: number) => {
            const count: number = basket[product._id!] ?? 0;
            this.loadedProducts[index].number = count;
            if (count > 0) {
                this.products.push(product);
            }
            return sum + product.number * product.cost;
        }, 0);
        this.displayProducts = this.products.slice(0, this.defPageSize);
    }

    getBasket(): any  {
        let basket = Object.assign({}, localStorage);
        delete basket.shopVersion;
        delete basket.token;
        return basket;
    }

    clearBasket(): void {
        let basket = Object.assign({}, localStorage);
        localStorage.clear();
        localStorage.shopVersion = basket.shopVersion;
        if (basket.token) {
            localStorage.token = basket.token;
        }
    }

    setPage(pageEvent: PageEvent): void {
        this.displayProducts = this.products.slice(
            pageEvent.pageIndex * pageEvent.pageSize,
            pageEvent.pageIndex * pageEvent.pageSize + pageEvent.pageSize
        );
    }
}
