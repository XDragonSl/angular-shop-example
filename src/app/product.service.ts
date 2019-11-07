import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private apiUri = environment.apiUri + '/api/products/';

  constructor(private http: HttpClient) {}
  
  headers(): Object {
      return {
          headers: new HttpHeaders({
              'Authorization': 'Bearer ' + sessionStorage.token
          })
      };
  }
  
  get(id: string): Observable<Product> {
      return this.http.get<Product>(this.apiUri + id);
  }
  
  getAll(): Observable<Array<Product>> {
      return this.http.get<Array<Product>>(this.apiUri);
  }
  
  create(product: Product): Observable<Product> {
      return this.http.post<Product>(this.apiUri, product, this.headers());
  }
  
  update(id: string, product: Product): Observable<Product> {
      return this.http.put<Product>(this.apiUri + id, product, this.headers());
  }
  
  remove(id: string): Observable<void> {
      return this.http.delete<void>(this.apiUri + id, this.headers());
  }
}
