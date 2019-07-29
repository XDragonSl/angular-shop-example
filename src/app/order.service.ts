import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Order } from './order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
    
    private apiUri = 'https://mean-shop-example-api.herokuapp.com/api/orders/';

    constructor(private http: HttpClient) {}
    
    headers(): Object {
        return {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + sessionStorage.token
            })
        };
    }
    
    get(id: string): Observable<Order> {
        return this.http.get<Order>(this.apiUri + id, this.headers());
    }
    
    getAll(): Observable<Array<Order>> {
        return this.http.get<Array<Order>>(this.apiUri, this.headers());
    }
    
    create(Order: Order): Observable<Order> {
        return this.http.post<Order>(this.apiUri, Order, this.headers());
    }
    
    update(id: string, Order: Order): Observable<Order> {
        return this.http.put<Order>(this.apiUri + id, Order, this.headers());
    }
    
    remove(id: string): Observable<void> {
        return this.http.delete<void>(this.apiUri + id, this.headers());
    }
}
